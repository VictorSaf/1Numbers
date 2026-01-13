import { Router, Response } from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

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

// Get current user's subscription status
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT 
        s.id,
        s.status,
        s.billing_period,
        s.start_date,
        s.end_date,
        s.cancelled_at,
        sp.name as plan_name,
        sp.display_name as plan_display_name,
        sp.features
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // User has no subscription, return free plan
      const freePlan = await pool.query(
        `SELECT id, name, display_name, features FROM subscription_plans WHERE name = 'free' LIMIT 1`
      );

      return res.json({
        success: true,
        subscription: null,
        plan: freePlan.rows[0] ? {
          name: freePlan.rows[0].name,
          displayName: freePlan.rows[0].display_name,
          features: freePlan.rows[0].features
        } : null,
        isPremium: false
      });
    }

    const subscription = result.rows[0];
    const isActive = subscription.status === 'active' && 
                     (subscription.end_date === null || new Date(subscription.end_date) > new Date());

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        billingPeriod: subscription.billing_period,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        cancelledAt: subscription.cancelled_at
      },
      plan: {
        name: subscription.plan_name,
        displayName: subscription.plan_display_name,
        features: subscription.features
      },
      isPremium: isActive && subscription.plan_name !== 'free'
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// Create subscription
router.post('/create', authenticateToken, async (req: AuthRequest, res: Response) => {
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

// Cancel subscription
router.post('/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `UPDATE subscriptions 
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND status = 'active'
       RETURNING id, status, cancelled_at`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        cancelledAt: result.rows[0].cancelled_at
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
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

// Check feature usage limit
router.get('/feature/:featureId/check', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { featureId } = req.params;
    const limit = parseInt(req.query.limit as string) || -1;

    const result = await pool.query(
      'SELECT * FROM check_feature_limit($1, $2, $3)',
      [userId, featureId, limit]
    );

    const usage = result.rows[0];
    res.json({
      success: true,
      allowed: usage.allowed,
      currentUsage: usage.current_usage,
      limit: usage.limit_value === -1 ? 'unlimited' : usage.limit_value
    });
  } catch (error) {
    console.error('Error checking feature limit:', error);
    res.status(500).json({ error: 'Failed to check feature limit' });
  }
});

// Increment feature usage
router.post('/feature/:featureId/use', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { featureId } = req.params;

    const result = await pool.query(
      'SELECT increment_feature_usage($1, $2) as new_count',
      [userId, featureId]
    );

    res.json({
      success: true,
      newCount: result.rows[0].new_count
    });
  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    res.status(500).json({ error: 'Failed to increment feature usage' });
  }
});

// Get feature usage summary
router.get('/usage', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT feature_id, usage_count, period_start, period_end
       FROM feature_usage
       WHERE user_id = $1
         AND period_start <= CURRENT_DATE
         AND period_end >= CURRENT_DATE
       ORDER BY feature_id`,
      [userId]
    );

    res.json({
      success: true,
      usage: result.rows.map(row => ({
        featureId: row.feature_id,
        usageCount: row.usage_count,
        periodStart: row.period_start,
        periodEnd: row.period_end
      }))
    });
  } catch (error) {
    console.error('Error getting usage summary:', error);
    res.status(500).json({ error: 'Failed to get usage summary' });
  }
});

// Get user's purchases
router.get('/purchases', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT id, product_id, product_name, price, currency, status, metadata, purchased_at, expires_at
       FROM one_time_purchases
       WHERE user_id = $1
       ORDER BY purchased_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      purchases: result.rows.map(row => ({
        id: row.id,
        productId: row.product_id,
        productName: row.product_name,
        price: parseFloat(row.price),
        currency: row.currency,
        status: row.status,
        metadata: row.metadata,
        purchasedAt: row.purchased_at,
        expiresAt: row.expires_at
      }))
    });
  } catch (error) {
    console.error('Error getting purchases:', error);
    res.status(500).json({ error: 'Failed to get purchases' });
  }
});

// Create one-time purchase
router.post('/purchase', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { productId, productName, price, currency = 'EUR', metadata = {} } = req.body;

    if (!productId || !productName || !price) {
      return res.status(400).json({ error: 'Product ID, name, and price are required' });
    }

    // TODO: Integrate with payment processor (Stripe, etc.)
    // For now, create the purchase record

    const result = await pool.query(
      `INSERT INTO one_time_purchases (user_id, product_id, product_name, price, currency, metadata, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed')
       RETURNING id, product_id, product_name, price, currency, status, purchased_at`,
      [userId, productId, productName, price, currency, metadata]
    );

    res.status(201).json({
      success: true,
      purchase: {
        id: result.rows[0].id,
        productId: result.rows[0].product_id,
        productName: result.rows[0].product_name,
        price: parseFloat(result.rows[0].price),
        currency: result.rows[0].currency,
        status: result.rows[0].status,
        purchasedAt: result.rows[0].purchased_at
      }
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ error: 'Failed to create purchase' });
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

router.put('/white-label', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { companyName, logoUrl, primaryColor, contactInfo, disclaimer, isActive = true } = req.body;

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

// Upgrade subscription
router.post('/upgrade', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { targetTierId, billingPeriod = 'yearly' } = req.body;

    if (!targetTierId) {
      return res.status(400).json({ error: 'Target tier ID is required' });
    }

    // Get target plan
    const planResult = await pool.query(
      `SELECT id, name, price_monthly, price_yearly FROM subscription_plans WHERE tier_id = $1 AND is_active = true`,
      [targetTierId]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Target tier not found' });
    }

    const targetPlan = planResult.rows[0];

    // Get current subscription
    const currentResult = await pool.query(
      `SELECT s.id, s.end_date, sp.price_monthly, sp.price_yearly
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.user_id = $1 AND s.status = 'active'
       LIMIT 1`,
      [userId]
    );

    // Calculate prorated amount (simplified)
    let proratedAmount = 0;
    if (currentResult.rows.length > 0) {
      const current = currentResult.rows[0];
      const remainingDays = Math.max(0, Math.ceil(
        (new Date(current.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ));
      const dailyRate = billingPeriod === 'yearly'
        ? parseFloat(current.price_yearly || current.price_monthly * 12) / 365
        : parseFloat(current.price_monthly) / 30;
      proratedAmount = dailyRate * remainingDays;
    }

    // Cancel current and create new subscription
    await pool.query(
      `UPDATE subscriptions SET status = 'upgraded', cancelled_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    const startDate = new Date();
    const endDate = new Date();
    if (billingPeriod === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const newSubResult = await pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, status, billing_period, start_date, end_date)
       VALUES ($1, $2, 'active', $3, $4, $5)
       RETURNING id, plan_id, status, billing_period, start_date, end_date`,
      [userId, targetPlan.id, billingPeriod, startDate, endDate]
    );

    await pool.query(
      `UPDATE users SET current_subscription_id = $1 WHERE id = $2`,
      [newSubResult.rows[0].id, userId]
    );

    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      subscription: {
        id: newSubResult.rows[0].id,
        planId: newSubResult.rows[0].plan_id,
        status: newSubResult.rows[0].status,
        billingPeriod: newSubResult.rows[0].billing_period,
        startDate: newSubResult.rows[0].start_date,
        endDate: newSubResult.rows[0].end_date
      },
      proratedCredit: proratedAmount.toFixed(2)
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

export default router;

