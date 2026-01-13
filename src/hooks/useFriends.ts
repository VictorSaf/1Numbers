// useFriends Hook
// Manages friends state and API interactions

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Friend {
  id: string;
  email: string;
  birthDate: string;
  fullName: string;
  friendshipDate: string;
}

export interface FriendRequest {
  id: string;
  fromUserId?: string;
  toUserId?: string;
  email: string;
  fullName: string;
  message?: string;
  status?: string;
  createdAt: string;
}

export interface InviteLink {
  id: string;
  code: string;
  usesCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  createdAt: string;
  isActive: boolean;
  inviteUrl: string;
}

interface FriendsCounts {
  friendsCount: number;
  pendingRequestsCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  friends?: Friend[];
  requests?: FriendRequest[];
  links?: InviteLink[];
  code?: string;
  inviteUrl?: string;
  friend?: Friend;
  message?: string;
  profile?: FriendProfile;
  friendsCount?: number;
  pendingRequestsCount?: number;
}

interface FriendProfile {
  id: string;
  email: string;
  birthDate: string;
  fullName: string;
  memberSince: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useFriends() {
  const { token, user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [counts, setCounts] = useState<FriendsCounts>({ friendsCount: 0, pendingRequestsCount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithAuth = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE}/api/friends${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      const data = await response.json() as T;
      return data;
    } catch (err) {
      console.error('Friends API error:', err);
      throw err;
    }
  }, [token]);

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth<ApiResponse<Friend[]>>('/');
      if (data?.friends) {
        setFriends(data.friends);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch friends');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  // Fetch received friend requests
  const fetchReceivedRequests = useCallback(async () => {
    try {
      const data = await fetchWithAuth<ApiResponse<FriendRequest[]>>('/requests');
      if (data?.requests) {
        setReceivedRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch received requests:', err);
    }
  }, [fetchWithAuth]);

  // Fetch sent friend requests
  const fetchSentRequests = useCallback(async () => {
    try {
      const data = await fetchWithAuth<ApiResponse<FriendRequest[]>>('/requests/sent');
      if (data?.requests) {
        setSentRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch sent requests:', err);
    }
  }, [fetchWithAuth]);

  // Fetch invite links
  const fetchInviteLinks = useCallback(async () => {
    try {
      const data = await fetchWithAuth<ApiResponse<InviteLink[]>>('/invite-links');
      if (data?.links) {
        setInviteLinks(data.links);
      }
    } catch (err) {
      console.error('Failed to fetch invite links:', err);
    }
  }, [fetchWithAuth]);

  // Fetch counts
  const fetchCounts = useCallback(async () => {
    try {
      const data = await fetchWithAuth<ApiResponse<FriendsCounts>>('/counts');
      if (data) {
        setCounts({
          friendsCount: data.friendsCount || 0,
          pendingRequestsCount: data.pendingRequestsCount || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch counts:', err);
    }
  }, [fetchWithAuth]);

  // Send friend request
  const sendFriendRequest = useCallback(async (email: string, message?: string) => {
    setError(null);
    try {
      const data = await fetchWithAuth<ApiResponse<void>>('/request', {
        method: 'POST',
        body: JSON.stringify({ email, message }),
      });
      if (data?.success) {
        await fetchSentRequests();
        return true;
      } else {
        setError(data?.error || 'Failed to send request');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
      return false;
    }
  }, [fetchWithAuth, fetchSentRequests]);

  // Accept friend request
  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      const data = await fetchWithAuth<ApiResponse<void>>(`/request/${requestId}/accept`, {
        method: 'POST',
      });
      if (data?.success) {
        await Promise.all([fetchFriends(), fetchReceivedRequests(), fetchCounts()]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to accept request:', err);
      return false;
    }
  }, [fetchWithAuth, fetchFriends, fetchReceivedRequests, fetchCounts]);

  // Reject friend request
  const rejectRequest = useCallback(async (requestId: string) => {
    try {
      const data = await fetchWithAuth<ApiResponse<void>>(`/request/${requestId}/reject`, {
        method: 'POST',
      });
      if (data?.success) {
        await fetchReceivedRequests();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to reject request:', err);
      return false;
    }
  }, [fetchWithAuth, fetchReceivedRequests]);

  // Remove friend
  const removeFriend = useCallback(async (friendId: string) => {
    try {
      const data = await fetchWithAuth<ApiResponse<void>>(`/${friendId}`, {
        method: 'DELETE',
      });
      if (data?.success) {
        await Promise.all([fetchFriends(), fetchCounts()]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to remove friend:', err);
      return false;
    }
  }, [fetchWithAuth, fetchFriends, fetchCounts]);

  // Generate invite link
  const generateInviteLink = useCallback(async (maxUses?: number, expiresInDays?: number) => {
    try {
      const data = await fetchWithAuth<ApiResponse<void>>('/invite-link', {
        method: 'POST',
        body: JSON.stringify({ maxUses, expiresInDays }),
      });
      if (data?.success) {
        await fetchInviteLinks();
        return {
          code: data.code,
          inviteUrl: data.inviteUrl,
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to generate invite link:', err);
      return null;
    }
  }, [fetchWithAuth, fetchInviteLinks]);

  // Use invite link
  const useInviteLink = useCallback(async (code: string) => {
    try {
      const data = await fetchWithAuth<ApiResponse<void>>(`/invite/${code}`, {
        method: 'POST',
      });
      if (data?.success) {
        await Promise.all([fetchFriends(), fetchCounts()]);
        return data.friend || null;
      }
      setError(data?.error || 'Invalid invite link');
      return null;
    } catch (err) {
      console.error('Failed to use invite link:', err);
      return null;
    }
  }, [fetchWithAuth, fetchFriends, fetchCounts]);

  // Deactivate invite link
  const deactivateInviteLink = useCallback(async (linkId: string) => {
    try {
      const data = await fetchWithAuth<ApiResponse<void>>(`/invite-link/${linkId}`, {
        method: 'DELETE',
      });
      if (data?.success) {
        await fetchInviteLinks();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to deactivate invite link:', err);
      return false;
    }
  }, [fetchWithAuth, fetchInviteLinks]);

  // Get friend profile for comparison
  const getFriendProfile = useCallback(async (friendId: string): Promise<FriendProfile | null> => {
    try {
      const data = await fetchWithAuth<ApiResponse<FriendProfile>>(`/${friendId}/profile`);
      if (data?.profile) {
        return data.profile;
      }
      return null;
    } catch (err) {
      console.error('Failed to get friend profile:', err);
      return null;
    }
  }, [fetchWithAuth]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    await Promise.all([
      fetchFriends(),
      fetchReceivedRequests(),
      fetchSentRequests(),
      fetchInviteLinks(),
      fetchCounts(),
    ]);
    setIsLoading(false);
  }, [token, fetchFriends, fetchReceivedRequests, fetchSentRequests, fetchInviteLinks, fetchCounts]);

  // Initial fetch
  useEffect(() => {
    if (user && token) {
      refreshAll();
    }
  }, [user, token, refreshAll]);

  return {
    // State
    friends,
    receivedRequests,
    sentRequests,
    inviteLinks,
    counts,
    isLoading,
    error,

    // Actions
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    generateInviteLink,
    useInviteLink,
    deactivateInviteLink,
    getFriendProfile,
    refreshAll,
  };
}

export default useFriends;
