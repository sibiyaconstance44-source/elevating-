export type GradeBand = 'Grade R-3' | 'Grade 4-6' | 'Grade 7-9' | 'Grade 10-12';

export interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  iconName: string;
  gradeBand: GradeBand;
  description: string;
  isHighDemand?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  gradeBand: GradeBand;
  gradeLevel: number | string; // e.g. 12 or 'R'
  subjectId: string;
  subjectName: string;
  title: string;
  topic: string;
  order: number; // 1, 2, 3 are FREE, 4+ are Premium blurred
  isFree: boolean;
  durationMinutes: number;
  capsObjective: string;
  summaryNotes: string[];
  keyTerms: { term: string; definition: string }[];
  practicalExample: {
    scenario: string;
    stepByStepSolution: string[];
    examTip: string;
  };
  video: {
    title: string;
    duration: string;
    thumbnailUrl: string;
    videoUrl: string;
  };
  quiz: QuizQuestion[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export type PracticeDifficulty = 'foundation' | 'intermediate' | 'advanced';

export interface SubjectPracticeStats {
  subjectId: string;
  totalAttempts: number;
  totalCorrect: number;
  stars: number; // 0 to 5 stars (mastery rating)
  highestDifficulty?: PracticeDifficulty;
  lastPracticed?: string;
  accuracy: number; // 0 to 100 percentage
}

export interface UserProgress {
  userId: string;
  phoneNumber: string;
  fullName: string;
  grade: string; // e.g., 'Grade 12'
  selectedSubjects?: string[]; // Selected CAPS subject IDs e.g. ['1012-math', '1012-phys']
  practiceStats?: Record<string, SubjectPracticeStats>; // subjectId -> stats with 1-5 stars
  avatarUrl: string;
  isPremium: boolean;
  premiumUntil?: string;
  completedLessonIds: string[];
  quizScores: Record<string, number>; // lessonId -> percentage score (0-100)
  savedNotes: Record<string, string>; // lessonId -> user notes
  badges: Badge[];
  dailyChatsCount: number;
  lastChatDate: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  fullName: string;
  grade: string;
  avatarUrl: string;
  completedLessonsCount: number;
  progressPercent: number;
  badges: Badge[];
  isCurrentUser?: boolean;
}

export interface GroupAttachment {
  type: 'pdf' | 'scan' | 'image';
  title: string;
  fileSize?: string;
  dataUrl?: string; // base64 or preview url
  paperId?: string;
  year?: number | string;
  subject?: string;
  grade?: string;
  description?: string;
  pageCount?: number;
  aiSolution?: {
    summary: string;
    stepByStep: string[];
    finalAnswer: string;
    capsTip: string;
    subjectFormula?: string;
    solvedAt: string;
  };
  isSolving?: boolean;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  isTeacher?: boolean;
  isAi?: boolean;
  status?: 'sent' | 'delivered' | 'read' | string;
  attachment?: GroupAttachment;
  replyTo?: {
    id: string;
    userName: string;
    text: string;
  };
  reactions?: Record<string, number>;
}

export interface StudyGroup {
  id: string;
  name: string;
  gradeBand: GradeBand;
  grade: string;
  subjectId: string;
  subjectName: string;
  description: string;
  maxMembers: number; // 60
  members: GroupMember[];
  messages: GroupMessage[];
  createdAt: string;
}

export interface AdminSettings {
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  absaAccountNumber?: string;
  absaBranchCode?: string;
  absaAccountHolder?: string;
  absaAccountType?: string;
  absaWhatsAppNumber?: string;
  adminEmail?: string;
  isConfigured: boolean;
}

export type SouthAfricanLanguage = 'en' | 'zu' | 'st' | 'tn' | 'xh';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  language?: SouthAfricanLanguage;
  lessonContext?: string;
  paperAttachment?: {
    name: string;
    type: 'pdf' | 'image';
    dataUrl?: string;
  };
}

export interface PastPaperQuestion {
  number: string; // e.g. "Question 1"
  topic: string; // e.g. "Algebra & Quadratic Equations"
  marks: number;
  instructions?: string;
  subQuestions: {
    label: string; // e.g. "1.1.1"
    questionText: string;
    marks: number;
    answerGuide: string;
    examTip?: string;
  }[];
}

export interface PastPaper {
  id: string;
  title: string;
  subject: string;
  grade: string; // e.g. "Grade 12"
  year: number;
  session: 'November NSC' | 'June Exam' | 'Preparatory Trial' | 'IEB Final';
  examBoard: 'DBE CAPS' | 'IEB';
  paperNumber: 1 | 2;
  durationHours: number;
  totalMarks: number;
  description: string;
  instructions: string[];
  formulaSheetSummary?: string[];
  questions: PastPaperQuestion[];
  memoNotes: string[];
}

export interface UploadedPaper {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  fileSize: number; // in bytes
  dataUrl: string; // base64
  uploadedAt: string;
  subject?: string;
  grade?: string;
  extractedText?: string;
}
