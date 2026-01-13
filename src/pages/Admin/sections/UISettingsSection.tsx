import { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UISettings {
  defaultTheme: string;
  availableThemes: string[];
}

const themes = [
  {
    id: 'twilight',
    name: 'Twilight',
    description: 'Deep purple mystical theme',
    colors: ['#1a0f2e', '#7c3aed', '#fbbf24'],
  },
  {
    id: 'dawn',
    name: 'Dawn',
    description: 'Warm sunrise colors',
    colors: ['#1f1a24', '#f97316', '#fcd34d'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark blue cosmic theme',
    colors: ['#0a0f1a', '#3b82f6', '#60a5fa'],
  },
  {
    id: 'celestial',
    name: 'Celestial',
    description: 'Light ethereal theme',
    colors: ['#f5f5f5', '#8b5cf6', '#c084fc'],
  },
];

export const UISettingsSection = () => {
  const [settings, setSettings] = useState<UISettings>({
    defaultTheme: 'twilight',
    availableThemes: ['twilight', 'dawn', 'midnight', 'celestial'],
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
          if (data.settings?.ui) {
            setSettings(data.settings.ui);
          }
        }
      } catch (error) {
        console.error('Failed to fetch UI settings:', error);
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
        body: JSON.stringify({ ui: settings }),
      });

      if (response.ok) {
        toast({
          title: 'Settings saved',
          description: 'UI settings have been updated',
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

  const toggleTheme = (themeId: string) => {
    setSettings((prev) => ({
      ...prev,
      availableThemes: prev.availableThemes.includes(themeId)
        ? prev.availableThemes.filter((t) => t !== themeId)
        : [...prev.availableThemes, themeId],
    }));
  };

  if (loading) {
    return (
      <Card className="card-mystic animate-pulse">
        <CardContent className="p-6">
          <div className="h-64 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-cinzel font-bold mb-2">UI Settings</h2>
        <p className="text-muted-foreground">Customize the visual appearance</p>
      </div>

      {/* Default Theme */}
      <Card className="card-mystic">
        <CardHeader>
          <CardTitle>Default Theme</CardTitle>
          <CardDescription>Select the default theme for new users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSettings({ ...settings, defaultTheme: theme.id })}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-left",
                  settings.defaultTheme === theme.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex gap-1 mb-2">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="font-medium">{theme.name}</div>
                <div className="text-xs text-muted-foreground">{theme.description}</div>
                {settings.defaultTheme === theme.id && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                    <Check className="h-3 w-3" />
                    Default
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Themes */}
      <Card className="card-mystic">
        <CardHeader>
          <CardTitle>Available Themes</CardTitle>
          <CardDescription>Enable or disable themes for users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div>
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-sm text-muted-foreground">{theme.description}</div>
                </div>
              </div>
              <Switch
                checked={settings.availableThemes.includes(theme.id)}
                onCheckedChange={() => toggleTheme(theme.id)}
                disabled={
                  settings.defaultTheme === theme.id &&
                  settings.availableThemes.includes(theme.id)
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
