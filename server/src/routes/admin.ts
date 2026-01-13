import { Router, Response } from 'express';
import pool from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { promises as fs } from 'fs';
import * as path from 'path';

const router = Router();

// Project root - resolved once at startup for security
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

// Constants for file reading safety
const MAX_FILE_SIZE = 1024 * 1024; // 1MB max file size
const CACHE_MAX_AGE = 300; // 5 minutes cache

// Helper: Validate path is within allowed directory
const isPathSafe = (filePath: string, allowedDir: string): boolean => {
  const resolvedPath = path.resolve(filePath);
  const resolvedAllowed = path.resolve(allowedDir);
  return resolvedPath.startsWith(resolvedAllowed + path.sep) || resolvedPath === resolvedAllowed;
};

// Helper: Check if file is a regular file (not symlink, directory, etc.)
const isRegularFile = async (filePath: string): Promise<boolean> => {
  try {
    const stats = await fs.lstat(filePath); // lstat doesn't follow symlinks
    return stats.isFile() && !stats.isSymbolicLink();
  } catch {
    return false;
  }
};

// Helper: Safely read file with size limit
const safeReadFile = async (filePath: string, maxSize: number = MAX_FILE_SIZE): Promise<string | null> => {
  try {
    const stats = await fs.stat(filePath);
    if (stats.size > maxSize) {
      console.warn(`File ${filePath} exceeds size limit (${stats.size} > ${maxSize})`);
      return null;
    }
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
};

// Helper: Set cache headers for static content
const setCacheHeaders = (res: Response, maxAge: number = CACHE_MAX_AGE): void => {
  res.set('Cache-Control', `private, max-age=${maxAge}`);
};

// Helper: Handle file system errors with specific messages
interface FSError extends Error {
  code?: string;
}

const handleFSError = (error: unknown, resource: string, res: Response): void => {
  const fsError = error as FSError;
  console.error(`${resource} error:`, error);

  if (fsError.code === 'ENOENT') {
    res.status(404).json({ error: `${resource} directory not found` });
  } else if (fsError.code === 'EACCES') {
    res.status(403).json({ error: `Permission denied reading ${resource.toLowerCase()}` });
  } else if (fsError.code === 'ENOTDIR') {
    res.status(400).json({ error: `Invalid ${resource.toLowerCase()} path` });
  } else {
    res.status(500).json({
      error: `Failed to fetch ${resource.toLowerCase()}`,
      details: fsError.message
    });
  }
};

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
    const agentsDir = path.join(PROJECT_ROOT, '.claude', 'agents');

    // Validate directory is within project root
    if (!isPathSafe(agentsDir, PROJECT_ROOT)) {
      return res.status(400).json({ error: 'Invalid agents directory path' });
    }

    const agents: { name: string; filename: string; description: string; content: string }[] = [];

    let files: string[];
    try {
      files = await fs.readdir(agentsDir);
    } catch (error) {
      // Directory doesn't exist - return empty list
      setCacheHeaders(res);
      return res.json({ agents: [], count: 0 });
    }

    const mdFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('.'));

    for (const file of mdFiles) {
      const filePath = path.join(agentsDir, file);

      // Validate file path and check it's a regular file (not symlink)
      if (!isPathSafe(filePath, agentsDir) || !(await isRegularFile(filePath))) {
        continue;
      }

      const content = await safeReadFile(filePath);
      if (!content) continue;

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

    setCacheHeaders(res);
    res.json({ agents, count: agents.length });
  } catch (error) {
    handleFSError(error, 'Agents', res);
  }
});

// GET /api/admin/skills - List all custom skills
router.get('/skills', async (req: AuthRequest, res: Response) => {
  try {
    const skillsDir = path.join(PROJECT_ROOT, '.claude', 'skills');

    // Validate directory is within project root
    if (!isPathSafe(skillsDir, PROJECT_ROOT)) {
      return res.status(400).json({ error: 'Invalid skills directory path' });
    }

    const skills: { name: string; command: string; filename: string; description: string; content: string }[] = [];

    let files: string[];
    try {
      files = await fs.readdir(skillsDir);
    } catch (error) {
      // Directory doesn't exist - return empty list
      setCacheHeaders(res);
      return res.json({ skills: [], count: 0 });
    }

    const mdFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('.'));

    for (const file of mdFiles) {
      const filePath = path.join(skillsDir, file);

      // Validate file path and check it's a regular file (not symlink)
      if (!isPathSafe(filePath, skillsDir) || !(await isRegularFile(filePath))) {
        continue;
      }

      const content = await safeReadFile(filePath);
      if (!content) continue;

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

    setCacheHeaders(res);
    res.json({ skills, count: skills.length });
  } catch (error) {
    handleFSError(error, 'Skills', res);
  }
});

// GET /api/admin/mcp - Get MCP server configuration
router.get('/mcp', async (req: AuthRequest, res: Response) => {
  try {
    const mcpPath = path.join(PROJECT_ROOT, '.mcp.json');

    // Validate path is within project root
    if (!isPathSafe(mcpPath, PROJECT_ROOT)) {
      return res.status(400).json({ error: 'Invalid MCP config path' });
    }

    // Check if file exists and is a regular file
    if (!(await isRegularFile(mcpPath))) {
      setCacheHeaders(res);
      return res.json({ configured: false, config: null, message: 'No MCP configuration found' });
    }

    const content = await safeReadFile(mcpPath);
    if (!content) {
      return res.status(500).json({ error: 'Failed to read MCP configuration (file too large or unreadable)' });
    }

    try {
      const config = JSON.parse(content);
      setCacheHeaders(res);
      res.json({ configured: true, config });
    } catch (parseError) {
      console.error('MCP JSON parse error:', parseError);
      res.status(400).json({ error: 'Invalid JSON in MCP configuration file' });
    }
  } catch (error) {
    handleFSError(error, 'MCP', res);
  }
});

// GET /api/admin/research - List research documents
router.get('/research', async (req: AuthRequest, res: Response) => {
  try {
    const researchDir = path.join(PROJECT_ROOT, 'docs', 'research');

    // Validate directory is within project root
    if (!isPathSafe(researchDir, PROJECT_ROOT)) {
      return res.status(400).json({ error: 'Invalid research directory path' });
    }

    const documents: { name: string; filename: string; summary: string; content: string; modifiedAt: Date }[] = [];

    let files: string[];
    try {
      files = await fs.readdir(researchDir);
    } catch (error) {
      // Directory doesn't exist - return empty list
      setCacheHeaders(res);
      return res.json({ documents: [], count: 0 });
    }

    const mdFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('.'));

    for (const file of mdFiles) {
      const filePath = path.join(researchDir, file);

      // Validate file path and check it's a regular file (not symlink)
      if (!isPathSafe(filePath, researchDir) || !(await isRegularFile(filePath))) {
        continue;
      }

      const content = await safeReadFile(filePath);
      if (!content) continue;

      const stats = await fs.stat(filePath);
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

    setCacheHeaders(res);
    res.json({ documents, count: documents.length });
  } catch (error) {
    handleFSError(error, 'Research', res);
  }
});

export default router;
