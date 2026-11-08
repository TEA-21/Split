import { IRoommateService } from './IRoommateService';
import { MockRoommateService } from './mockRoommateService';
import { SupabaseRoommateService } from './supabaseRoommateService';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let serviceInstance: IRoommateService | null = null;

export function getRoommateService(): IRoommateService {
  if (!serviceInstance) {
    if (supabaseUrl && supabaseAnonKey) {
      console.log('Connecting to cloud Supabase backend');
      serviceInstance = new SupabaseRoommateService(supabaseUrl, supabaseAnonKey);
    } else {
      console.log('Running in high-fidelity offline mock mode');
      serviceInstance = new MockRoommateService();
    }
  }
  return serviceInstance;
}

export const roommateService = getRoommateService();

