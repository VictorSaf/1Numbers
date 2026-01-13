import {
  LayoutDashboard,
  Users,
  Settings,
  Palette,
  Bot,
  BarChart3,
  Server,
  Zap,
  FileSearch
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AdminSection =
  | 'dashboard'
  | 'users'
  | 'platform'
  | 'ui-settings'
  | 'agents'
  | 'skills'
  | 'mcp-servers'
  | 'research'
  | 'analytics';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const sidebarItems: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'platform', label: 'Platform', icon: Settings },
  { id: 'ui-settings', label: 'UI Settings', icon: Palette },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'mcp-servers', label: 'MCP Servers', icon: Server },
  { id: 'research', label: 'Research', icon: FileSearch },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                isActive
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

// Mobile navigation
export const AdminMobileNav = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  return (
    <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4">
      <div className="flex gap-2 min-w-max">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-foreground/70 hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
