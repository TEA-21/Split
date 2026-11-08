import { create } from 'zustand';
import {
  RoommateProfile,
  RoomListing,
  SwipeDirection,
  MatchItem,
  SearchFilters,
} from '../types';
import { roommateService } from '../services/roommateService';
import { INITIAL_USER_PROFILE } from '../services/mockData';

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

  // Actions
  loadFeed: () => Promise<void>;
  swipe: (direction: SwipeDirection) => Promise<{ isMatch: boolean; match?: MatchItem }>;
  undoSwipe: () => Promise<void>;
  loadMatches: () => Promise<void>;
  dismissMatchModal: () => void;
  setFilters: (newFilters: Partial<SearchFilters>) => void;
  setIsFilterModalVisible: (visible: boolean) => void;
  setIsLocationModalVisible: (visible: boolean) => void;
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
  filters: {
    userMode: 'all',
    budgetMin: 500,
    budgetMax: 2500,
    radiusMiles: 25,
    cleanlinessMin: 1,
    petFriendlyOnly: false,
    nonSmokerOnly: false,
    referenceLocation: { ...INITIAL_USER_PROFILE.coordinates },
    referenceLocationName: INITIAL_USER_PROFILE.locationName,
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

