import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RoommateProfile,
  RoomListing,
  SwipeDirection,
  MatchItem,
  SearchFilters,
} from '../types';
import { roommateService } from '../services/roommateService';
import { INITIAL_USER_PROFILE } from '../services/mockData';

export type ThemePreference = 'system' | 'light' | 'dark';

interface AppState {
  currentUser: RoommateProfile;
  feed: RoommateProfile[];
  swipedHistory: RoommateProfile[];
  matches: MatchItem[];
  activeMatch: MatchItem | null;
  filters: SearchFilters;
  isLoading: boolean;
  isFilterModalVisible: boolean;
  isLocationModalVisible: boolean;
  themePreference: ThemePreference;

  // Actions
  loadFeed: () => Promise<void>;
  swipe: (direction: SwipeDirection) => Promise<{ isMatch: boolean; match?: MatchItem }>;
  undoSwipe: () => Promise<void>;
  loadMatches: () => Promise<void>;
  dismissMatchModal: () => void;
  setFilters: (newFilters: Partial<SearchFilters>) => void;
  setIsFilterModalVisible: (visible: boolean) => void;
  setIsLocationModalVisible: (visible: boolean) => void;
  setThemePreference: (pref: ThemePreference) => void;
  updateUserProfile: (profile: Partial<RoommateProfile>) => Promise<void>;
  updateRoom: (room: Partial<RoomListing>) => Promise<void>;
  reportAndBlockUser: (targetId: string, reason: string, details?: string, isBlock?: boolean) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: { ...INITIAL_USER_PROFILE },
  feed: [],
  swipedHistory: [],
  matches: [],
  activeMatch: null,
  themePreference: 'system',
  filters: {
    userMode: 'all',
    budgetMin: 5000,
    budgetMax: 40000,
    radiusKm: 25,
    radiusMiles: 15,
    cleanlinessMin: 1,
    petFriendlyOnly: false,
    nonSmokerOnly: false,
    referenceLocation: { latitude: 12.9352, longitude: 77.6245 },
    referenceLocationName: 'Koramangala, Bengaluru',
    isGpsActive: false,
  },
  isLoading: false,
  isFilterModalVisible: false,
  isLocationModalVisible: false,

  loadFeed: async () => {
    set({ isLoading: true });
    try {
      const { currentUser, filters } = get();
      const profiles = await roommateService.getFeed(currentUser.id, filters);
      set({ feed: profiles, isLoading: false });
    } catch (error) {
      console.error('Failed to load feed:', error);
      set({ isLoading: false });
    }
  },

  swipe: async (direction: SwipeDirection) => {
    const { feed, currentUser, swipedHistory } = get();
    if (feed.length === 0) return { isMatch: false };

    const topProfile = feed[0];
    const remainingFeed = feed.slice(1);

    // Optimistically update UI
    set({
      feed: remainingFeed,
      swipedHistory: [topProfile, ...swipedHistory.slice(0, 9)],
    });

    try {
      const result = await roommateService.submitSwipe(currentUser.id, topProfile.id, direction);
      if (result.isMatch && result.match) {
        set({
          activeMatch: result.match,
          matches: [result.match, ...get().matches],
        });
      }
      return result;
    } catch (error) {
      console.error('Swipe submission failed:', error);
      return { isMatch: false };
    }
  },

  undoSwipe: async () => {
    const { swipedHistory, feed, currentUser } = get();
    if (swipedHistory.length === 0) return;

    const restoredProfile = swipedHistory[0];
    const newHistory = swipedHistory.slice(1);

    set({
      feed: [restoredProfile, ...feed],
      swipedHistory: newHistory,
    });

    try {
      await roommateService.rewindSwipe(currentUser.id);
      // Reload matches in case rewound swipe had caused a match
      await get().loadMatches();
    } catch (error) {
      console.error('Rewind failed:', error);
    }
  },

  loadMatches: async () => {
    try {
      const { currentUser } = get();
      const matches = await roommateService.getMatches(currentUser.id);
      set({ matches });
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  },

  dismissMatchModal: () => {
    set({ activeMatch: null });
  },

  setFilters: (newFilters: Partial<SearchFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().loadFeed();
  },

  setIsFilterModalVisible: (visible: boolean) => {
    set({ isFilterModalVisible: visible });
  },

  setIsLocationModalVisible: (visible: boolean) => {
    set({ isLocationModalVisible: visible });
  },

  setThemePreference: (pref: ThemePreference) => {
    set({ themePreference: pref });
    AsyncStorage.setItem('@split_theme_pref', pref).catch(() => {});
  },

  updateUserProfile: async (profile: Partial<RoommateProfile>) => {
    try {
      const updated = await roommateService.updateProfile(profile);
      set({ currentUser: updated });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  },

  updateRoom: async (room: Partial<RoomListing>) => {
    try {
      const updatedRoom = await roommateService.upsertRoom(room);
      set((state) => ({
        currentUser: {
          ...state.currentUser,
          userMode: 'have_room',
          room: updatedRoom,
        },
      }));
    } catch (error) {
      console.error('Failed to update room:', error);
    }
  },

  reportAndBlockUser: async (targetId: string, reason: string, details?: string, isBlock = false) => {
    try {
      const { currentUser } = get();
      await roommateService.reportUser(currentUser.id, targetId, reason, details, isBlock);
      // Remove from feed and matches immediately
      set((state) => ({
        feed: state.feed.filter((p) => p.id !== targetId),
        matches: state.matches.filter((m) => m.matchedUser.id !== targetId),
      }));
    } catch (error) {
      console.error('Failed to report user:', error);
    }
  },
}));

// Hydrate stored theme preference on startup
AsyncStorage.getItem('@split_theme_pref').then((val) => {
  if (val === 'light' || val === 'dark' || val === 'system') {
    useAppStore.setState({ themePreference: val as ThemePreference });
  }
}).catch(() => {});


