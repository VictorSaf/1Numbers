/**
 * Design System Showcase
 * Visual documentation of all theme elements
 */

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  DSCard,
  DSBadge,
  DSNumber,
  DSInfoBox,
  DSSectionHeader,
  DSExpandable,
  DSProgress,
  DSColorSwatch,
  numberMeanings,
} from '@/components/design-system';
import {
  Sun,
  Moon,
  Star,
  Heart,
  Sparkles,
  Compass,
  Grid3X3,
  Calendar,
  TrendingUp,
  Flame,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Eye,
  Palette,
  Type,
  Square,
  Circle,
  Layers,
  Zap,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const DesignSystemShowcase = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'buttons', label: 'Buttons', icon: Square },
    { id: 'cards', label: 'Cards', icon: Layers },
    { id: 'badges', label: 'Badges', icon: Circle },
    { id: 'numbers', label: 'Numbers', icon: Star },
    { id: 'info-boxes', label: 'Info Boxes', icon: Info },
    { id: 'forms', label: 'Forms', icon: Box },
    { id: 'animations', label: 'Animations', icon: Zap },
    { id: 'spacing', label: 'Spacing', icon: Grid3X3 },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="ds-heading-1 mb-4">Design System</h1>
          <p className="ds-body text-muted-foreground max-w-2xl">
            Complete visual documentation of all UI components, colors, typography,
            and design tokens used in Numerology Compass.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-12 pb-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 -mx-4 px-4">
          {sections.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeSection === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => scrollToSection(id)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Typography Section */}
        <section id="typography" className="mb-16">
          <DSSectionHeader title="Typography" icon={Type} size="lg" />

          <div className="grid gap-8 mt-6">
            {/* Headings */}
            <DSCard variant="elevated" title="Headings" subtitle="Cinzel font family">
              <div className="space-y-4">
                <div>
                  <span className="ds-caption">H1</span>
                  <h1 className="ds-heading-1">Numerology Compass</h1>
                </div>
                <div>
                  <span className="ds-caption">H2</span>
                  <h2 className="ds-heading-2">Your Life Path</h2>
                </div>
                <div>
                  <span className="ds-caption">H3</span>
                  <h3 className="ds-heading-3">Personal Numbers</h3>
                </div>
                <div>
                  <span className="ds-caption">H4</span>
                  <h4 className="ds-heading-4">Daily Insights</h4>
                </div>
                <div>
                  <span className="ds-caption">H5</span>
                  <h5 className="ds-heading-5">Section Title</h5>
                </div>
                <div>
                  <span className="ds-caption">H6</span>
                  <h6 className="ds-heading-6">Subsection</h6>
                </div>
              </div>
            </DSCard>

            {/* Body Text */}
            <DSCard variant="elevated" title="Body Text" subtitle="Raleway font family">
              <div className="space-y-4">
                <div>
                  <span className="ds-caption">Body</span>
                  <p className="ds-body">
                    Numerology is the study of numbers and their symbolic meanings.
                    Each number carries a unique vibration and energy.
                  </p>
                </div>
                <div>
                  <span className="ds-caption">Body Small</span>
                  <p className="ds-body-sm">
                    Your Life Path number reveals your purpose and the lessons you'll learn.
                  </p>
                </div>
                <div>
                  <span className="ds-caption">Caption</span>
                  <p className="ds-caption">Last updated: January 2026</p>
                </div>
                <div>
                  <span className="ds-caption">Label</span>
                  <p className="ds-label-text">Life Path Number</p>
                </div>
              </div>
            </DSCard>
          </div>
        </section>

        {/* Colors Section */}
        <section id="colors" className="mb-16">
          <DSSectionHeader title="Colors" icon={Palette} size="lg" />

          <div className="grid gap-8 mt-6">
            {/* Primary Colors */}
            <DSCard variant="elevated" title="Primary Palette">
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-primary mb-2" />
                  <span className="ds-caption">Primary</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-primary-hover mb-2" />
                  <span className="ds-caption">Hover</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-primary-light mb-2" />
                  <span className="ds-caption">Light</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-primary-dark mb-2" />
                  <span className="ds-caption">Dark</span>
                </div>
              </div>
            </DSCard>

            {/* Secondary & Accent */}
            <DSCard variant="elevated" title="Secondary & Accent">
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-secondary mb-2" />
                  <span className="ds-caption">Secondary</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-secondary-hover mb-2" />
                  <span className="ds-caption">Sec. Hover</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-accent mb-2" />
                  <span className="ds-caption">Accent</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-accent-hover mb-2" />
                  <span className="ds-caption">Acc. Hover</span>
                </div>
              </div>
            </DSCard>

            {/* Semantic Colors */}
            <DSCard variant="elevated" title="Semantic Colors">
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-success mb-2" />
                  <span className="ds-caption">Success</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-warning mb-2" />
                  <span className="ds-caption">Warning</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-error mb-2" />
                  <span className="ds-caption">Error</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-info mb-2" />
                  <span className="ds-caption">Info</span>
                </div>
              </div>
            </DSCard>

            {/* Numerology Colors */}
            <DSCard variant="elevated" title="Numerology Colors (1-9)">
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <div key={num} className="text-center">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                      style={{ background: `hsl(var(--color-number-${num}))` }}
                    >
                      {num}
                    </div>
                    <span className="ds-caption">{numberMeanings[num as keyof typeof numberMeanings]?.name}</span>
                  </div>
                ))}
              </div>
            </DSCard>

            {/* Master Number Colors */}
            <DSCard variant="elevated" title="Master Number Colors">
              <div className="flex flex-wrap gap-6">
                {[11, 22, 33].map((num) => (
                  <div key={num} className="text-center">
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ background: `hsl(var(--color-number-${num}))` }}
                    >
                      {num}
                    </div>
                    <span className="ds-caption">{numberMeanings[num as keyof typeof numberMeanings]?.name}</span>
                  </div>
                ))}
              </div>
            </DSCard>
          </div>
        </section>

        {/* Buttons Section */}
        <section id="buttons" className="mb-16">
          <DSSectionHeader title="Buttons" icon={Square} size="lg" />

          <div className="grid gap-8 mt-6">
            <DSCard variant="elevated" title="Button Variants">
              <div className="flex flex-wrap gap-4">
                <button className="ds-btn ds-btn--primary ds-btn--md">Primary</button>
                <button className="ds-btn ds-btn--secondary ds-btn--md">Secondary</button>
                <button className="ds-btn ds-btn--ghost ds-btn--md">Ghost</button>
                <button className="ds-btn ds-btn--outline ds-btn--md">Outline</button>
                <button className="ds-btn ds-btn--icon">
                  <Star className="w-5 h-5" />
                </button>
              </div>
            </DSCard>

            <DSCard variant="elevated" title="Button Sizes">
              <div className="flex flex-wrap items-center gap-4">
                <button className="ds-btn ds-btn--primary ds-btn--sm">Small</button>
                <button className="ds-btn ds-btn--primary ds-btn--md">Medium</button>
                <button className="ds-btn ds-btn--primary ds-btn--lg">Large</button>
              </div>
            </DSCard>

            <DSCard variant="elevated" title="Button States">
              <div className="flex flex-wrap gap-4">
                <button className="ds-btn ds-btn--primary ds-btn--md">Normal</button>
                <button className="ds-btn ds-btn--primary ds-btn--md" disabled>Disabled</button>
              </div>
            </DSCard>
          </div>
        </section>

        {/* Cards Section */}
        <section id="cards" className="mb-16">
          <DSSectionHeader title="Cards" icon={Layers} size="lg" />

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <DSCard variant="default" title="Default Card" icon={Box}>
              <p className="ds-body-sm text-muted-foreground">
                Basic card with subtle styling for general content.
              </p>
            </DSCard>

            <DSCard variant="elevated" title="Elevated Card" icon={Layers}>
              <p className="ds-body-sm text-muted-foreground">
                Card with shadow and gradient for highlighted content.
              </p>
            </DSCard>

            <DSCard variant="glass" title="Glass Card" icon={Eye}>
              <p className="ds-body-sm text-muted-foreground">
                Glassmorphism effect with backdrop blur.
              </p>
            </DSCard>

            <DSCard variant="mystic" title="Mystic Card" icon={Sparkles}>
              <p className="ds-body-sm text-muted-foreground">
                Special card with glow effect for mystical content.
              </p>
            </DSCard>
          </div>
        </section>

        {/* Badges Section */}
        <section id="badges" className="mb-16">
          <DSSectionHeader title="Badges" icon={Circle} size="lg" />

          <div className="grid gap-8 mt-6">
            <DSCard variant="elevated" title="Semantic Badges">
              <div className="flex flex-wrap gap-3">
                <DSBadge variant="primary">Primary</DSBadge>
                <DSBadge variant="secondary">Secondary</DSBadge>
                <DSBadge variant="success">Success</DSBadge>
                <DSBadge variant="warning">Warning</DSBadge>
                <DSBadge variant="error">Error</DSBadge>
                <DSBadge variant="info">Info</DSBadge>
              </div>
            </DSCard>

            <DSCard variant="elevated" title="Number Badges (1-9)">
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <DSBadge key={num} number={num}>
                    Number {num}
                  </DSBadge>
                ))}
              </div>
            </DSCard>

            <DSCard variant="elevated" title="Master Number Badges">
              <div className="flex flex-wrap gap-3">
                <DSBadge number={11}>Master 11</DSBadge>
                <DSBadge number={22}>Master 22</DSBadge>
                <DSBadge number={33}>Master 33</DSBadge>
              </div>
            </DSCard>
          </div>
        </section>

        {/* Numbers Section */}
        <section id="numbers" className="mb-16">
          <DSSectionHeader title="Number Displays" icon={Star} size="lg" />

          <div className="grid gap-8 mt-6">
            <DSCard variant="elevated" title="Size Variants">
              <div className="flex flex-wrap items-end gap-6">
                <div className="text-center">
                  <DSNumber value={1} size="sm" />
                  <p className="ds-caption mt-2">Small</p>
                </div>
                <div className="text-center">
                  <DSNumber value={2} size="md" />
                  <p className="ds-caption mt-2">Medium</p>
                </div>
                <div className="text-center">
                  <DSNumber value={3} size="lg" />
                  <p className="ds-caption mt-2">Large</p>
                </div>
                <div className="text-center">
                  <DSNumber value={4} size="xl" />
                  <p className="ds-caption mt-2">XL</p>
                </div>
              </div>
            </DSCard>

            <DSCard variant="elevated" title="Master Numbers">
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <DSNumber value={11} size="lg" isMaster />
                  <p className="ds-caption mt-2">Master 11</p>
                </div>
                <div className="text-center">
                  <DSNumber value={22} size="lg" isMaster />
                  <p className="ds-caption mt-2">Master 22</p>
                </div>
                <div className="text-center">
                  <DSNumber value={33} size="lg" isMaster />
                  <p className="ds-caption mt-2">Master 33</p>
                </div>
              </div>
            </DSCard>

            <DSCard variant="elevated" title="Number Colors">
              <div className="flex flex-wrap gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <DSNumber key={num} value={num} size="md" useNumberColor />
                ))}
              </div>
            </DSCard>
          </div>
        </section>

        {/* Info Boxes Section */}
        <section id="info-boxes" className="mb-16">
          <DSSectionHeader title="Info Boxes" icon={Info} size="lg" />

          <div className="grid gap-4 mt-6">
            <DSInfoBox variant="primary" title="Primary Info">
              This is a primary info box for general information.
            </DSInfoBox>
            <DSInfoBox variant="success" title="Success">
              Your calculation was completed successfully.
            </DSInfoBox>
            <DSInfoBox variant="warning" title="Warning">
              Please review your birth date before continuing.
            </DSInfoBox>
            <DSInfoBox variant="error" title="Error">
              Unable to process your request. Please try again.
            </DSInfoBox>
            <DSInfoBox variant="info" title="Tip">
              Master numbers (11, 22, 33) have special significance.
            </DSInfoBox>
          </div>
        </section>

        {/* Forms Section */}
        <section id="forms" className="mb-16">
          <DSSectionHeader title="Form Elements" icon={Box} size="lg" />

          <div className="grid md:grid-cols-2 gap-8 mt-6">
            <DSCard variant="elevated" title="Input Fields">
              <div className="space-y-4">
                <div>
                  <label className="ds-label">Standard Input</label>
                  <input type="text" className="ds-input" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="ds-label">Mystic Input</label>
                  <input type="text" className="ds-input--mystic" placeholder="Enter birth date" />
                </div>
                <div>
                  <label className="ds-label">Select</label>
                  <select className="ds-select">
                    <option>Choose an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
              </div>
            </DSCard>

            <DSCard variant="elevated" title="Textarea">
              <div>
                <label className="ds-label">Your Message</label>
                <textarea className="ds-textarea" placeholder="Write your message here..." rows={4} />
                <p className="ds-helper-text">Maximum 500 characters</p>
              </div>
            </DSCard>
          </div>
        </section>

        {/* Animations Section */}
        <section id="animations" className="mb-16">
          <DSSectionHeader title="Animations" icon={Zap} size="lg" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <DSCard variant="glass" title="Fade In" animationDelay={0}>
              <p className="ds-body-sm text-muted-foreground">ds-animate-fade-in</p>
            </DSCard>
            <DSCard variant="glass" title="Fade In" animationDelay={200}>
              <p className="ds-body-sm text-muted-foreground">delay-200</p>
            </DSCard>
            <DSCard variant="glass" title="Fade In" animationDelay={400}>
              <p className="ds-body-sm text-muted-foreground">delay-400</p>
            </DSCard>
            <DSCard variant="glass" title="Fade In" animationDelay={600}>
              <p className="ds-body-sm text-muted-foreground">delay-600</p>
            </DSCard>
          </div>

          <div className="grid gap-6 mt-8">
            <DSCard variant="elevated" title="Expandable Sections">
              <div className="space-y-2">
                <DSExpandable title="Click to expand" icon={Eye}>
                  <p className="ds-body-sm text-muted-foreground">
                    This content is hidden by default and reveals on click.
                    The chevron icon rotates to indicate the expanded state.
                  </p>
                </DSExpandable>
                <DSExpandable title="Another section" icon={Star} defaultOpen>
                  <p className="ds-body-sm text-muted-foreground">
                    This section starts expanded (defaultOpen=true).
                  </p>
                </DSExpandable>
              </div>
            </DSCard>

            <DSCard variant="elevated" title="Progress Bars">
              <div className="space-y-6">
                <div>
                  <p className="ds-caption mb-2">Primary (75%)</p>
                  <DSProgress value={75} />
                </div>
                <div>
                  <p className="ds-caption mb-2">Success (100%)</p>
                  <DSProgress value={100} variant="success" />
                </div>
                <div>
                  <p className="ds-caption mb-2">Warning (50%)</p>
                  <DSProgress value={50} variant="warning" />
                </div>
                <div>
                  <p className="ds-caption mb-2">Error (25%)</p>
                  <DSProgress value={25} variant="error" />
                </div>
                <div>
                  <p className="ds-caption mb-2">Animated</p>
                  <DSProgress value={60} animated />
                </div>
              </div>
            </DSCard>
          </div>
        </section>

        {/* Spacing Section */}
        <section id="spacing" className="mb-16">
          <DSSectionHeader title="Spacing & Layout" icon={Grid3X3} size="lg" />

          <div className="grid gap-8 mt-6">
            <DSCard variant="elevated" title="Spacing Scale">
              <div className="space-y-4">
                {['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((size) => (
                  <div key={size} className="flex items-center gap-4">
                    <span className="w-12 ds-caption">{size}</span>
                    <div className={`h-4 bg-primary rounded ds-p-${size}`} style={{ width: `var(--space-${size})` }} />
                    <span className="ds-caption text-muted-foreground">
                      var(--space-{size})
                    </span>
                  </div>
                ))}
              </div>
            </DSCard>

            <DSCard variant="elevated" title="Border Radius Scale">
              <div className="flex flex-wrap gap-6">
                {['sm', 'md', 'lg', 'xl', '2xl', 'full'].map((size) => (
                  <div key={size} className="text-center">
                    <div
                      className={`w-16 h-16 bg-primary/20 border border-primary`}
                      style={{ borderRadius: `var(--radius-${size})` }}
                    />
                    <span className="ds-caption mt-2 block">{size}</span>
                  </div>
                ))}
              </div>
            </DSCard>

            <DSCard variant="elevated" title="Shadow Scale">
              <div className="flex flex-wrap gap-6">
                {['sm', 'md', 'lg', 'xl'].map((size) => (
                  <div key={size} className="text-center">
                    <div
                      className={`w-20 h-20 bg-card rounded-xl shadow-${size}`}
                    />
                    <span className="ds-caption mt-2 block">shadow-{size}</span>
                  </div>
                ))}
              </div>
            </DSCard>
          </div>
        </section>

        {/* Color Swatch Component */}
        <section id="color-swatch" className="mb-16">
          <DSSectionHeader title="Color Swatch Component" icon={Palette} size="lg" />

          <DSCard variant="elevated" title="DSColorSwatch Sizes" className="mt-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <DSColorSwatch color="#D4AF37" size="sm" title="Gold Small" />
                <span className="ds-caption block mt-2">SM</span>
              </div>
              <div className="text-center">
                <DSColorSwatch color="#8B5CF6" size="md" title="Purple Medium" />
                <span className="ds-caption block mt-2">MD</span>
              </div>
              <div className="text-center">
                <DSColorSwatch color="#10B981" size="lg" title="Green Large" />
                <span className="ds-caption block mt-2">LG</span>
              </div>
              <div className="text-center">
                <DSColorSwatch color="#F59E0B" size="xl" title="Orange XL" />
                <span className="ds-caption block mt-2">XL</span>
              </div>
            </div>
          </DSCard>
        </section>

        {/* Dividers */}
        <section id="dividers" className="mb-16">
          <DSSectionHeader title="Dividers" icon={Grid3X3} size="lg" />

          <DSCard variant="elevated" className="mt-6">
            <p className="ds-body-sm">Content above divider</p>
            <div className="ds-divider" />
            <p className="ds-body-sm">Content below divider</p>
            <div className="ds-divider--subtle" />
            <p className="ds-body-sm">Content after subtle divider</p>
          </DSCard>
        </section>

        {/* Skeleton Loading */}
        <section id="skeleton" className="mb-16">
          <DSSectionHeader title="Skeleton Loading" icon={Layers} size="lg" />

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="ds-skeleton h-32" />
            <div className="ds-skeleton h-32" />
            <div className="ds-skeleton h-32" />
          </div>
        </section>

      </div>
    </PageLayout>
  );
};

export default DesignSystemShowcase;
