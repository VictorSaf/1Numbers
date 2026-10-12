import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { withoutSecrets } from '../lib/mcpConfig';

/**
 * Two things about admin.ts that no request would have revealed.
 */

describe('the project root', () => {
  const SOURCE = readFileSync(resolve(__dirname, '../routes/admin.ts'), 'utf8');

  it('is the repository, not its parent', () => {
    // Both runtime layouts -- server/src/routes under ts-node and
    // server/dist/routes after a build -- are three directories deep, so
    // '../../../..' landed one level above the repo on both.
    expect(SOURCE).toContain("path.resolve(__dirname, '../../..')");
    expect(SOURCE).not.toContain("path.resolve(__dirname, '../../../..')");

    for (const dir of ['server/src/routes', 'server/dist/routes']) {
      expect(resolve('/repo', dir, '../../..')).toBe('/repo');
    }
  });
});

describe('the MCP config the admin route returns', () => {
  const config = {
    mcpServers: {
      github: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'ghp_realtokenvalue', REGION: 'eu' },
      },
      plain: { command: 'node', args: ['server.js'] },
    },
  };

  it('carries no env value through', () => {
    const redacted = withoutSecrets(config);
    const serialised = JSON.stringify(redacted);

    expect(serialised).not.toContain('ghp_realtokenvalue');
    expect(serialised).not.toContain('"eu"');
  });

  it('keeps the variable names, which are what tell you a server is configured', () => {
    const github = withoutSecrets(config).mcpServers!.github as { env: Record<string, string> };
    expect(Object.keys(github.env)).toEqual(['GITHUB_PERSONAL_ACCESS_TOKEN', 'REGION']);
    expect(Object.values(github.env)).toEqual(['***', '***']);
  });

  it('leaves everything else alone', () => {
    const redacted = withoutSecrets(config);
    expect(redacted.mcpServers!.plain).toEqual({ command: 'node', args: ['server.js'] });
    expect(redacted.mcpServers!.github).toMatchObject({ command: 'npx' });
  });

  it('passes through a config with no servers', () => {
    expect(withoutSecrets({})).toEqual({});
  });
});
