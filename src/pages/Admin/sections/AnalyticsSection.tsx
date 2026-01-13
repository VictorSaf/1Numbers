import { useEffect, useState } from 'react';
import { BarChart3, Calculator, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AnalyticsData {
  calculationsByType: { type: string; count: number }[];
  pageViews: { page: string; views: number }[];
  userGrowth: { date: string; count: number }[];
}

export const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
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
    userGrowth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:3001/api/admin/analytics', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.analytics) {
            setAnalytics(data.analytics);
          }
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const maxCalculations = Math.max(...analytics.calculationsByType.map((c) => c.count));
  const maxViews = Math.max(...analytics.pageViews.map((p) => p.views));

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="card-mystic animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-cinzel font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">Platform usage statistics and insights</p>
      </div>

      {/* Calculations by Type */}
      <Card className="card-mystic">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Calculations by Type</CardTitle>
          </div>
          <CardDescription>Most popular calculation types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.calculationsByType.map((item) => (
            <div key={item.type} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{item.type}</span>
                <span className="text-muted-foreground">{item.count.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(item.count / maxCalculations) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Page Views */}
      <Card className="card-mystic">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Page Views</CardTitle>
          </div>
          <CardDescription>Most visited pages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.pageViews.map((item) => (
            <div key={item.page} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{item.page}</span>
                <span className="text-muted-foreground">{item.views.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${(item.views / maxViews) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-mystic">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Calculator className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analytics.calculationsByType
                    .reduce((sum, c) => sum + c.count, 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Calculations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-mystic">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analytics.pageViews
                    .reduce((sum, p) => sum + p.views, 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Page Views</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-mystic">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">+12%</div>
                <div className="text-sm text-muted-foreground">Growth This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
