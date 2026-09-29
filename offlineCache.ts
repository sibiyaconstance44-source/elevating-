import { Lesson, PastPaper } from '../types';

const DB_NAME = 'ElevateOfflineDB';
const DB_VERSION = 1;

export interface CachedOfflinePaper {
  id: string;
  paper: PastPaper;
  cachedAt: string;
}

export interface CachedOfflineLesson {
  id: string;
  lesson: Lesson;
  cachedAt: string;
  notes?: string;
  quizCompleted?: boolean;
  quizScore?: number;
}

export interface OfflineStats {
  lessonsCount: number;
  papersCount: number;
  isSupported: boolean;
}

class IndexedDBCacheService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.isSupported()) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment.'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Object store for lessons
          if (!db.objectStoreNames.contains('lessons')) {
            db.createObjectStore('lessons', { keyPath: 'id' });
          }

          // Object store for past papers & memos
          if (!db.objectStoreNames.contains('pastPapers')) {
            db.createObjectStore('pastPapers', { keyPath: 'id' });
          }

          // Object store for offline sync queue
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          }
        };

        request.onsuccess = (event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
          console.warn('IndexedDB failed to open:', (event.target as IDBOpenDBRequest).error);
          reject((event.target as IDBOpenDBRequest).error);
        };
      });
    }

    return this.dbPromise;
  }

  // --- LESSONS CACHING ---
  async cacheLesson(lesson: Lesson, notes?: string, quizScore?: number): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('lessons', 'readwrite');
      const store = tx.objectStore('lessons');
      const item: CachedOfflineLesson = {
        id: lesson.id,
        lesson,
        cachedAt: new Date().toISOString(),
        notes,
        quizScore,
        quizCompleted: typeof quizScore === 'number',
      };
      store.put(item);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Fallback: unable to cache lesson in IndexedDB:', err);
    }
  }

  async getCachedLesson(lessonId: string): Promise<Lesson | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('lessons', 'readonly');
      const store = tx.objectStore('lessons');
      const request = store.get(lessonId);
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const res = request.result as CachedOfflineLesson | undefined;
          resolve(res ? res.lesson : null);
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async getAllCachedLessons(): Promise<Lesson[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('lessons', 'readonly');
      const store = tx.objectStore('lessons');
      const request = store.getAll();
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const list = (request.result as CachedOfflineLesson[]) || [];
          resolve(list.map((item) => item.lesson));
        };
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // --- PAST PAPERS CACHING ---
  async cachePastPaper(paper: PastPaper): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('pastPapers', 'readwrite');
      const store = tx.objectStore('pastPapers');
      const item: CachedOfflinePaper = {
        id: paper.id,
        paper,
        cachedAt: new Date().toISOString(),
      };
      store.put(item);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Fallback: unable to cache past paper in IndexedDB:', err);
    }
  }

  async getCachedPastPaper(paperId: string): Promise<PastPaper | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('pastPapers', 'readonly');
      const store = tx.objectStore('pastPapers');
      const request = store.get(paperId);
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const res = request.result as CachedOfflinePaper | undefined;
          resolve(res ? res.paper : null);
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async getAllCachedPastPapers(): Promise<PastPaper[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('pastPapers', 'readonly');
      const store = tx.objectStore('pastPapers');
      const request = store.getAll();
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const list = (request.result as CachedOfflinePaper[]) || [];
          resolve(list.map((item) => item.paper));
        };
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // Precache all curriculum lessons and papers so user is 100% prepared for data-less mode
  async precacheAll(lessons: Lesson[], papers: PastPaper[]): Promise<void> {
    for (const l of lessons) {
      await this.cacheLesson(l);
    }
    for (const p of papers) {
      await this.cachePastPaper(p);
    }
  }

  // Get statistics for user display in Data Saver / Offline settings
  async getStats(): Promise<OfflineStats> {
    if (!this.isSupported()) {
      return { lessonsCount: 0, papersCount: 0, isSupported: false };
    }
    try {
      const db = await this.getDB();
      const txLessons = db.transaction('lessons', 'readonly');
      const storeLessons = txLessons.objectStore('lessons');
      const countLessonsReq = storeLessons.count();

      const lessonsCount = await new Promise<number>((resolve) => {
        countLessonsReq.onsuccess = () => resolve(countLessonsReq.result);
        countLessonsReq.onerror = () => resolve(0);
      });

      const txPapers = db.transaction('pastPapers', 'readonly');
      const storePapers = txPapers.objectStore('pastPapers');
      const countPapersReq = storePapers.count();

      const papersCount = await new Promise<number>((resolve) => {
        countPapersReq.onsuccess = () => resolve(countPapersReq.result);
        countPapersReq.onerror = () => resolve(0);
      });

      return {
        lessonsCount,
        papersCount,
        isSupported: true,
      };
    } catch {
      return { lessonsCount: 0, papersCount: 0, isSupported: true };
    }
  }
}

export const OfflineCache = new IndexedDBCacheService();
