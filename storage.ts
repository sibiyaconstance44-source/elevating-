import { UserProgress, AdminSettings, StudyGroup, GroupMessage, Lesson, PastPaper } from '../types';
import { INITIAL_BADGES, INITIAL_STUDY_GROUPS } from '../data/curriculum';
import { OfflineCache, OfflineStats } from './offlineCache';

const USER_STORAGE_KEY = 'elevate_user_profile_v1';
const DATA_SAVER_KEY = 'elevate_data_saver_mode';
const ADMIN_CONFIG_KEY = 'elevate_admin_settings_v1';
const STUDY_GROUPS_KEY = 'elevate_study_groups_v1';
const OFFLINE_LESSONS_CACHE_KEY = 'elevate_offline_lessons_cache';

export interface OfflineSavedLesson {
  lessonId: string;
  savedAt: string;
  notes: string;
  quizScore?: number;
}

// Local SQLite-like Key-Value & Document Engine for fast offline access
export const StorageService = {
  // --- USER AUTH & PROGRESS ---
  getUser(): UserProgress | null {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  async saveUser(user: UserProgress, syncToCloud: boolean = true): Promise<void> {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      if (syncToCloud) {
        // Asynchronously sync with server API
        await this.syncWithServer(user);
      }
    } catch (err) {
      console.warn('Storage save warning:', err);
    }
  },

  async syncWithServer(user: UserProgress): Promise<boolean> {
    try {
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        return true;
      }
      return false;
    } catch (err) {
      console.log('Server sync skipped in offline mode:', err);
      return false;
    }
  },

  async loginServer(phone: string, pin: string, name?: string, grade?: string): Promise<UserProgress> {
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin, name, grade }),
      });
      if (res.ok) {
        const cloudUser = await res.json();
        if (cloudUser) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(cloudUser));
          return cloudUser;
        }
      }
    } catch (err) {
      console.warn('Server login error, using local fallback:', err);
    }

    // Local fallback if server unreachable
    const existing = this.getUser();
    if (existing && existing.phoneNumber === phone) {
      return existing;
    }

    const newUser: UserProgress = {
      userId: 'usr_' + Date.now(),
      phoneNumber: phone,
      fullName: name || 'SA Learner',
      grade: grade || 'Grade 12',
      selectedSubjects: [],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isPremium: false,
      completedLessonIds: [],
      quizScores: {},
      savedNotes: {},
      badges: [INITIAL_BADGES[0]],
      dailyChatsCount: 0,
      lastChatDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logoutUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  // --- DATA SAVER MODE ---
  getDataSaver(): boolean {
    try {
      return localStorage.getItem(DATA_SAVER_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setDataSaver(enabled: boolean) {
    try {
      localStorage.setItem(DATA_SAVER_KEY, enabled ? 'true' : 'false');
    } catch (err) {
      console.warn('Error setting data saver:', err);
    }
  },

  // --- OFFLINE LESSONS & PAPERS CACHE (IndexedDB + Device replication) ---
  getOfflineLessons(): Record<string, OfflineSavedLesson> {
    try {
      const data = localStorage.getItem(OFFLINE_LESSONS_CACHE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  async saveLessonOffline(lessonId: string, notes: string, quizScore?: number, lessonObj?: Lesson) {
    try {
      const cached = this.getOfflineLessons();
      cached[lessonId] = {
        lessonId,
        savedAt: new Date().toISOString(),
        notes,
        quizScore,
      };
      localStorage.setItem(OFFLINE_LESSONS_CACHE_KEY, JSON.stringify(cached));

      // Also persist to IndexedDB if full lesson object is provided
      if (lessonObj && OfflineCache.isSupported()) {
        await OfflineCache.cacheLesson(lessonObj, notes, quizScore);
      }
    } catch (err) {
      console.warn('Failed to cache lesson offline:', err);
    }
  },

  async cachePaperOffline(paper: PastPaper): Promise<void> {
    if (OfflineCache.isSupported()) {
      await OfflineCache.cachePastPaper(paper);
    }
  },

  async getOfflinePaper(paperId: string): Promise<PastPaper | null> {
    if (OfflineCache.isSupported()) {
      return await OfflineCache.getCachedPastPaper(paperId);
    }
    return null;
  },

  async getAllOfflinePapers(): Promise<PastPaper[]> {
    if (OfflineCache.isSupported()) {
      return await OfflineCache.getAllCachedPastPapers();
    }
    return [];
  },

  async getOfflineStats(): Promise<OfflineStats> {
    return await OfflineCache.getStats();
  },

  async precacheCurriculum(lessons: Lesson[], papers: PastPaper[]): Promise<void> {
    if (OfflineCache.isSupported()) {
      await OfflineCache.precacheAll(lessons, papers);
    }
  },

  // --- STUDY GROUPS ---
  getStudyGroups(): StudyGroup[] {
    try {
      const data = localStorage.getItem(STUDY_GROUPS_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.warn('Error reading study groups:', err);
    }
    return INITIAL_STUDY_GROUPS;
  },

  saveStudyGroups(groups: StudyGroup[]) {
    try {
      localStorage.setItem(STUDY_GROUPS_KEY, JSON.stringify(groups));
      // background post to server
      fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groups),
      }).catch(() => {});
    } catch (err) {
      console.warn('Error saving study groups:', err);
    }
  },

  addGroupMessage(groupId: string, message: GroupMessage): StudyGroup[] {
    const groups = this.getStudyGroups();
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        // Enforce user prompt constraint: "Max 60 messages saved per group to save data."
        const newMessages = [...g.messages, message].slice(-60);
        return {
          ...g,
          messages: newMessages,
        };
      }
      return g;
    });
    this.saveStudyGroups(updated);
    return updated;
  },

  // --- ADMIN SETTINGS ---
  getAdminSettings(): AdminSettings {
    try {
      const data = localStorage.getItem(ADMIN_CONFIG_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.warn('Error loading admin settings:', err);
    }
    return {
      stripePublishableKey: '',
      stripeSecretKey: '',
      absaAccountNumber: '409 876 5432',
      absaBranchCode: '632 005',
      absaAccountHolder: 'Elevate Learning (Pty) Ltd',
      absaAccountType: 'Cheque / Current',
      absaWhatsAppNumber: '082 123 4567',
      adminEmail: 'sibiyaconstance44@gmail.com',
      isConfigured: false,
    };
  },

  saveAdminSettings(settings: AdminSettings) {
    try {
      localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(settings));
      fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }).catch(() => {});
    } catch (err) {
      console.warn('Error saving admin settings:', err);
    }
  },
};
