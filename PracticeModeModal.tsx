import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Star,
  Flame,
  Lightbulb,
  MessageSquare,
  Zap,
  BookOpen,
  ChevronRight,
  Award,
  SlidersHorizontal,
  GraduationCap,
} from 'lucide-react';
import { UserProgress, PracticeDifficulty, SubjectInfo } from '../types';
import { SUBJECTS } from '../data/curriculum';
import { getPracticeQuestionsForSubject, PracticeQuestion } from '../data/practiceQuestions';

interface PracticeModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProgress;
  initialSubjectId?: string;
  initialDifficulty?: PracticeDifficulty;
  onUpdateUserPractice: (updatedUser: UserProgress) => void;
  onAskMsElevate?: (topic: string, question: string) => void;
  onOpenGradeSubjectModal?: () => void;
}

export const PracticeModeModal: React.FC<PracticeModeModalProps> = ({
  isOpen,
  onClose,
  user,
  initialSubjectId,
  initialDifficulty = 'intermediate',
  onUpdateUserPractice,
  onAskMsElevate,
  onOpenGradeSubjectModal,
}) => {
  // Determine available subjects based on user's selected subjects
  const userEnrolledSubjectIds = user.selectedSubjects || [];
  
  // Available subjects matching user's grade or enrolled
  const enrolledSubjects = SUBJECTS.filter((s) => userEnrolledSubjectIds.includes(s.id));
  const fallbackSubjects = enrolledSubjects.length > 0
    ? enrolledSubjects
    : SUBJECTS.filter((s) => s.gradeBand === 'Grade 10-12');

  const defaultSubjectId =
    initialSubjectId || (fallbackSubjects.length > 0 ? fallbackSubjects[0].id : '1012-math');

  // State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(defaultSubjectId);
  const [selectedDifficulty, setSelectedDifficulty] = useState<PracticeDifficulty>(initialDifficulty);
  const [isPracticing, setIsPracticing] = useState<boolean>(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [viewAllSubjects, setViewAllSubjects] = useState<boolean>(false);

  // Sync initial subject if provided
  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
    }
    if (initialDifficulty) {
      setSelectedDifficulty(initialDifficulty);
    }
  }, [initialSubjectId, initialDifficulty, isOpen]);

  // Current active subject info
  const activeSubject = SUBJECTS.find((s) => s.id === selectedSubjectId) || fallbackSubjects[0] || SUBJECTS[0];

  // Current subject stats
  const subjectStats = user.practiceStats?.[selectedSubjectId];
  const currentStars = subjectStats?.stars || 0;

  // Start Practice
  const handleStartPractice = () => {
    const qList = getPracticeQuestionsForSubject(selectedSubjectId, selectedDifficulty, 5);
    setQuestions(qList);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setIsCompleted(false);
    setIsPracticing(true);
  };

  // Submit Answer
  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const currentQ = questions[currentIndex];
    if (selectedOption === currentQ.correctIndex) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Completed session
      finishSession();
    }
  };

  // Calculate Stars (1 to 5)
  // Scoring formula:
  // Accuracy = score / total
  // Multiplied by difficulty bonus:
  // foundation: max 3 stars
  // intermediate: max 4 stars
  // advanced: max 5 stars
  const calculateEarnedStars = (score: number, total: number, diff: PracticeDifficulty): number => {
    const pct = (score / total) * 100;
    if (diff === 'advanced') {
      if (pct >= 80) return 5;
      if (pct >= 60) return 4;
      if (pct >= 40) return 3;
      return 2;
    } else if (diff === 'intermediate') {
      if (pct >= 80) return 4;
      if (pct >= 60) return 3;
      if (pct >= 40) return 2;
      return 1;
    } else {
      // foundation
      if (pct >= 80) return 3;
      if (pct >= 50) return 2;
      return 1;
    }
  };

  const finishSession = () => {
    const finalScore = selectedOption === questions[currentIndex]?.correctIndex
      ? correctAnswersCount + 1
      : correctAnswersCount;
    const totalQ = questions.length;
    const earnedStars = calculateEarnedStars(finalScore, totalQ, selectedDifficulty);
    const accuracy = Math.round((finalScore / totalQ) * 100);

    // Update user stats
    const existingStats = user.practiceStats?.[selectedSubjectId] || {
      subjectId: selectedSubjectId,
      totalAttempts: 0,
      totalCorrect: 0,
      stars: 0,
      accuracy: 0,
    };

    // Keep highest stars earned
    const newStars = Math.max(existingStats.stars || 0, earnedStars);

    const updatedStats = {
      ...user.practiceStats,
      [selectedSubjectId]: {
        subjectId: selectedSubjectId,
        totalAttempts: existingStats.totalAttempts + totalQ,
        totalCorrect: existingStats.totalCorrect + finalScore,
        stars: newStars,
        highestDifficulty: selectedDifficulty,
        lastPracticed: new Date().toISOString(),
        accuracy: Math.max(existingStats.accuracy || 0, accuracy),
      },
    };

    const updatedUser: UserProgress = {
      ...user,
      practiceStats: updatedStats,
    };

    onUpdateUserPractice(updatedUser);
    setIsCompleted(true);
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-6 shadow-2xl border border-blue-100 relative overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 sm:p-6 relative shrink-0">
          <button
            id="close-practice-mode-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Practice Mode"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-amber-300">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                CAPS Practice & Mastery Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isPracticing ? `${activeSubject.name} Practice` : 'Choose Subject & Difficulty'}
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            {isPracticing
              ? 'Answer questions at your chosen difficulty level to level up your mastery stars and sharpen your exam readiness.'
              : 'Select one of your chosen subjects and pick your challenge level (Foundation, Intermediate, or Advanced Exam Distinction).'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {!isPracticing ? (
            /* STEP 1: CONFIGURATION SCREEN */
            <div className="space-y-6">
              {/* SUBJECT SELECTION */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Select Subject to Practice
                    </h3>
                  </div>
                  {onOpenGradeSubjectModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenGradeSubjectModal();
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Change My Subjects</span>
                    </button>
                  )}
                </div>

                {/* Subject Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {(viewAllSubjects ? SUBJECTS : (enrolledSubjects.length > 0 ? enrolledSubjects : fallbackSubjects)).map((sub) => {
                    const isSelected = sub.id === selectedSubjectId;
                    const stars = user.practiceStats?.[sub.id]?.stars || 0;
                    const isEnrolled = userEnrolledSubjectIds.includes(sub.id);

                    return (
                      <button
                        key={sub.id}
                        id={`practice-select-subject-${sub.id}`}
                        type="button"
                        onClick={() => setSelectedSubjectId(sub.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {sub.name}
                            </span>
                            {isEnrolled && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                                Enrolled
                              </span>
                            )}
                          </div>
                          
                          {/* Stars Row */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3.5 h-3.5 ${
                                  starIdx <= stars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200 fill-slate-100'
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-slate-500 ml-1">
                              {stars > 0 ? `${stars}/5 Stars` : 'New'}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Toggle to view all subjects */}
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setViewAllSubjects(!viewAllSubjects)}
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600"
                  >
                    {viewAllSubjects ? 'Show Only My Enrolled Subjects' : 'View All CAPS Subjects'}
                  </button>
                </div>
              </div>

              {/* STEP 2: DIFFICULTY LEVEL SELECTION */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Choose Difficulty Level
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Foundation */}
                  <button
                    id="diff-btn-foundation"
                    type="button"
                    onClick={() => setSelectedDifficulty('foundation')}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      selectedDifficulty === 'foundation'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Level 1-2
                      </span>
                      <span className="text-xs font-bold text-emerald-600">🟢 Foundation</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Standard / Easy</h4>
                    <p className="text-xs text-slate-500">
                      Core definitions, recall, and routine calculations. Up to 3 Stars.
                    </p>
                  </button>

                  {/* Intermediate */}
                  <button
                    id="diff-btn-intermediate"
                    type="button"
                    onClick={() => setSelectedDifficulty('intermediate')}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      selectedDifficulty === 'intermediate'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                        Level 3
                      </span>
                      <span className="text-xs font-bold text-amber-600">🟡 Intermediate</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">CAPS Standard</h4>
                    <p className="text-xs text-slate-500">
                      Multi-step application, practical scenarios & problem solving. Up to 4 Stars.
                    </p>
                  </button>

                  {/* Advanced */}
                  <button
                    id="diff-btn-advanced"
                    type="button"
                    onClick={() => setSelectedDifficulty('advanced')}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      selectedDifficulty === 'advanced'
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                        Level 4
                      </span>
                      <span className="text-xs font-bold text-rose-600">🔴 Advanced</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Exam Distinction</h4>
                    <p className="text-xs text-slate-500">
                      Higher-order thinking, NSC/IEB exam challenge questions. Earn full 5 Stars!
                    </p>
                  </button>
                </div>
              </div>

              {/* START BUTTON */}
              <button
                id="start-practice-session-btn"
                type="button"
                onClick={handleStartPractice}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Zap className="w-5 h-5 text-amber-300" />
                <span>Start Practice for {activeSubject.name}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : isCompleted ? (
            /* STEP 3: SESSION COMPLETION & MASTERY STARS */
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-500 shadow-lg animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider">
                  Practice Session Completed
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Great Work on {activeSubject.name}!
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  You scored <strong className="text-blue-600">{correctAnswersCount} out of {questions.length}</strong> on{' '}
                  <strong className="capitalize">{selectedDifficulty}</strong> difficulty.
                </p>
              </div>

              {/* Earned Stars Presentation */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-200 max-w-md mx-auto shadow-sm">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2">
                  Subject Mastery Rating
                </span>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((starIdx) => {
                    const hasStar = starIdx <= (user.practiceStats?.[selectedSubjectId]?.stars || 0);
                    return (
                      <Star
                        key={starIdx}
                        className={`w-8 h-8 transition-transform hover:scale-125 ${
                          hasStar
                            ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                            : 'text-slate-300 fill-slate-200'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs font-bold text-amber-900">
                  {user.practiceStats?.[selectedSubjectId]?.stars === 5
                    ? '🏆 CAPS Matric Distinction Level (5/5 Stars)'
                    : user.practiceStats?.[selectedSubjectId]?.stars === 4
                    ? '🌟 Advanced Master (4/5 Stars)'
                    : user.practiceStats?.[selectedSubjectId]?.stars === 3
                    ? '✨ Proficient Scholar (3/5 Stars)'
                    : '🌱 Developing Practice (Continue to earn more stars)'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStartPractice}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Practice Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPracticing(false)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
                >
                  <span>Choose Another Subject</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold text-sm"
                >
                  <span>Return to Home</span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: ACTIVE QUESTION SCREEN */
            <div className="space-y-5">
              {/* Progress & Meta Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      selectedDifficulty === 'advanced'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedDifficulty === 'intermediate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedDifficulty}
                  </span>
                </div>

                <span className="text-xs font-semibold text-slate-500">
                  Topic: {currentQ?.topic}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text Card */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  {currentQ?.bloomsLevel}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQ?.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ?.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let btnStyle = 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20 text-rose-950';
                    } else {
                      btnStyle = 'bg-white border-slate-100 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      id={`practice-opt-${idx}`}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isAnswerSubmitted && isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isAnswerSubmitted && isSelected && !isCorrect
                              ? 'bg-rose-600 text-white'
                              : isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs sm:text-sm">{opt}</span>
                      </div>

                      {isAnswerSubmitted && (
                        <div>
                          {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                          {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback / Explanation Box once submitted */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      CAPS Worked Solution & Explanation
                    </span>
                    {onAskMsElevate && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onAskMsElevate(currentQ.topic, currentQ.question);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask Ms Elevate</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                  {currentQ.examTip && (
                    <div className="text-[11px] font-medium text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/70">
                      💡 <strong>Exam Tip:</strong> {currentQ.examTip}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    id="submit-practice-answer-btn"
                    type="button"
                    disabled={selectedOption === null}
                    onClick={handleSubmitAnswer}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${
                      selectedOption !== null
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Confirm Answer
                  </button>
                ) : (
                  <button
                    id="next-practice-question-btn"
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Practice Score & Stars'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
