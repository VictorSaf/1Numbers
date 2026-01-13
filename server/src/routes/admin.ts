import { Router, Response } from 'express';
import pool from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/dashboard - Dashboard statistics
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    // Get total users
    const totalUsersResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count, 10);

    // Get active users (created in last 7 days as proxy for active)
    const activeUsersResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'`
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count, 10);

    // Get premium users (users with active subscription)
    let premiumUsers = 0;
    try {
      const premiumResult = await pool.query(
        `SELECT COUNT(*) FROM subscriptions WHERE status = 'active'`
      );
      premiumUsers = parseInt(premiumResult.rows[0].count, 10);
    } catch {
      // Table might not exist
    }

    // Get new users this week
    const newUsersResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'`
    );
    const newUsersThisWeek = parseInt(newUsersResult.rows[0].count, 10);

    res.json({
      totalUsers,
      activeUsers,
      premiumUsers,
      newUsersThisWeek,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/admin/users - List all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, created_at as "createdAt"
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id - Update user (role, status)
router.patch('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    // Don't allow admin to demote themselves
    if (id === req.userId && role && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot change your own admin role' });
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramCount = 1;

    if (role) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, name, role`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET /api/admin/settings - Get platform settings
router.get('/settings', async (req: AuthRequest, res: Response) => {
  try {
    // Try to get settings from database
    let settings = {
      appName: 'Numerology Compass',
      maintenanceMode: false,
      defaultLanguage: 'en',
      features: {
        premium: true,
        courses: true,
        journal: true,
        compatibility: true,
      },
      ui: {
        defaultTheme: 'twilight',
        availableThemes: ['twilight', 'dawn', 'midnight', 'celestial'],
      },
    };

    try {
      const result = await pool.query('SELECT key, value FROM platform_settings');
      if (result.rows.length > 0) {
        result.rows.forEach((row: { key: string; value: unknown }) => {
          if (row.key === 'app_name') settings.appName = row.value as string;
          if (row.key === 'maintenance_mode') settings.maintenanceMode = row.value as boolean;
          if (row.key === 'default_language') settings.defaultLanguage = row.value as string;
          if (row.key === 'features') settings.features = row.value as typeof settings.features;
          if (row.key === 'ui') settings.ui = row.value as typeof settings.ui;
        });
      }
    } catch {
      // Table might not exist yet, use defaults
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings - Update platform settings
router.put('/settings', async (req: AuthRequest, res: Response) => {
  try {
    const { appName, maintenanceMode, defaultLanguage, features, ui } = req.body;

    // Check if platform_settings table exists, create if not
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const upsertSetting = async (key: string, value: unknown) => {
      await pool.query(
        `INSERT INTO platform_settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    };

    if (appName !== undefined) await upsertSetting('app_name', appName);
    if (maintenanceMode !== undefined) await upsertSetting('maintenance_mode', maintenanceMode);
    if (defaultLanguage !== undefined) await upsertSetting('default_language', defaultLanguage);
    if (features !== undefined) await upsertSetting('features', features);
    if (ui !== undefined) await upsertSetting('ui', ui);

    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// GET /api/admin/analytics - Usage analytics
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    // Return mock analytics data for now
    // In production, this would query actual analytics tables
    const analytics = {
      calculationsByType: [
        { type: 'Life Path', count: 1245 },
        { type: 'Compatibility', count: 892 },
        { type: 'Daily Prediction', count: 756 },
        { type: 'Name Analysis', count: 534 },
        { type: 'Personal Year', count: 421 },
      ],
      pageViews: [
        { page: 'Calculator', views: 3456 },
        { page: 'Compatibility', views: 1234 },
        { page: 'Predictions', views: 987 },
        { page: 'Guide', views: 654 },
        { page: 'Profile', views: 432 },
      ],
      userGrowth: [] as { date: string; count: number }[],
    };

    // Try to get actual user growth data
    try {
      const growthResult = await pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `);
      analytics.userGrowth = growthResult.rows;
    } catch {
      // Table structure might not support this
    }

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/admin/agents - List all Claude agents
router.get('/agents', async (req: AuthRequest, res: Response) => {
  try {
    const agentsDir = path.join(__dirname, '../../../..', '.claude', 'agents');
    const agents: { name: string; filename: string; description: string; content: string }[] = [];

    if (fs.existsSync(agentsDir)) {
      const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));

      for (const file of files) {
        const content = fs.readFileSync(path.join(agentsDir, file), 'utf-8');
        const name = file.replace('.md', '');

        // Extract description from first paragraph after title
        const lines = content.split('\n');
        let description = '';
        let inDescription = false;

        for (const line of lines) {
          if (line.startsWith('# ')) {
            inDescription = true;
            continue;
          }
          if (inDescription && line.trim() && !line.startsWith('#')) {
            description = line.trim();
            break;
          }
        }

        agents.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          filename: file,
          description: description || 'No description available',
          content,
        });
      }
    }

    res.json({ agents, count: agents.length });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// GET /api/admin/skills - List all custom skills
router.get('/skills', async (req: AuthRequest, res: Response) => {
  try {
    const skillsDir = path.join(__dirname, '../../../..', '.claude', 'skills');
    const skills: { name: string; command: string; filename: string; description: string; content: string }[] = [];

    if (fs.existsSync(skillsDir)) {
      const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md'));

      for (const file of files) {
        const content = fs.readFileSync(path.join(skillsDir, file), 'utf-8');
        const name = file.replace('.md', '');

        // Extract command name from title (e.g., "# /build-check")
        const titleMatch = content.match(/^#\s+(\/[\w-]+)/m);
        const command = titleMatch ? titleMatch[1] : `/${name}`;

        // Extract description from first paragraph after title
        const lines = content.split('\n');
        let description = '';
        let inDescription = false;

        for (const line of lines) {
          if (line.startsWith('# ')) {
            inDescription = true;
            continue;
          }
          if (inDescription && line.trim() && !line.startsWith('#')) {
            description = line.trim();
            break;
          }
        }

        skills.push({
          name: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          command,
          filename: file,
          description: description || 'No description available',
          content,
        });
      }
    }

    res.json({ skills, count: skills.length });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// GET /api/admin/mcp - Get MCP server configuration
router.get('/mcp', async (req: AuthRequest, res: Response) => {
  try {
    const mcpPath = path.join(__dirname, '../../../..', '.mcp.json');

    if (fs.existsSync(mcpPath)) {
      const content = fs.readFileSync(mcpPath, 'utf-8');
      const config = JSON.parse(content);
      res.json({ configured: true, config });
    } else {
      res.json({ configured: false, config: null, message: 'No MCP configuration found' });
    }
  } catch (error) {
    console.error('Get MCP config error:', error);
    res.status(500).json({ error: 'Failed to fetch MCP configuration' });
  }
});

// GET /api/admin/research - List research documents
router.get('/research', async (req: AuthRequest, res: Response) => {
  try {
    const researchDir = path.join(__dirname, '../../../..', 'docs', 'research');
    const documents: { name: string; filename: string; summary: string; content: string; modifiedAt: Date }[] = [];

    if (fs.existsSync(researchDir)) {
      const files = fs.readdirSync(researchDir).filter(f => f.endsWith('.md'));

      for (const file of files) {
        const filePath = path.join(researchDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const stats = fs.statSync(filePath);
        const name = file.replace('.md', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        // Extract first paragraph as summary
        const lines = content.split('\n');
        let summary = '';
        let inSummary = false;

        for (const line of lines) {
          if (line.startsWith('# ')) {
            inSummary = true;
            continue;
          }
          if (inSummary && line.trim() && !line.startsWith('#')) {
            summary = line.trim().substring(0, 200);
            if (line.trim().length > 200) summary += '...';
            break;
          }
        }

        documents.push({
          name,
          filename: file,
          summary: summary || 'No summary available',
          content,
          modifiedAt: stats.mtime,
        });
      }
    }

    res.json({ documents, count: documents.length });
  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({ error: 'Failed to fetch research documents' });
  }
});

export default router;
