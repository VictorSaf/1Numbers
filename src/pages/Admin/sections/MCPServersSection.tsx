import { useEffect, useState } from 'react';
import { Server, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MCPServer {
  name: string;
  type?: string;
  command?: string;
  url?: string;
  args?: string[];
}

interface MCPConfig {
  mcpServers?: Record<string, MCPServer>;
}

export const MCPServersSection = () => {
  const [configured, setConfigured] = useState(false);
  const [config, setConfig] = useState<MCPConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMCPConfig = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:3001/api/admin/mcp', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setConfigured(data.configured);
          setConfig(data.config);
        }
      } catch (error) {
        console.error('Failed to fetch MCP config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMCPConfig();
  }, []);

  if (loading) {
    return (
      <Card className="card-mystic">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const servers = config?.mcpServers ? Object.entries(config.mcpServers) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-cinzel font-bold mb-2">MCP Servers</h2>
        <p className="text-muted-foreground">
          Model Context Protocol server configuration
        </p>
      </div>

      {/* Status Card */}
      <Card className="card-mystic">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${configured ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
              <Server className={`h-6 w-6 ${configured ? 'text-green-500' : 'text-amber-500'}`} />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {configured ? `${servers.length} Server${servers.length !== 1 ? 's' : ''}` : 'Not Configured'}
              </div>
              <div className="text-sm text-muted-foreground">
                {configured ? 'MCP servers are configured' : 'No .mcp.json file found'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!configured ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No MCP Configuration</AlertTitle>
          <AlertDescription>
            Create a .mcp.json file in the project root to configure MCP servers.
            MCP (Model Context Protocol) allows Claude to connect to external tools and services.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="card-mystic">
          <CardHeader>
            <CardTitle>Configured Servers</CardTitle>
            <CardDescription>
              MCP servers defined in .mcp.json
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {servers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No servers configured in .mcp.json
              </div>
            ) : (
              servers.map(([name, server]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {name}
                        {server.type && (
                          <Badge variant="outline" className="text-xs">
                            {server.type}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {server.command || server.url || 'No command/URL specified'}
                      </div>
                      {server.args && server.args.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Args: {server.args.join(' ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="card-mystic border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium mb-1">About MCP</div>
              <p className="text-sm text-muted-foreground">
                Model Context Protocol (MCP) allows Claude to connect to external tools,
                databases, and services. Servers can be configured via .mcp.json file
                in the project root directory.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
