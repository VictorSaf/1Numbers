import { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { API_BASE } from '@/lib/apiBase';

interface UISettings {
  defaultTheme: string;
  availableThemes: string[];
}

// Two themes, and the swatches are the tokens they actually set. The four this
// replaced were labelled from memory rather than from the stylesheet: celestial
// was described as "light ethereal" and is dark, dawn as "warm sunrise" and is
// the only light one. Three of the four were the same palette.
const themes = [
  {
    id: 'light',
    name: 'Light',
    description: 'Ink blue on paper',
    colors: ['#f2f3f7', '#22406b', '#8c3b6b'],
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Ink blue on slate',
    colors: ['#0e1017', '#8fb4e0', '#dd90bf'],
  },
];

export const UISettingsSection = () => {
  const [settings, setSettings] = useState<UISettings>({
    defaultTheme: 'system',
    availableThemes: ['light', 'dark', 'system'],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/admin/settings`, {
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
      const response = await fetch(`${API_BASE}/admin/settings`, {
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
        <h2 className="text-2xl font-heading font-bold mb-2">UI Settings</h2>
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
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
