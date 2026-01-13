import { Bot, Settings, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'coming_soon';
  category: string;
}

const agents: Agent[] = [
  {
    id: 'numerology-expert',
    name: 'Numerology Expert',
    description: 'AI assistant for numerology calculations and interpretations',
    status: 'active',
    category: 'Core',
  },
  {
    id: 'compatibility-analyzer',
    name: 'Compatibility Analyzer',
    description: 'Analyzes relationship compatibility based on numerology',
    status: 'active',
    category: 'Analysis',
  },
  {
    id: 'prediction-engine',
    name: 'Prediction Engine',
    description: 'Generates daily, weekly, and monthly predictions',
    status: 'active',
    category: 'Predictions',
  },
  {
    id: 'personal-coach',
    name: 'Personal Coach',
    description: 'Provides personalized guidance based on your numbers',
    status: 'coming_soon',
    category: 'Premium',
  },
  {
    id: 'dream-interpreter',
    name: 'Dream Interpreter',
    description: 'Interprets dreams through numerological lens',
    status: 'coming_soon',
    category: 'Premium',
  },
];

export const AgentsSection = () => {
  const activeAgents = agents.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-cinzel font-bold mb-2">Agents</h2>
        <p className="text-muted-foreground">Configure AI agents and assistants</p>
      </div>

      {/* Overview Card */}
      <Card className="card-mystic">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeAgents} Active</div>
              <div className="text-sm text-muted-foreground">
                of {agents.length} total agents
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents List */}
      <Card className="card-mystic">
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>Manage your AI agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    agent.status === 'active'
                      ? 'bg-green-500/10'
                      : agent.status === 'coming_soon'
                      ? 'bg-amber-500/10'
                      : 'bg-muted'
                  }`}
                >
                  {agent.status === 'active' ? (
                    <Zap className="h-5 w-5 text-green-500" />
                  ) : (
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {agent.name}
                    <Badge variant="outline" className="text-xs">
                      {agent.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{agent.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {agent.status === 'coming_soon' ? (
                  <Badge variant="secondary">Coming Soon</Badge>
                ) : (
                  <Switch checked={agent.status === 'active'} disabled />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="card-mystic border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium mb-1">Agent Configuration</div>
              <p className="text-sm text-muted-foreground">
                Agent configuration and parameters will be available in a future update.
                Currently, agents are configured through the backend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
