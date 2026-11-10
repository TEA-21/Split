export type UserMode = 'have_room' | 'need_room';
export type SleepSchedule = 'early_bird' | 'night_owl' | 'flexible';
export type WorkStyle = 'wfh' | 'office' | 'hybrid' | 'student';
export type PetPolicy = 'has_pets' | 'pet_friendly' | 'no_pets';
export type SmokingPolicy = 'non_smoker' | 'smoker' | 'outside_only';
export type GuestPolicy = 'rarely' | 'weekends' | 'flexible';
export type SwipeDirection = 'like' | 'pass' | 'superlike';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RoomListing {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  rentMonthly: number;
  deposit: number;
  privateBath: boolean;
  utilitiesIncluded: boolean;
  hasLaundry: boolean;
  hasParking: boolean;
  photos: string[];
  addressMasked: string;
  availableFrom: string;
  createdAt?: string;
}

export interface RoommateProfile {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  avatarUrl: string;
  photos: string[];
  bio: string;
  userMode: UserMode;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  leaseDurationMonths: number;
  cleanlinessLevel: number; // 1-5
  sleepSchedule: SleepSchedule;
  workStyle: WorkStyle;
  petPolicy: PetPolicy;
  smokingPolicy: SmokingPolicy;
  guestPolicy: GuestPolicy;
  dietaryPref: string;
  coordinates: Coordinates;
  locationName: string;
  distanceKm?: number;
  distanceMiles?: number;
  verifiedEmail: boolean;
  room?: RoomListing;
}

export interface MatchItem {
  id: string;
  matchedUser: RoommateProfile;
  createdAt: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface SearchFilters {
  userMode: 'all' | 'have_room' | 'need_room';
  budgetMin: number;
  budgetMax: number;
  radiusKm: number;
  radiusMiles?: number;
  cleanlinessMin: number;
  petFriendlyOnly: boolean;
  nonSmokerOnly: boolean;
  referenceLocation: Coordinates;
  referenceLocationName: string;
  isGpsActive: boolean;
}

