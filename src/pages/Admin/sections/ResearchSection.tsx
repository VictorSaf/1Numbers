import { useEffect, useState } from 'react';
import { FileSearch, FileText, Eye, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ResearchDocument {
  name: string;
  filename: string;
  summary: string;
  content: string;
  modifiedAt: string;
}

export const ResearchSection = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<ResearchDocument | null>(null);

  useEffect(() => {
    const fetchResearch = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:3001/api/admin/research', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents || []);
        }
      } catch (error) {
        console.error('Failed to fetch research:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResearch();
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
        <h2 className="text-2xl font-cinzel font-bold mb-2">Research Documents</h2>
        <p className="text-muted-foreground">
          Project research and documentation from docs/research/
        </p>
      </div>

      {/* Overview Card */}
      <Card className="card-mystic">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileSearch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{documents.length} Documents</div>
              <div className="text-sm text-muted-foreground">
                Research files in docs/research/
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="card-mystic">
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            Research, analysis, and documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No research documents found in docs/research/
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.filename}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {doc.name}
                      <Badge variant="outline" className="text-xs">
                        {doc.filename}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {doc.summary}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.modifiedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDoc(doc)}
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
              <FileSearch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium mb-1">Research Documentation</div>
              <p className="text-sm text-muted-foreground">
                This section displays research documents stored in the docs/research/
                directory. These documents contain project analysis, technical research,
                and domain knowledge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Details Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedDoc?.name}
              <Badge variant="outline" className="ml-2">
                {selectedDoc?.filename}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">
              {selectedDoc?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
