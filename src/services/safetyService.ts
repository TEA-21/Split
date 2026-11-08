import AsyncStorage from '@react-native-async-storage/async-storage';

const SAFETY_STORAGE_KEY = 'split_safety_reports_v1';

export interface UserReportRecord {
  id: string;
  reporterId: string;
  targetId: string;
  reason: string;
  details?: string;
  createdAt: string;
}

export async function saveReportLocally(
  reporterId: string,
  targetId: string,
  reason: string,
  details?: string
): Promise<UserReportRecord> {
  const newReport: UserReportRecord = {
    id: `report_${Date.now()}`,
    reporterId,
    targetId,
    reason,
    details,
    createdAt: new Date().toISOString(),
  };

  try {
    const raw = await AsyncStorage.getItem(SAFETY_STORAGE_KEY);
    const reports: UserReportRecord[] = raw ? JSON.parse(raw) : [];
    reports.push(newReport);
    await AsyncStorage.setItem(SAFETY_STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.warn('Error saving local report:', e);
  }

  return newReport;
}
