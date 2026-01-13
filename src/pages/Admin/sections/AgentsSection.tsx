import { useEffect, useState } from 'react';
import { Bot, FileCode, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/services/api';

interface Agent {
  name: string;
  filename: string;
  description: string;
  content: string;
}

export const AgentsSection = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await api.getAdminAgents();
        setAgents(data.agents || []);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <Card className="card-mystic">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-cinzel font-bold mb-2">Claude Agents</h2>
        <p className="text-muted-foreground">
          View all configured Claude agents from .claude/agents/
        </p>
      </div>

      {/* Overview Card */}
      <Card className="card-mystic">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{agents.length} Agents</div>
              <div className="text-sm text-muted-foreground">
                Configured in .claude/agents/
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents List */}
      <Card className="card-mystic">
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>
            Multi-agent system for specialized tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {agents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agents found in .claude/agents/
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.filename}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {agent.name}
                      <Badge variant="outline" className="text-xs">
                        <FileCode className="h-3 w-3 mr-1" />
                        {agent.filename}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {agent.description}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Agent Details Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {selectedAgent?.name}
              <Badge variant="outline" className="ml-2">
                {selectedAgent?.filename}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg font-mono">
              {selectedAgent?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
