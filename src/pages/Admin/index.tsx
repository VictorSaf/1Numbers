import { useState } from 'react';
import { Shield } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminSidebar, AdminMobileNav, AdminSection } from './AdminSidebar';
import { DashboardSection } from './sections/DashboardSection';
import { UsersSection } from './sections/UsersSection';
import { PlatformSection } from './sections/PlatformSection';
import { UISettingsSection } from './sections/UISettingsSection';
import { AgentsSection } from './sections/AgentsSection';
import { AnalyticsSection } from './sections/AnalyticsSection';

const Admin = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'users':
        return <UsersSection />;
      case 'platform':
        return <PlatformSection />;
      case 'ui-settings':
        return <UISettingsSection />;
      case 'agents':
        return <AgentsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Admin Panel"
        subtitle="Manage your platform settings and users"
        badge={{
          icon: <Shield className="h-4 w-4 text-primary" />,
          label: 'Administrator',
        }}
      />

      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Navigation */}
          <AdminMobileNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          {/* Desktop Layout */}
          <div className="flex gap-8">
            <AdminSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />

            <div className="flex-1 min-w-0">{renderSection()}</div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
};

export default Admin;
