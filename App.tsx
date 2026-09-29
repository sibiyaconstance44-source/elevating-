import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CurriculumBrowser } from './components/CurriculumBrowser';
import { LessonView } from './components/LessonView';
import { StudyGroups } from './components/StudyGroups';
import { ProfileView } from './components/ProfileView';
import { PastPapersView } from './components/PastPapersView';
import { FoundationPhaseStudio } from './components/FoundationPhaseStudio';
import { BottomAdBanner } from './components/BottomAdBanner';
import { AuthModal } from './components/AuthModal';
import { DrawerMenu } from './components/DrawerMenu';
import { MsElevateTutor, ActivePaperContext } from './components/MsElevateTutor';
import { PaymentModal } from './components/PaymentModal';
import { AdminModal } from './components/AdminModal';
import { GradeSubjectModal } from './components/GradeSubjectModal';
import { PracticeModeModal } from './components/PracticeModeModal';
import { MySubjectsMastery } from './components/MySubjectsMastery';
import { UserProgress, GradeBand, Lesson, StudyGroup } from './types';
import { StorageService } from './services/storage';
import { LESSONS, INITIAL_STUDY_GROUPS, INITIAL_BADGES } from './data/curriculum';
import { PAST_PAPERS } from './data/pastPapers';
import { MessageSquare, Sparkles, WifiOff, Cloud } from 'lucide-react';
import { ElevateLogo } from './components/ElevateLogo';

export default function App() {
  const [user, setUser] = useState<UserProgress | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'papers' | 'foundation' | 'groups' | 'profile'>('learn');
  const [selectedGradeBand, setSelectedGradeBand] = useState<GradeBand>('Grade 10-12');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [attachedPaper, setAttachedPaper] = useState<ActivePaperContext | null>(null);
  const [dataSaver, setDataSaver] = useState<boolean>(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isGradeSubjectModalOpen, setIsGradeSubjectModalOpen] = useState(false);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [practiceSubjectId, setPracticeSubjectId] = useState<string | undefined>(undefined);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(INITIAL_STUDY_GROUPS);
  const [cloudSyncToast, setCloudSyncToast] = useState(false);

  // 1. Initial Load: Check mandatory user login & data-saver
  useEffect(() => {
    const savedUser = StorageService.getUser();
    if (savedUser) {
      setUser(savedUser);
      // Auto-adapt grade band
      if (savedUser.grade.includes('12') || savedUser.grade.includes('11') || savedUser.grade.includes('10')) {
        setSelectedGradeBand('Grade 10-12');
      } else if (savedUser.grade.includes('9') || savedUser.grade.includes('8') || savedUser.grade.includes('7')) {
        setSelectedGradeBand('Grade 7-9');
      } else if (savedUser.grade.includes('6') || savedUser.grade.includes('5') || savedUser.grade.includes('4')) {
        setSelectedGradeBand('Grade 4-6');
      } else {
        setSelectedGradeBand('Grade R-3');
      }
    } else {
      // Mandatory login
      setAuthModalOpen(true);
    }

    const savedDataSaver = StorageService.getDataSaver();
    setDataSaver(savedDataSaver);

    const groups = StorageService.getStudyGroups();
    setStudyGroups(groups);

    // Precache curriculum lessons and past exam papers for true offline & data-less access via IndexedDB
    StorageService.precacheCurriculum(LESSONS, PAST_PAPERS).catch((err) => {
      console.warn('Background precache note:', err);
    });

    // Check Stripe checkout redirect return
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('stripe_success') === 'true') {
      const sessionId = urlParams.get('session_id') || 'STRIPE_RETURN';
      const phoneParam = urlParams.get('phone');
      const targetPhone = savedUser?.phoneNumber || phoneParam;
      if (targetPhone) {
        fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: sessionId,
            phoneNumber: targetPhone,
            gateway: 'stripe',
          }),
        })
          .then((r) => r.json())
          .then((resData) => {
            if (resData.success && savedUser) {
              const upgraded: UserProgress = {
                ...savedUser,
                isPremium: true,
                premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              };
              setUser(upgraded);
              StorageService.saveUser(upgraded, true);
            }
          })
          .catch(() => {});
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleAuthenticated = (authenticatedUser: UserProgress) => {
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    StorageService.saveUser(authenticatedUser, true);
    triggerCloudSyncNotice();

    // After signing in, allow learners to choose grade and subjects if they haven't chosen them yet
    if (!authenticatedUser.selectedSubjects || authenticatedUser.selectedSubjects.length === 0) {
      setIsGradeSubjectModalOpen(true);
    }
  };

  const handleUpdateGradeAndSubjects = (grade: string, subjects: string[]) => {
    if (!user) return;
    const updatedUser: UserProgress = {
      ...user,
      grade,
      selectedSubjects: subjects,
    };
    setUser(updatedUser);
    StorageService.saveUser(updatedUser, true);

    // Auto-adapt grade band
    if (grade.includes('12') || grade.includes('11') || grade.includes('10')) {
      setSelectedGradeBand('Grade 10-12');
    } else if (grade.includes('9') || grade.includes('8') || grade.includes('7')) {
      setSelectedGradeBand('Grade 7-9');
    } else if (grade.includes('6') || grade.includes('5') || grade.includes('4')) {
      setSelectedGradeBand('Grade 4-6');
    } else {
      setSelectedGradeBand('Grade R-3');
    }

    setIsGradeSubjectModalOpen(false);
    triggerCloudSyncNotice();
  };

  const handleUpdateUserPractice = (updatedUser: UserProgress) => {
    setUser(updatedUser);
    StorageService.saveUser(updatedUser, true);
    triggerCloudSyncNotice();
  };

  const handleLogout = () => {
    StorageService.logoutUser();
    setUser(null);
    setAuthModalOpen(true);
  };

  const handleDataSaverToggle = (val: boolean) => {
    setDataSaver(val);
    StorageService.setDataSaver(val);
  };

  const triggerCloudSyncNotice = () => {
    setCloudSyncToast(true);
    setTimeout(() => setCloudSyncToast(false), 3000);
  };

  // Save lesson work (notes and quiz scores)
  const handleSaveLessonWork = (notes: string, quizScore?: number) => {
    if (!user || !activeLesson) return;

    const updatedNotes = {
      ...user.savedNotes,
      [activeLesson.id]: notes,
    };

    const updatedScores = { ...user.quizScores };
    if (quizScore !== undefined) {
      updatedScores[activeLesson.id] = quizScore;
    }

    const updatedCompleted = [...user.completedLessonIds];
    if (!updatedCompleted.includes(activeLesson.id)) {
      updatedCompleted.push(activeLesson.id);
    }

    // Award badges if applicable
    const updatedBadges = [...user.badges];
    if (quizScore === 100 && !updatedBadges.some((b) => b.id === 'badge-quiz-ace')) {
      updatedBadges.push(INITIAL_BADGES[1]);
    }
    if (Object.keys(updatedNotes).length >= 3 && !updatedBadges.some((b) => b.id === 'badge-note-keeper')) {
      updatedBadges.push(INITIAL_BADGES[4]);
    }

    const updatedUser: UserProgress = {
      ...user,
      savedNotes: updatedNotes,
      quizScores: updatedScores,
      completedLessonIds: updatedCompleted,
      badges: updatedBadges,
    };

    setUser(updatedUser);
    StorageService.saveUser(updatedUser, true);
    triggerCloudSyncNotice();
  };

  const handleUpdateUserChats = (newCount: number) => {
    if (!user) return;
    const updatedUser: UserProgress = {
      ...user,
      dailyChatsCount: newCount,
      lastChatDate: new Date().toISOString().split('T')[0],
    };
    setUser(updatedUser);
    StorageService.saveUser(updatedUser, true);
  };

  const handlePaymentSuccess = (nextBillingDate: string) => {
    if (!user) return;
    const updatedUser: UserProgress = {
      ...user,
      isPremium: true,
      premiumUntil: nextBillingDate,
    };
    setUser(updatedUser);
    StorageService.saveUser(updatedUser, true);
    setIsPaymentOpen(false);
    triggerCloudSyncNotice();
  };

  const handleSelectLessonById = (lessonId: string) => {
    const found = LESSONS.find((l) => l.id === lessonId);
    if (found) {
      setActiveLesson(found);
      setActiveTab('learn');
    }
  };

  const handleStartTutorOnPaper = (paper: ActivePaperContext) => {
    setAttachedPaper(paper);
    setIsTutorOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mandatory Auth Modal if not logged in */}
      <AuthModal
        isOpen={authModalOpen || !user}
        onAuthenticated={handleAuthenticated}
      />

      {user && (
        <>
          {/* Main Top Navigation */}
          <Navbar
            user={user}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'learn') setActiveLesson(null);
            }}
            selectedGradeBand={selectedGradeBand}
            setSelectedGradeBand={setSelectedGradeBand}
            dataSaver={dataSaver}
            setDataSaver={handleDataSaverToggle}
            onOpenPayment={() => setIsPaymentOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onLogout={handleLogout}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onAskAi={() => setIsTutorOpen(true)}
            onOpenGradeSubjectModal={() => setIsGradeSubjectModalOpen(true)}
            onOpenPracticeMode={(subjectId) => {
              setPracticeSubjectId(subjectId);
              setIsPracticeModalOpen(true);
            }}
          />

          {/* Left Drawer Navigation Menu */}
          <DrawerMenu
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            user={user}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'learn') setActiveLesson(null);
            }}
            onOpenTutor={() => setIsTutorOpen(true)}
            onOpenPayment={() => setIsPaymentOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenGradeSubjectModal={() => setIsGradeSubjectModalOpen(true)}
            onOpenPracticeMode={(subjectId) => {
              setPracticeSubjectId(subjectId);
              setIsPracticeModalOpen(true);
            }}
          />

          {/* Cloud Sync Toast Notification */}
          {cloudSyncToast && (
            <div className="fixed top-16 right-4 z-50 p-3 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3">
              <Cloud className="w-4 h-4 text-emerald-200" />
              <span>Your work is safe - saved in cloud!</span>
            </div>
          )}

          {/* Data Saver Mode Sticky Bar */}
          {dataSaver && (
            <div className="bg-emerald-600 text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-1.5 shadow-xs">
              <WifiOff className="w-3.5 h-3.5" />
              <span>
                Data-less mode active: You can learn with 5MB a day (text-first, media compressed).
              </span>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
            {activeTab === 'learn' && (
              <>
                {activeLesson ? (
                  <LessonView
                    lesson={activeLesson}
                    user={user}
                    dataSaver={dataSaver}
                    onOpenTutor={() => setIsTutorOpen(true)}
                    onOpenPayment={() => setIsPaymentOpen(true)}
                    onSaveWork={handleSaveLessonWork}
                    onBack={() => setActiveLesson(null)}
                  />
                ) : (
                  <div className="space-y-6">
                    <HeroBanner
                      user={user}
                      dataSaver={dataSaver}
                      onExploreLessons={() => {
                        window.scrollTo({ top: 780, behavior: 'smooth' });
                      }}
                      onExploreGroups={() => setActiveTab('groups')}
                    />

                    {/* Home Screen: User's chosen subjects with Practice Mastery Stars */}
                    <MySubjectsMastery
                      user={user}
                      onOpenGradeSubjectModal={() => setIsGradeSubjectModalOpen(true)}
                      onOpenPracticeMode={(subjectId) => {
                        setPracticeSubjectId(subjectId);
                        setIsPracticeModalOpen(true);
                      }}
                      onSelectSubjectForLessons={() => {
                        const el = document.getElementById('curriculum-browser-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />

                    <div id="curriculum-browser-section">
                      <CurriculumBrowser
                        user={user}
                        selectedGradeBand={selectedGradeBand}
                        setSelectedGradeBand={setSelectedGradeBand}
                        onSelectLesson={(lesson) => setActiveLesson(lesson)}
                        onOpenPayment={() => setIsPaymentOpen(true)}
                        onOpenFoundationStudio={() => setActiveTab('foundation')}
                        onOpenGradeSubjectModal={() => setIsGradeSubjectModalOpen(true)}
                        onOpenPracticeMode={(subjectId) => {
                          setPracticeSubjectId(subjectId);
                          setIsPracticeModalOpen(true);
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'foundation' && (
              <FoundationPhaseStudio
                user={user}
                onOpenPayment={() => setIsPaymentOpen(true)}
                onBack={() => setActiveTab('learn')}
              />
            )}

            {activeTab === 'papers' && (
              <PastPapersView
                user={user}
                onOpenPayment={() => setIsPaymentOpen(true)}
                onStartTutorOnPaper={handleStartTutorOnPaper}
              />
            )}

            {activeTab === 'groups' && (
              <StudyGroups
                user={user}
                groups={studyGroups}
                onUpdateGroups={(updated) => setStudyGroups(updated)}
                onOpenPayment={() => setIsPaymentOpen(true)}
                onStartTutorOnPaper={handleStartTutorOnPaper}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                onOpenPayment={() => setIsPaymentOpen(true)}
                onSelectLesson={handleSelectLessonById}
              />
            )}
          </main>

          {/* Persistent Floating "Ask Ms Elevate - Online Now" Trigger */}
          {!isTutorOpen && (
            <button
              id="floating-ms-elevate-btn"
              onClick={() => setIsTutorOpen(true)}
              className="fixed bottom-14 sm:bottom-12 right-4 sm:right-6 z-30 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/30 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group animate-breathe-subtle cursor-pointer"
            >
              {/* Subtle ambient breathing glow aura */}
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 -z-10 animate-breathe-glow blur-md pointer-events-none" />

              <div className="relative">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-blue-200">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                    alt="Ms Elevate"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Green online pulse indicator with ping */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </span>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="leading-tight">Ask Ms Elevate</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                </div>
                <span className="text-[10px] text-blue-200 font-normal block">
                  Online Now • CAPS AI Tutor
                </span>
              </div>
            </button>
          )}

          {/* Ms Elevate AI Live Tutor Modal/Drawer */}
          <MsElevateTutor
            user={user}
            activeLesson={activeLesson || undefined}
            attachedPaper={attachedPaper}
            onClearAttachedPaper={() => setAttachedPaper(null)}
            onAttachPaper={(paper) => setAttachedPaper(paper)}
            isOpen={isTutorOpen}
            onClose={() => setIsTutorOpen(false)}
            onOpenPayment={() => setIsPaymentOpen(true)}
            onUpdateUserChats={handleUpdateUserChats}
          />

          {/* Paystack, Yoco & Absa Payment Modal (R50/mo) */}
          <PaymentModal
            isOpen={isPaymentOpen}
            user={user}
            onClose={() => setIsPaymentOpen(false)}
            onPaymentSuccess={handlePaymentSuccess}
            onOpenAdmin={() => {
              setIsPaymentOpen(false);
              setIsAdminOpen(true);
            }}
          />

          {/* Admin Settings Modal */}
          <AdminModal
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
          />

          {/* Grade & Subject Selection Modal (Mandatory Choice for Grade 10-12 Learners) */}
          <GradeSubjectModal
            isOpen={isGradeSubjectModalOpen}
            onClose={() => setIsGradeSubjectModalOpen(false)}
            user={user}
            onSave={handleUpdateGradeAndSubjects}
          />

          {/* Practice Mode with Difficulty Levels and Stars */}
          <PracticeModeModal
            isOpen={isPracticeModalOpen}
            onClose={() => setIsPracticeModalOpen(false)}
            user={user}
            initialSubjectId={practiceSubjectId}
            onUpdateUserPractice={handleUpdateUserPractice}
            onAskMsElevate={(topic, question) => {
              setIsPracticeModalOpen(false);
              setIsTutorOpen(true);
            }}
            onOpenGradeSubjectModal={() => {
              setIsPracticeModalOpen(false);
              setIsGradeSubjectModalOpen(true);
            }}
          />

          {/* Non-fullscreen Bottom-Docked Ad Banner (Only pops at bottom of screen) */}
          <BottomAdBanner
            user={user}
            onOpenPayment={() => setIsPaymentOpen(true)}
          />

          {/* Footer */}
          <footer className="mt-auto bg-white border-t border-blue-100 py-6 text-center text-xs text-slate-500 pb-16">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ElevateLogo size="sm" />
                <span className="font-extrabold text-blue-700">Elevate</span>
                <span>• "Elevating Young Minds"</span>
                <span>• CAPS & IEB Curriculum</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span>R50/month Plan</span>
                <span>•</span>
                <span>Data-less Learning</span>
                <span>•</span>
                <span>2026 DBE School Calendar</span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
