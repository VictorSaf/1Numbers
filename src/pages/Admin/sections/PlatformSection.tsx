import { useEffect, useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface PlatformSettings {
  appName: string;
  maintenanceMode: boolean;
  defaultLanguage: string;
  features: {
    premium: boolean;
    courses: boolean;
    journal: boolean;
    compatibility: boolean;
  };
}

export const PlatformSection = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    appName: 'Numerology Compass',
    maintenanceMode: false,
    defaultLanguage: 'en',
    features: {
      premium: true,
      courses: true,
      journal: true,
      compatibility: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:3001/api/admin/settings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: 'Settings saved',
          description: 'Platform settings have been updated',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="card-mystic animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-cinzel font-bold mb-2">Platform Settings</h2>
        <p className="text-muted-foreground">Configure your application settings</p>
      </div>

      {/* General Settings */}
      <Card className="card-mystic">
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input
              id="appName"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultLanguage">Default Language</Label>
            <select
              id="defaultLanguage"
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="en">English</option>
              <option value="ro">Romanian</option>
              <option value="ru">Russian</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-warning/10 border border-warning/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <div className="font-medium">Maintenance Mode</div>
                <div className="text-sm text-muted-foreground">
                  When enabled, only admins can access the platform
                </div>
              </div>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, maintenanceMode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card className="card-mystic">
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Enable or disable platform features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings.features).map(([key, enabled]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div>
                <div className="font-medium capitalize">{key}</div>
                <div className="text-sm text-muted-foreground">
                  {key === 'premium' && 'Premium subscription features'}
                  {key === 'courses' && 'Numerology courses section'}
                  {key === 'journal' && 'Personal numerology journal'}
                  {key === 'compatibility' && 'Compatibility calculator'}
                </div>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    features: { ...settings.features, [key]: checked },
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="btn-mystic">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
