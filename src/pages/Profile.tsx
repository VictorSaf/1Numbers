import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ro, enUS, ru } from 'date-fns/locale';
import { CalendarIcon, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProfiles } from '@/hooks/use-profiles';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { ProfileComparison } from '@/components/ProfileComparison';
import { AIConsultant } from '@/components/AIConsultant';
import { NotificationSettings } from '@/components/NotificationSettings';
import { PageLayout } from '@/components/layout/PageLayout';
import { SectionHead } from '@/components/layout/SectionHead';
import { PageHeader } from '@/components/layout/PageHeader';
import { parseCalendarDate } from '@/lib/calendarDate';
import { PeopleFilter } from '@/components/people/PeopleFilter';
import { PeopleGroup } from '@/components/people/PeopleGroup';
import {
  PROFILE_CATEGORIES,
  groupProfilesByCategory,
  normalizeCategory,
  type ProfileCategory,
} from '@/lib/profileCategories';
import { humanProfileError } from '@/lib/profileErrors';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const locales = { ro, en: enUS, ru };

interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  createdAt: string;
  updatedAt: string;
}

const Profile = () => {
  const { language, t } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profiles, activeProfile, createProfile, updateProfile, deleteProfile, refetch } = useProfiles();

  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  /**
   * Numele și data nașterii de pe harta proprie nu se mai schimbă odată puse.
   *
   * Toată aplicația e construită pe ele -- ziua personală, ecoul din jurnal
   * legat de cifra zilei, citirea întreagă indexată pe amprenta hărții. Aici
   * doar se arată ce refuză serverul oricum: un câmp care se lasă tastat și
   * apoi întoarce 409 e mai rău decât unul care spune de la început că nu.
   *
   * Doar harta proprie. Un copil sau un apropiat rămân de corectat.
   */
  const identityIsFixed =
    editingProfileId !== null &&
    profiles.some((p) => p.id === editingProfileId && normalizeCategory(p.category) === 'eu');
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProfileCategory | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: undefined as Date | undefined,
    birthTime: '',
    birthPlace: '',
    category: 'eu' as ProfileCategory,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const dateLocale = locales[language];

  const counts = Object.fromEntries(
    PROFILE_CATEGORIES.map((category) => [
      category,
      profiles.filter((p) => normalizeCategory(p.category) === category).length,
    ]),
  ) as Record<ProfileCategory, number>;

  const groups = groupProfilesByCategory(profiles).filter(
    (group) => filter === null || group.category === filter,
  );

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/auth');
        return;
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (activeProfile) {
      // If editing this profile or no profile is being edited, show active profile data
      if (editingProfileId === activeProfile.id || !editingProfileId) {
        setFormData({
          fullName: activeProfile.fullName,
          birthDate: parseCalendarDate(activeProfile.birthDate),
          birthTime: activeProfile.birthTime || '',
          birthPlace: activeProfile.birthPlace || '',
          category: normalizeCategory(activeProfile.category),
        });
        // Set editingProfileId to active profile if not already set
        if (!editingProfileId) {
          setEditingProfileId(activeProfile.id);
        }
      }
    } else if (!editingProfileId) {
      // No active profile and not editing - clear form
      setFormData({
        fullName: '',
        birthDate: undefined,
        birthTime: '',
        birthPlace: '',
        category: 'eu',
      });
    }
  }, [activeProfile, editingProfileId]);

  const startEditing = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setEditingProfileId(profileId);
      setFormData({
        fullName: profile.fullName,
        birthDate: parseCalendarDate(profile.birthDate),
        birthTime: profile.birthTime || '',
        birthPlace: profile.birthPlace || '',
        category: normalizeCategory(profile.category),
      });
    }
  };

  const startCreating = () => {
    setEditingProfileId(null);
    setFormData({
      fullName: '',
      birthDate: undefined,
      birthTime: '',
      birthPlace: '',
      category: 'eu',
    });
  };

  const handleSave = async () => {
    if (!formData.fullName.trim() || !formData.birthDate) {
      toast({
        title: t.error,
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      // Format date as YYYY-MM-DD without timezone conversion
      const year = formData.birthDate.getFullYear();
      const month = String(formData.birthDate.getMonth() + 1).padStart(2, '0');
      const day = String(formData.birthDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      const data = {
        fullName: formData.fullName.trim(),
        birthDate: formattedDate,
        birthTime: formData.birthTime || undefined,
        birthPlace: formData.birthPlace || undefined,
        category: formData.category,
      };

      if (editingProfileId) {
        // Update existing profile
        const result = await updateProfile(editingProfileId, data);
        if (result.success) {
          toast({
            title: t.profileSaved,
          });
          setEditingProfileId(null);
          await refetch();
        } else {
          toast({
            title: t.error,
            description: result.error || 'Failed to update profile',
            variant: 'destructive',
          });
        }
      } else {
        // Create new profile (set as active if it's the first one)
        const result = await createProfile({
          ...data,
          setAsActive: formData.category === 'eu' && profiles.length === 0,
        });
        if (result.success) {
          toast({
            title: t.profileSaved,
          });
          await refetch();
        } else {
          // Refuzurile cunoscute sunt reguli, nu avarii: vezi profileErrors.ts.
          const human = humanProfileError(result.error, language as 'ro' | 'en' | 'ru');
          toast(
            human
              ? { title: human.title, description: human.body }
              : { title: t.error, variant: 'destructive' },
          );
        }
      }
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
      toast({
        title: t.error,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProfileId) return;

    try {
      const result = await deleteProfile(deletingProfileId);
      if (result.success) {
        toast({
          title: t.profileDeleted,
        });
        setShowDeleteDialog(false);
        setDeletingProfileId(null);
        if (editingProfileId === deletingProfileId) {
          setEditingProfileId(null);
          startCreating();
        }
        await refetch();
      } else {
        toast({
          title: t.error,
          description: result.error || 'Failed to delete profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: t.error,
        description: 'Failed to delete profile',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-sunken border-2 border-line" />
          <div className="h-4 w-32 bg-sunken rounded" />
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={t.profilePageTitle}
        subtitle={t.profilePageSubtitle}
        badge={{
          icon: <User className="h-4 w-4" />,
          label: t.myProfile
        }}
      />

      {/* Main Content */}
      <main className="relative z-10 pb-16">
        <div className="page-measure pt-4 page-rhythm">
          {/* Profile Switcher */}
          {profiles.length > 0 && (
            <div className="space-y-4">
              <SectionHead index={1} title={t.people.title} question={t.people.subtitle} />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <ProfileSwitcher onProfileSwitch={(id) => startEditing(id)} />
              </div>

              <PeopleFilter selected={filter} counts={counts} onSelect={setFilter} />

              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground font-raleway">{t.people.empty}</p>
              ) : (
                groups.map((group) => (
                  <PeopleGroup
                    key={group.category}
                    category={group.category}
                    profiles={group.profiles}
                    onEdit={startEditing}
                    onDelete={(id) => {
                      setDeletingProfileId(id);
                      setShowDeleteDialog(true);
                    }}
                  />
                ))
              )}

              <Button variant="outline" className="w-full sm:w-auto" onClick={startCreating}>
                {t.createNewProfile}
              </Button>
            </div>
          )}

          {/* Profile Form */}
          <SectionHead index={2} title={t.profilePageTitle} question={t.profilePageSubtitle} />

          <div className="card-mystic py-8">
            {profiles.length === 0 && (
              <div className="mb-6 pt-4 border-t border-line">
                <p className="text-sm text-muted-foreground text-center">
                  {t.profileNotCreated}
                </p>
              </div>
            )}

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground/90 font-raleway text-sm tracking-wide">
                  {t.fullNameLabel}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t.fullNamePlaceholder}
                  className="input-mystic h-12 text-base"
                  disabled={identityIsFixed}
                  readOnly={identityIsFixed}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t.fullNameHint}
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-foreground/90 font-raleway text-sm tracking-wide">
                  {t.people.categoryLabel}
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as ProfileCategory })
                  }
                >
                  <SelectTrigger className="input-mystic h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t.people.categories[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t.people.categoryHints[formData.category]}
                </p>
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label className="text-foreground/90 font-raleway text-sm tracking-wide">
                  {formData.category === 'afacere' ? t.people.foundedLabel : t.birthDateLabel}
                </Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      disabled={identityIsFixed}
                      className={cn(
                        "h-11 w-full justify-start rounded-none border-b border-line px-0 text-left font-normal hover:bg-transparent hover:border-gilt",
                        !formData.birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.birthDate ? (
                        format(formData.birthDate, "d MMMM yyyy", { locale: dateLocale })
                      ) : (
                        <span>{t.birthDatePlaceholder}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.birthDate}
                      onSelect={(date) => {
                        setFormData({ ...formData, birthDate: date });
                        setIsCalendarOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="pointer-events-auto"
                      captionLayout="dropdown-buttons"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Birth Time */}
              <div className="space-y-2">
                <Label htmlFor="birthTime" className="text-foreground/90 font-raleway text-sm tracking-wide">
                  {t.birthTimeLabel}
                </Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  placeholder={t.birthTimePlaceholder}
                  className="input-mystic h-12 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  {t.birthTimeHint}
                </p>
              </div>

              {/* Birth Place */}
              <div className="space-y-2">
                <Label htmlFor="birthPlace" className="text-foreground/90 font-raleway text-sm tracking-wide">
                  {t.birthPlaceLabel}
                </Label>
                <Input
                  id="birthPlace"
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  placeholder={t.birthPlacePlaceholder}
                  className="input-mystic h-12 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  {t.birthPlaceHint}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 h-12"
                  disabled={saving || !formData.fullName.trim() || !formData.birthDate}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : (editingProfileId ? t.editProfile : t.createProfile)}
                </Button>
                {editingProfileId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startCreating}
                    className="h-12"
                  >
                    {t.cancel}
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Profile Comparison */}
          {profiles.length >= 2 && (
            <ProfileComparison />
          )}


          {/* Consultantul stă aici, nu pe pagina de prețuri.
              Întrebarea „și ce înseamnă asta pentru mine?" se naște în fața
              propriilor numere, nu în fața unui tabel de tarife. Componenta
              citește profilul activ, deci ce vede omul pe ecran și ce vede
              modelul în prompt sunt același lucru. */}
          <AIConsultant />
          {/* Notification preferences. The component existed with no importer,
              so the whole permission-and-preferences flow was unreachable. */}
          <NotificationSettings />
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteProfile}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.people.deleteConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setDeletingProfileId(null);
            }}>
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              {t.deleteProfile}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Profile;

