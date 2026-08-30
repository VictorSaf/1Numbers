import { useProfiles, Profile } from './use-profiles';
import { parseCalendarDate } from '@/lib/calendarDate';

/**
 * Legacy hook for backward compatibility
 * Now uses useProfiles hook internally to get active profile
 */
export const useProfile = () => {
  const { activeProfile, loading } = useProfiles();

  return {
    profile: activeProfile,
    loading,
    refetch: () => {}, // Use useProfiles().refetch() instead
    hasProfile: !!activeProfile,
    profileData: activeProfile ? {
      fullName: activeProfile.fullName,
      birthDate: parseCalendarDate(activeProfile.birthDate),
      birthTime: activeProfile.birthTime,
      birthPlace: activeProfile.birthPlace,
    } : null,
  };
};

// Export Profile type for backward compatibility
export type { Profile as UserProfile };

