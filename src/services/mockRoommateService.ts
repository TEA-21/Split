import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RoommateProfile,
  RoomListing,
  SwipeDirection,
  MatchItem,
  ChatMessage,
  SearchFilters,
} from '../types';
import { IRoommateService } from './IRoommateService';
import { MOCK_PROFILES, INITIAL_USER_PROFILE } from './mockData';
import { calculateDistanceMiles } from './locationService';

const STORAGE_KEYS = {
  SWIPES: 'split_swipes_v1',
  MATCHES: 'split_matches_v1',
  MESSAGES: 'split_messages_v1',
  REPORTS: 'split_reports_v1',
  BLOCKS: 'split_blocks_v1',
  USER_PROFILE: 'split_user_profile_v1',
};

// Seed profiles that will reciprocate a like immediately for demo delight
const RECIPROCAL_MATCH_IDS = ['user-002', 'user-006'];

export class MockRoommateService implements IRoommateService {
  private profiles: RoommateProfile[] = [...MOCK_PROFILES];
  private currentProfile: RoommateProfile = { ...INITIAL_USER_PROFILE };
  private swipes: { swiperId: string; targetId: string; direction: SwipeDirection; timestamp: number }[] = [];
  private matches: MatchItem[] = [];
  private messages: Record<string, ChatMessage[]> = {};
  private reports: { reporterId: string; targetId: string; reason: string; details?: string }[] = [];
  private blockedIds: Set<string> = new Set();
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;
    try {
      const [storedSwipes, storedMatches, storedMessages, storedBlocks, storedProfile] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SWIPES),
        AsyncStorage.getItem(STORAGE_KEYS.MATCHES),
        AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.BLOCKS),
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
      ]);

      if (storedSwipes) this.swipes = JSON.parse(storedSwipes);
      if (storedMatches) this.matches = JSON.parse(storedMatches);
      if (storedMessages) this.messages = JSON.parse(storedMessages);
      if (storedBlocks) this.blockedIds = new Set(JSON.parse(storedBlocks));
      if (storedProfile) this.currentProfile = JSON.parse(storedProfile);
    } catch (e) {
      console.warn('Storage read failed, running in-memory mock', e);
    }
    this.initialized = true;
  }

  private async persist(key: string, data: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  async getFeed(currentUserId: string, filters: SearchFilters): Promise<RoommateProfile[]> {
    await this.initialize();

    const swipedTargetIds = new Set(
      this.swipes
        .filter((s) => s.swiperId === currentUserId)
        .map((s) => s.targetId)
    );

    const reportedTargetIds = new Set(
      this.reports
        .filter((r) => r.reporterId === currentUserId)
        .map((r) => r.targetId)
    );

    return this.profiles
      .filter((profile) => {
        if (profile.id === currentUserId) return false;
        if (swipedTargetIds.has(profile.id)) return false;
        if (reportedTargetIds.has(profile.id)) return false;
        if (this.blockedIds.has(profile.id)) return false;

        // User mode filter
        if (filters.userMode !== 'all' && profile.userMode !== filters.userMode) {
          return false;
        }

        // Budget overlap check
        if (profile.budgetMin > filters.budgetMax || profile.budgetMax < filters.budgetMin) {
          return false;
        }

        // Cleanliness filter
        if (profile.cleanlinessLevel < filters.cleanlinessMin) {
          return false;
        }

        // Pet policy filter
        if (filters.petFriendlyOnly && profile.petPolicy === 'no_pets') {
          return false;
        }

        // Non-smoker filter
        if (filters.nonSmokerOnly && profile.smokingPolicy === 'smoker') {
          return false;
        }

        // Spatial radius filter
        const distance = calculateDistanceMiles(filters.referenceLocation, profile.coordinates);
        if (distance > filters.radiusMiles) {
          return false;
        }

        return true;
      })
      .map((profile) => ({
        ...profile,
        distanceMiles: calculateDistanceMiles(filters.referenceLocation, profile.coordinates),
      }))
      .sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));
  }

  async submitSwipe(
    swiperId: string,
    targetId: string,
    direction: SwipeDirection
  ): Promise<{ isMatch: boolean; match?: MatchItem }> {
    await this.initialize();

    // Remove any existing swipe to support upsert
    this.swipes = this.swipes.filter((s) => !(s.swiperId === swiperId && s.targetId === targetId));
    this.swipes.push({ swiperId, targetId, direction, timestamp: Date.now() });
    await this.persist(STORAGE_KEYS.SWIPES, this.swipes);

    const isReciprocalLike =
      (direction === 'like' || direction === 'superlike') &&
      RECIPROCAL_MATCH_IDS.includes(targetId);

    if (isReciprocalLike) {
      const targetUser = this.profiles.find((p) => p.id === targetId);
      if (targetUser) {
        const matchId = `match_${swiperId}_${targetId}`;
        const existingIndex = this.matches.findIndex((m) => m.id === matchId);

        const newMatch: MatchItem = {
          id: matchId,
          matchedUser: targetUser,
          createdAt: new Date().toISOString(),
          lastMessage: undefined,
          unreadCount: 0,
        };

        if (existingIndex >= 0) {
          this.matches[existingIndex] = newMatch;
        } else {
          this.matches.unshift(newMatch);
        }

        await this.persist(STORAGE_KEYS.MATCHES, this.matches);

        // Schedule simulated automated greeting message after 2.5s
        setTimeout(async () => {
          const greetings = [
            `Hey ${this.currentProfile.fullName.split(' ')[0]}! Loved your profile. Are you still looking to split rent in ${targetUser.locationName}?`,
            `Hi! Saw we have super similar living habits. When are you looking to move in?`,
            `Hey! Your budget and move-in timeline match what I'm looking for. Would love to chat!`,
          ];
          const text = greetings[Math.floor(Math.random() * greetings.length)];
          await this.sendMessage(matchId, targetId, text);
        }, 2500);

        return { isMatch: true, match: newMatch };
      }
    }

    return { isMatch: false };
  }

  async rewindSwipe(swiperId: string): Promise<RoommateProfile | null> {
    await this.initialize();
    const lastSwipe = this.swipes[this.swipes.length - 1];
    if (!lastSwipe || lastSwipe.swiperId !== swiperId) {
      return null;
    }

    this.swipes.pop();
    await this.persist(STORAGE_KEYS.SWIPES, this.swipes);

    // If rewinded swipe caused a match, clean it up
    const matchId = `match_${swiperId}_${lastSwipe.targetId}`;
    this.matches = this.matches.filter((m) => m.id !== matchId);
    await this.persist(STORAGE_KEYS.MATCHES, this.matches);

    const profile = this.profiles.find((p) => p.id === lastSwipe.targetId);
    return profile || null;
  }

  async getMatches(currentUserId: string): Promise<MatchItem[]> {
    await this.initialize();
    return [...this.matches];
  }

  async getMessages(matchId: string): Promise<ChatMessage[]> {
    await this.initialize();
    return this.messages[matchId] || [];
  }

  async sendMessage(matchId: string, senderId: string, content: string): Promise<ChatMessage> {
    await this.initialize();

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      matchId,
      senderId,
      content,
      createdAt: new Date().toISOString(),
    };

    if (!this.messages[matchId]) {
      this.messages[matchId] = [];
    }
    this.messages[matchId].push(newMessage);
    await this.persist(STORAGE_KEYS.MESSAGES, this.messages);

    // Update lastMessage on match
    const match = this.matches.find((m) => m.id === matchId);
    if (match) {
      match.lastMessage = content;
      match.lastMessageTimestamp = newMessage.createdAt;
      if (senderId !== this.currentProfile.id) {
        match.unreadCount = (match.unreadCount || 0) + 1;
      }
      await this.persist(STORAGE_KEYS.MATCHES, this.matches);
    }

    return newMessage;
  }

  async markMessagesRead(matchId: string, userId: string): Promise<void> {
    await this.initialize();
    const match = this.matches.find((m) => m.id === matchId);
    if (match) {
      match.unreadCount = 0;
      await this.persist(STORAGE_KEYS.MATCHES, this.matches);
    }

    const thread = this.messages[matchId];
    if (thread) {
      const now = new Date().toISOString();
      thread.forEach((msg) => {
        if (msg.senderId !== userId && !msg.readAt) {
          msg.readAt = now;
        }
      });
      await this.persist(STORAGE_KEYS.MESSAGES, this.messages);
    }
  }

  async updateProfile(profile: Partial<RoommateProfile>): Promise<RoommateProfile> {
    await this.initialize();
    this.currentProfile = {
      ...this.currentProfile,
      ...profile,
    };
    await this.persist(STORAGE_KEYS.USER_PROFILE, this.currentProfile);
    return { ...this.currentProfile };
  }

  async upsertRoom(room: Partial<RoomListing>): Promise<RoomListing> {
    await this.initialize();
    const existing = this.currentProfile.room;
    const updatedRoom: RoomListing = {
      id: existing?.id || `room_${Date.now()}`,
      ownerId: this.currentProfile.id,
      title: room.title || existing?.title || 'Comfortable Room in Shared Apartment',
      description: room.description || existing?.description || '',
      rentMonthly: room.rentMonthly ?? existing?.rentMonthly ?? 1000,
      deposit: room.deposit ?? existing?.deposit ?? 1000,
      privateBath: room.privateBath ?? existing?.privateBath ?? false,
      utilitiesIncluded: room.utilitiesIncluded ?? existing?.utilitiesIncluded ?? false,
      hasLaundry: room.hasLaundry ?? existing?.hasLaundry ?? true,
      hasParking: room.hasParking ?? existing?.hasParking ?? false,
      photos: room.photos || existing?.photos || [],
      addressMasked: room.addressMasked || existing?.addressMasked || 'Address hidden until match',
      availableFrom: room.availableFrom || existing?.availableFrom || new Date().toISOString().split('T')[0],
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    this.currentProfile.room = updatedRoom;
    this.currentProfile.userMode = 'have_room';
    await this.persist(STORAGE_KEYS.USER_PROFILE, this.currentProfile);

    return updatedRoom;
  }

  async reportUser(
    reporterId: string,
    targetId: string,
    reason: string,
    details?: string,
    isBlock = false
  ): Promise<void> {
    await this.initialize();
    this.reports.push({ reporterId, targetId, reason, details });
    await this.persist(STORAGE_KEYS.REPORTS, this.reports);

    if (isBlock) {
      await this.blockUser(reporterId, targetId);
    }
  }

  async blockUser(userId: string, targetId: string): Promise<void> {
    await this.initialize();
    this.blockedIds.add(targetId);
    await this.persist(STORAGE_KEYS.BLOCKS, Array.from(this.blockedIds));

    // Delete matches between the two users
    this.matches = this.matches.filter((m) => m.matchedUser.id !== targetId);
    await this.persist(STORAGE_KEYS.MATCHES, this.matches);
  }
}

