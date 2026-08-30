// .mcp.json carries an `env` block per server, and that is where the tokens
// live -- API keys, personal access tokens, whatever a server needs to
// authenticate. The route used to return the file whole, so an admin page
// displayed them and any client that called it received them. The names of the
// variables are useful for telling whether a server is configured; the values
// are not something this endpoint has any reason to hand out.
export type McpConfig = { mcpServers?: Record<string, Record<string, unknown>> };

export const withoutSecrets = (config: McpConfig): McpConfig => {
  if (!config?.mcpServers) return config;

  const mcpServers = Object.fromEntries(
    Object.entries(config.mcpServers).map(([name, server]) => {
      const { env, ...rest } = server as { env?: Record<string, unknown> };
      return [
        name,
        env ? { ...rest, env: Object.fromEntries(Object.keys(env).map((k) => [k, '***'])) } : rest,
      ];
    }),
  );

  return { ...config, mcpServers };
};
