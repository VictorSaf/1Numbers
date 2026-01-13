import { useEffect, useState } from 'react';
import { Zap, FileCode, Eye, Terminal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Skill {
  name: string;
  command: string;
  filename: string;
  description: string;
  content: string;
}

export const SkillsSection = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:3001/api/admin/skills', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSkills(data.skills || []);
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
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
        <h2 className="text-2xl font-cinzel font-bold mb-2">Skills</h2>
        <p className="text-muted-foreground">
          Custom Claude skills and workflows from .claude/skills/
        </p>
      </div>

      {/* Overview Card */}
      <Card className="card-mystic">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{skills.length} Skills</div>
              <div className="text-sm text-muted-foreground">
                Configured in .claude/skills/
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills List */}
      <Card className="card-mystic">
        <CardHeader>
          <CardTitle>All Skills</CardTitle>
          <CardDescription>
            Custom slash commands and workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {skills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No skills found in .claude/skills/
            </div>
          ) : (
            skills.map((skill) => (
              <div
                key={skill.filename}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Terminal className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <code className="text-primary font-mono">{skill.command}</code>
                      <Badge variant="outline" className="text-xs">
                        <FileCode className="h-3 w-3 mr-1" />
                        {skill.filename}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {skill.description}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSkill(skill)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="card-mystic border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium mb-1">Using Skills</div>
              <p className="text-sm text-muted-foreground">
                Skills are custom slash commands that can be invoked in Claude Code.
                Use them by typing the command (e.g., /build-check) in your conversation
                with Claude.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Details Dialog */}
      <Dialog open={!!selectedSkill} onOpenChange={() => setSelectedSkill(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <code className="font-mono">{selectedSkill?.command}</code>
              <Badge variant="outline" className="ml-2">
                {selectedSkill?.filename}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg font-mono">
              {selectedSkill?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
