import {
  RoommateProfile,
  RoomListing,
  SwipeDirection,
  MatchItem,
  ChatMessage,
  SearchFilters,
} from '../types';

export interface IRoommateService {
  getFeed(currentUserId: string, filters: SearchFilters): Promise<RoommateProfile[]>;
  submitSwipe(
    swiperId: string,
    targetId: string,
    direction: SwipeDirection
  ): Promise<{ isMatch: boolean; match?: MatchItem }>;
  rewindSwipe(swiperId: string): Promise<RoommateProfile | null>;
  getMatches(currentUserId: string): Promise<MatchItem[]>;
  getMessages(matchId: string): Promise<ChatMessage[]>;
  sendMessage(matchId: string, senderId: string, content: string): Promise<ChatMessage>;
  markMessagesRead(matchId: string, userId: string): Promise<void>;
  updateProfile(profile: Partial<RoommateProfile>): Promise<RoommateProfile>;
  upsertRoom(room: Partial<RoomListing>): Promise<RoomListing>;
  reportUser(
    reporterId: string,
    targetId: string,
    reason: string,
    details?: string,
    isBlock?: boolean
  ): Promise<void>;
  blockUser(userId: string, targetId: string): Promise<void>;
}

