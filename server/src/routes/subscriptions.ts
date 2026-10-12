import { Router, Response } from 'express';
import { z } from 'zod';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Nothing on this router charges anyone. /create writes status = 'active'
// straight to the database and no payment processor sits behind it -- the
// Subscribe button is the entire checkout. (/upgrade and /purchase did the
// same, /purchase at a price taken from the request body; nothing called them
// and they were removed on 2026-10-12.) Gated by
// environment rather than removed, the same way public sign-up is in auth.ts,
// so a real integration can open it again without a code change.
const billingOpen = process.env.ALLOW_BILLING === 'true';
const BILLING_CLOSED = { error: 'Payments are currently unavailable' };

// Get all available subscription plans
router.get('/plans', async (req, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, display_name, description, price_monthly, price_yearly, features, is_active
       FROM subscription_plans
       WHERE is_active = true
       ORDER BY price_monthly ASC`
    );

    res.json({
      success: true,
      plans: result.rows.map(plan => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.display_name,
        description: plan.description,
        priceMonthly: parseFloat(plan.price_monthly),
        priceYearly: plan.price_yearly ? parseFloat(plan.price_yearly) : null,
        features: plan.features,
        isActive: plan.is_active
      }))
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Create subscription
router.post('/create', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!billingOpen) {
    return res.status(403).json(BILLING_CLOSED);
  }

  try {
    const userId = req.userId;
    const { planId, billingPeriod = 'monthly' } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    // Get plan details
    const planResult = await pool.query(
      `SELECT id, name, price_monthly, price_yearly FROM subscription_plans WHERE id = $1 AND is_active = true`,
      [planId]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const plan = planResult.rows[0];

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    if (billingPeriod === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingPeriod === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Cancel any existing active subscriptions
    await pool.query(
      `UPDATE subscriptions 
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    // Create new subscription
    const result = await pool.query(
      `INSERT INTO subscriptions (
        user_id, plan_id, status, billing_period, start_date, end_date
      )
      VALUES ($1, $2, 'active', $3, $4, $5)
      RETURNING id, user_id, plan_id, status, billing_period, start_date, end_date, created_at`,
      [userId, planId, billingPeriod, startDate, endDate]
    );

    // Update user's current subscription reference
    await pool.query(
      `UPDATE users SET current_subscription_id = $1 WHERE id = $2`,
      [result.rows[0].id, userId]
    );

    res.status(201).json({
      success: true,
      subscription: {
        id: result.rows[0].id,
        planId: result.rows[0].plan_id,
        status: result.rows[0].status,
        billingPeriod: result.rows[0].billing_period,
        startDate: result.rows[0].start_date,
        endDate: result.rows[0].end_date
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Check subscription status (helper endpoint)
router.get('/check', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const result = await pool.query('SELECT * FROM check_subscription_status($1)', [userId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        isPremium: false,
        planName: 'free',
        status: 'active'
      });
    }

    const status = result.rows[0];
    res.json({
      success: true,
      isPremium: status.is_premium,
      planName: status.plan_name,
      status: status.status,
      endDate: status.end_date
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

// Get user's tier info
router.get('/tier', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const result = await pool.query('SELECT * FROM get_user_tier_info($1)', [userId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        tierId: 'free',
        planName: 'free',
        isPremium: false,
        features: []
      });
    }

    const tierInfo = result.rows[0];
    res.json({
      success: true,
      tierId: tierInfo.tier_id,
      planName: tierInfo.plan_name,
      isPremium: tierInfo.is_premium,
      features: tierInfo.features
    });
  } catch (error) {
    console.error('Error getting tier info:', error);
    res.status(500).json({ error: 'Failed to get tier info' });
  }
});

// Get/Update white label config (Pro users only)
router.get('/white-label', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Check if user is Pro
    const tierResult = await pool.query('SELECT * FROM get_user_tier_info($1)', [userId]);
    if (tierResult.rows.length === 0 || tierResult.rows[0].tier_id !== 'pro') {
      return res.status(403).json({ error: 'White label is only available for Pro users' });
    }

    const result = await pool.query(
      `SELECT company_name, logo_url, primary_color, contact_info, disclaimer, is_active
       FROM white_label_configs
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      config: result.rows[0] ? {
        companyName: result.rows[0].company_name,
        logoUrl: result.rows[0].logo_url,
        primaryColor: result.rows[0].primary_color,
        contactInfo: result.rows[0].contact_info,
        disclaimer: result.rows[0].disclaimer,
        isActive: result.rows[0].is_active
      } : null
    });
  } catch (error) {
    console.error('Error getting white label config:', error);
    res.status(500).json({ error: 'Failed to get white label config' });
  }
});

// Every field here is rendered into white-label reports, so the bounds matter
// more than the types: a logo URL has to be an http(s) URL and a colour has to
// be a hex colour, not arbitrary text that ends up in a document.
const whiteLabelSchema = z.object({
  companyName: z.string().trim().min(1).max(100),
  logoUrl: z.string().trim().url().max(500).refine((u) => /^https?:\/\//i.test(u)).optional().nullable(),
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  contactInfo: z.string().trim().max(500).optional().nullable(),
  disclaimer: z.string().trim().max(2000).optional().nullable(),
  isActive: z.boolean().default(true),
});

router.put('/white-label', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const parsed = whiteLabelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid white label config', details: parsed.error.issues });
    }
    const { companyName, logoUrl, primaryColor, contactInfo, disclaimer, isActive } = parsed.data;

    // Check if user is Pro
    const tierResult = await pool.query('SELECT * FROM get_user_tier_info($1)', [userId]);
    if (tierResult.rows.length === 0 || tierResult.rows[0].tier_id !== 'pro') {
      return res.status(403).json({ error: 'White label is only available for Pro users' });
    }

    const result = await pool.query(
      `INSERT INTO white_label_configs (user_id, company_name, logo_url, primary_color, contact_info, disclaimer, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         company_name = EXCLUDED.company_name,
         logo_url = EXCLUDED.logo_url,
         primary_color = EXCLUDED.primary_color,
         contact_info = EXCLUDED.contact_info,
         disclaimer = EXCLUDED.disclaimer,
         is_active = EXCLUDED.is_active,
         updated_at = CURRENT_TIMESTAMP
       RETURNING company_name, logo_url, primary_color, contact_info, disclaimer, is_active`,
      [userId, companyName, logoUrl, primaryColor, contactInfo, disclaimer, isActive]
    );

    res.json({
      success: true,
      config: {
        companyName: result.rows[0].company_name,
        logoUrl: result.rows[0].logo_url,
        primaryColor: result.rows[0].primary_color,
        contactInfo: result.rows[0].contact_info,
        disclaimer: result.rows[0].disclaimer,
        isActive: result.rows[0].is_active
      }
    });
  } catch (error) {
    console.error('Error updating white label config:', error);
    res.status(500).json({ error: 'Failed to update white label config' });
  }
});

export default router;

