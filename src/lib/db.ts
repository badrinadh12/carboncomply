import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Activity, UserSettings, ComplianceWeek } from './types';
import { DEFAULT_PERSONAL_TARGET } from './calculations';

// Paths for local persistent filesystem storage
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'carboncomply_db.json');

interface LocalDatabase {
  activities: Activity[];
  settings: UserSettings;
  compliance_weeks: ComplianceWeek[];
}

function getDefaultDatabase(): LocalDatabase {
  return {
    activities: [],
    settings: {
      id: 'default',
      personal_weekly_target: DEFAULT_PERSONAL_TARGET,
      updated_at: new Date().toISOString(),
    },
    compliance_weeks: [],
  };
}

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(getDefaultDatabase(), null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error creating data directory or file:', err);
  }
}

function readLocalDb(): LocalDatabase {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local DB, resetting to default:', err);
    const def = getDefaultDatabase();
    writeLocalDb(def);
    return def;
  }
}

function writeLocalDb(data: LocalDatabase): void {
  ensureDataDir();
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Error writing local DB:', err);
  }
}

// Supabase client initialization
function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key && !url.includes('your-project') && !key.includes('your-key')) {
    try {
      return createClient(url, key, {
        auth: { persistSession: false },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
    }
  }
  return null;
}

export const db = {
  isSupabaseConfigured(): boolean {
    return getSupabaseClient() !== null;
  },

  async getActivities(filter?: {
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Activity[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('activities').select('*').order('activity_date', { ascending: false });
        if (filter?.type && filter.type !== 'all') {
          query = query.eq('activity_type', filter.type);
        }
        if (filter?.startDate) {
          query = query.gte('activity_date', filter.startDate);
        }
        if (filter?.endDate) {
          query = query.lte('activity_date', filter.endDate);
        }
        const { data, error } = await query;
        if (!error && data) return data as Activity[];
        console.warn('Supabase getActivities error, falling back to local:', error);
      } catch (e) {
        console.warn('Supabase query failed, falling back to local:', e);
      }
    }

    // Local fallback
    const local = readLocalDb();
    let acts = [...local.activities];

    if (filter?.type && filter.type !== 'all') {
      acts = acts.filter((a) => a.activity_type === filter.type);
    }
    if (filter?.startDate) {
      acts = acts.filter((a) => a.activity_date >= filter.startDate!);
    }
    if (filter?.endDate) {
      acts = acts.filter((a) => a.activity_date <= filter.endDate!);
    }

    // Sort descending by activity_date, then created_at
    acts.sort((a, b) => {
      const dateCmp = b.activity_date.localeCompare(a.activity_date);
      if (dateCmp !== 0) return dateCmp;
      return b.created_at.localeCompare(a.created_at);
    });

    return acts;
  },

  async createActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const created_at = new Date().toISOString();
    const newAct: Activity = {
      ...activity,
      id,
      created_at,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('activities').insert([newAct]).select().single();
        if (!error && data) return data as Activity;
        console.warn('Supabase createActivity error, writing locally:', error);
      } catch (e) {
        console.warn('Supabase insert failed, falling back to local:', e);
      }
    }

    const local = readLocalDb();
    local.activities.push(newAct);
    writeLocalDb(local);
    return newAct;
  },

  async deleteActivity(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('activities').delete().eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase deleteActivity failed:', e);
      }
    }

    const local = readLocalDb();
    const initialLen = local.activities.length;
    local.activities = local.activities.filter((a) => a.id !== id);
    writeLocalDb(local);
    return local.activities.length < initialLen;
  },

  async getSettings(): Promise<UserSettings> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('user_settings').select('*').limit(1).single();
        if (!error && data) return data as UserSettings;
      } catch (e) {
        console.warn('Supabase getSettings failed:', e);
      }
    }

    const local = readLocalDb();
    return local.settings || {
      id: 'default',
      personal_weekly_target: DEFAULT_PERSONAL_TARGET,
      updated_at: new Date().toISOString(),
    };
  },

  async updateSettings(personalTarget: number): Promise<UserSettings> {
    const updated: UserSettings = {
      id: 'default',
      personal_weekly_target: personalTarget,
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('user_settings').upsert([updated]).select().single();
        if (!error && data) return data as UserSettings;
      } catch (e) {
        console.warn('Supabase updateSettings failed:', e);
      }
    }

    const local = readLocalDb();
    local.settings = updated;
    writeLocalDb(local);
    return updated;
  },

  async resetData(): Promise<void> {
    const def = getDefaultDatabase();
    writeLocalDb(def);
  },

  async seedDemoData(activities: Omit<Activity, 'id' | 'created_at'>[]): Promise<Activity[]> {
    const seeded: Activity[] = [];
    for (const act of activities) {
      const created = await this.createActivity(act);
      seeded.push(created);
    }
    return seeded;
  },
};
