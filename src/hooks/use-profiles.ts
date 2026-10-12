import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { ProfileCategory } from '@/lib/profileCategories';

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  category: ProfileCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cheia listei de profiluri în cache-ul React Query.
 *
 * Una singură pentru toată aplicația: pe /eu pagina, comutatorul, comparația și
 * consultantul citesc aceeași listă, iar înainte o cerea fiecare la montare --
 * patru `GET /profiles/all` pentru același răspuns, și o comutare făcută într-un
 * loc nu se vedea în celelalte. Utilizatorul intră în cheie ca un cont nou să
 * nu vadă, nici o clipă, lista celui de dinainte.
 */
export const PROFILES_KEY = ['profiles'] as const;

export const useProfiles = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...PROFILES_KEY, user?.id ?? null],
    queryFn: async () => {
      const response = await api.getAllProfiles();
      // Un răspuns fără succes e o eroare, nu o listă goală: altfel ar sta în
      // cache drept „n-ai nicio hartă” până expiră.
      if (!response.success || !response.profiles) throw new Error('Failed to load profiles');
      return response.profiles as Profile[];
    },
    // Fără token nu se cere nimic, ca înainte: serverul ar răspunde 401.
    enabled: isAuthenticated,
    // Spus aici, nu lăsat pe seama celor cinci minute implicite din App: cine
    // se montează după ce lista a sosit (butonul de salvare de sub hartă, de
    // exemplu) n-o mai cere, dar o hartă schimbată pe alt dispozitiv se vede
    // după cel mult un minut. Schimbările făcute aici o invalidează imediat.
    staleTime: 60 * 1000,
  });

  // Datele rămân în cache și după ieșirea din cont; nu se arată nimănui.
  const profiles = useMemo(
    () => (isAuthenticated ? query.data ?? [] : []),
    [isAuthenticated, query.data],
  );
  const activeProfile = profiles.find(p => p.isActive) || profiles[0] || null;
  const loading = isAuthenticated && query.isLoading;

  // Invalidarea reîncarcă lista o dată, pentru toți cei care o citesc.
  const loadProfiles = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: PROFILES_KEY });
  }, [queryClient]);

  const switchProfile = useCallback(async (profileId: string) => {
    try {
      const response = await api.setActiveProfile(profileId);
      if (response.success) {
        // Reload profiles to get updated state
        await loadProfiles();
        return { success: true };
      }
      return { success: false, error: 'Failed to switch profile' };
    } catch (error) {
      console.error('Error switching profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to switch profile' 
      };
    }
  }, [loadProfiles]);

  const createProfile = useCallback(async (data: {
    fullName: string;
    birthDate: string;
    birthTime?: string;
    birthPlace?: string;
    category?: ProfileCategory;
    setAsActive?: boolean;
  }) => {
    try {
      const response = await api.createProfile(data);
      if (response.success) {
        await loadProfiles();
        return { success: true, profile: response.profile };
      }
      return { success: false, error: 'Failed to create profile' };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create profile' 
      };
    }
  }, [loadProfiles]);

  const updateProfile = useCallback(async (profileId: string, data: {
    fullName: string;
    birthDate: string;
    birthTime?: string;
    birthPlace?: string;
    category?: ProfileCategory;
  }) => {
    try {
      const response = await api.updateProfile(profileId, data);
      if (response.success) {
        await loadProfiles();
        return { success: true, profile: response.profile };
      }
      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      };
    }
  }, [loadProfiles]);

  const deleteProfile = useCallback(async (profileId: string) => {
    try {
      const response = await api.deleteProfile(profileId);
      if (response.success) {
        await loadProfiles();
        return { success: true };
      }
      return { success: false, error: 'Failed to delete profile' };
    } catch (error) {
      console.error('Error deleting profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete profile' 
      };
    }
  }, [loadProfiles]);

  return {
    profiles,
    activeProfile,
    loading,
    refetch: loadProfiles,
    switchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    hasProfiles: profiles.length > 0,
  };
};

