import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  RoommateProfile,
  RoomListing,
  SwipeDirection,
  MatchItem,
  ChatMessage,
  SearchFilters,
} from '../types';
import { IRoommateService } from './IRoommateService';
import { assertValidUuid } from '../utils/security';

export class SupabaseRoommateService implements IRoommateService {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.client = createClient(supabaseUrl, supabaseAnonKey);
  }

  async getFeed(currentUserId: string, filters: SearchFilters): Promise<RoommateProfile[]> {
    assertValidUuid(currentUserId, 'currentUserId');
    const { data, error } = await this.client.rpc('get_roommate_feed', {
      current_user_id: currentUserId,
      ref_lat: filters.referenceLocation.latitude,
      ref_lng: filters.referenceLocation.longitude,
      radius_miles: filters.radiusMiles,
      filter_mode: filters.userMode,
      budget_min_filter: filters.budgetMin,
      budget_max_filter: filters.budgetMax,
      cleanliness_min: filters.cleanlinessMin,
      pet_friendly_only: filters.petFriendlyOnly,
      non_smoker_only: filters.nonSmokerOnly,
    });

    if (error) {
      console.error('Error fetching Supabase feed:', error);
      throw error;
    }

    return (data || []).map((row: any) => this.mapProfileRow(row));
  }

  async submitSwipe(
    swiperId: string,
    targetId: string,
    direction: SwipeDirection
  ): Promise<{ isMatch: boolean; match?: MatchItem }> {
    assertValidUuid(swiperId, 'swiperId');
    assertValidUuid(targetId, 'targetId');
    const { error } = await this.client
      .from('swipes')
      .upsert(
        { swiper_id: swiperId, target_id: targetId, direction },
        { onConflict: 'swiper_id,target_id' }
      );

    if (error) throw error;

    if (direction === 'like' || direction === 'superlike') {
      const first = swiperId < targetId ? swiperId : targetId;
      const second = swiperId < targetId ? targetId : swiperId;

      const { data: matchData } = await this.client
        .from('matches')
        .select('id, user_a, user_b, created_at, profiles!user_b(*)')
        .eq('user_a', first)
        .eq('user_b', second)
        .maybeSingle();

      if (matchData) {
        const { data: targetProfile } = await this.client
          .from('profiles')
          .select('*, rooms(*)')
          .eq('id', targetId)
          .single();

        if (targetProfile) {
          const matchItem: MatchItem = {
            id: matchData.id,
            matchedUser: this.mapProfileRow(targetProfile),
            createdAt: matchData.created_at,
            unreadCount: 0,
          };
          return { isMatch: true, match: matchItem };
        }
      }
    }

    return { isMatch: false };
  }

  async rewindSwipe(swiperId: string): Promise<RoommateProfile | null> {
    assertValidUuid(swiperId, 'swiperId');
    const { data: latestSwipe } = await this.client
      .from('swipes')
      .select('target_id')
      .eq('swiper_id', swiperId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestSwipe) return null;

    const { error } = await this.client
      .from('swipes')
      .delete()
      .eq('swiper_id', swiperId)
      .eq('target_id', latestSwipe.target_id);

    if (error) throw error;

    const { data: profile } = await this.client
      .from('profiles')
      .select('*, rooms(*)')
      .eq('id', latestSwipe.target_id)
      .single();

    return profile ? this.mapProfileRow(profile) : null;
  }

  async getMatches(currentUserId: string): Promise<MatchItem[]> {
    assertValidUuid(currentUserId, 'currentUserId');
    const { data, error } = await this.client
      .from('matches')
      .select(`
        id,
        user_a,
        user_b,
        created_at,
        last_interaction_at,
        messages(content, created_at)
      `)
      .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)
      .order('last_interaction_at', { ascending: false });

    if (error) throw error;

    const matches: MatchItem[] = [];
    for (const row of data || []) {
      const partnerId = row.user_a === currentUserId ? row.user_b : row.user_a;
      const { data: profile } = await this.client
        .from('profiles')
        .select('*, rooms(*)')
        .eq('id', partnerId)
        .single();

      if (profile) {
        const lastMsg = row.messages?.[row.messages.length - 1];
        matches.push({
          id: row.id,
          matchedUser: this.mapProfileRow(profile),
          createdAt: row.created_at,
          lastMessage: lastMsg?.content,
          lastMessageTimestamp: lastMsg?.created_at,
          unreadCount: 0,
        });
      }
    }

    return matches;
  }

  async getMessages(matchId: string): Promise<ChatMessage[]> {
    assertValidUuid(matchId, 'matchId');
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((m: any) => ({
      id: m.id,
      matchId: m.match_id,
      senderId: m.sender_id,
      content: m.content,
      createdAt: m.created_at,
      readAt: m.read_at,
    }));
  }

  async sendMessage(matchId: string, senderId: string, content: string): Promise<ChatMessage> {
    assertValidUuid(matchId, 'matchId');
    assertValidUuid(senderId, 'senderId');
    const { data, error } = await this.client
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      matchId: data.match_id,
      senderId: data.sender_id,
      content: data.content,
      createdAt: data.created_at,
      readAt: data.read_at,
    };
  }

  async markMessagesRead(matchId: string, userId: string): Promise<void> {
    assertValidUuid(matchId, 'matchId');
    assertValidUuid(userId, 'userId');
    await this.client
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('match_id', matchId)
      .neq('sender_id', userId)
      .is('read_at', null);
  }

  async updateProfile(profile: Partial<RoommateProfile>): Promise<RoommateProfile> {
    const { data, error } = await this.client
      .from('profiles')
      .update({
        full_name: profile.fullName,
        bio: profile.bio,
        budget_min: profile.budgetMin,
        budget_max: profile.budgetMax,
        cleanliness_level: profile.cleanlinessLevel,
        sleep_schedule: profile.sleepSchedule,
        work_style: profile.workStyle,
        pet_policy: profile.petPolicy,
        smoking_policy: profile.smokingPolicy,
        guest_policy: profile.guestPolicy,
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) throw error;
    return this.mapProfileRow(data);
  }

  async upsertRoom(room: Partial<RoomListing>): Promise<RoomListing> {
    const { data, error } = await this.client
      .from('rooms')
      .upsert(
        {
          owner_id: room.ownerId,
          title: room.title,
          description: room.description,
          rent_monthly: room.rentMonthly,
          deposit: room.deposit,
          private_bath: room.privateBath,
          utilities_included: room.utilitiesIncluded,
          has_laundry: room.hasLaundry,
          has_parking: room.hasParking,
          photos: room.photos,
          address_masked: room.addressMasked,
          available_from: room.availableFrom,
        },
        { onConflict: 'owner_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return this.mapRoomRow(data);
  }

  async reportUser(
    reporterId: string,
    targetId: string,
    reason: string,
    details?: string,
    isBlock = false
  ): Promise<void> {
    assertValidUuid(reporterId, 'reporterId');
    assertValidUuid(targetId, 'targetId');
    const { error } = await this.client.from('user_reports').insert({
      reporter_id: reporterId,
      reported_id: targetId,
      reason,
      details,
      is_block: isBlock,
    });

    if (error) throw error;
  }

  async blockUser(userId: string, targetId: string): Promise<void> {
    await this.reportUser(userId, targetId, 'User block', undefined, true);
  }

  private mapProfileRow(row: any): RoommateProfile {
    const room = row.room_data || (row.rooms ? row.rooms[0] : undefined);
    return {
      id: row.id,
      fullName: row.full_name || row.fullName,
      age: row.age,
      gender: row.gender,
      avatarUrl: row.avatar_url || row.avatarUrl,
      photos: row.photos || [],
      bio: row.bio || '',
      userMode: row.user_mode || row.userMode,
      budgetMin: row.budget_min ?? row.budgetMin ?? 0,
      budgetMax: row.budget_max ?? row.budgetMax ?? 9999,
      moveInDate: row.move_in_date || row.moveInDate || '',
      leaseDurationMonths: row.lease_duration_months || row.leaseDurationMonths || 12,
      cleanlinessLevel: row.cleanliness_level || row.cleanlinessLevel || 3,
      sleepSchedule: row.sleep_schedule || row.sleepSchedule || 'flexible',
      workStyle: row.work_style || row.workStyle || 'hybrid',
      petPolicy: row.pet_policy || row.petPolicy || 'pet_friendly',
      smokingPolicy: row.smoking_policy || row.smokingPolicy || 'non_smoker',
      guestPolicy: row.guest_policy || row.guestPolicy || 'weekends',
      dietaryPref: row.dietary_pref || row.dietaryPref || '',
      coordinates: {
        latitude: row.latitude ?? 47.6062,
        longitude: row.longitude ?? -122.3321,
      },
      locationName: row.target_location_name || row.locationName || 'Nearby',
      distanceMiles: row.distance_miles ?? row.distanceMiles,
      verifiedEmail: row.verified_email ?? row.verifiedEmail ?? false,
      room: room ? this.mapRoomRow(room) : undefined,
    };
  }

  private mapRoomRow(row: any): RoomListing {
    return {
      id: row.id,
      ownerId: row.ownerId || row.owner_id,
      title: row.title,
      description: row.description,
      rentMonthly: row.rentMonthly ?? row.rent_monthly ?? 0,
      deposit: row.deposit ?? 0,
      privateBath: row.privateBath ?? row.private_bath ?? false,
      utilitiesIncluded: row.utilitiesIncluded ?? row.utilities_included ?? false,
      hasLaundry: row.hasLaundry ?? row.has_laundry ?? false,
      hasParking: row.hasParking ?? row.has_parking ?? false,
      photos: row.photos || [],
      addressMasked: row.addressMasked || row.address_masked || '',
      availableFrom: row.availableFrom || row.available_from || '',
      createdAt: row.createdAt || row.created_at,
    };
  }
}

