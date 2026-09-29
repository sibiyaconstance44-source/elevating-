import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Save,
  MessageSquare,
  Sparkles,
  HelpCircle,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  Crown,
  Award,
  WifiOff,
  Check,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, UserProgress } from '../types';
import { StorageService } from '../services/storage';

interface LessonViewProps {
  lesson: Lesson;
  user: UserProgress;
  dataSaver: boolean;
  onOpenTutor: () => void;
  onOpenPayment: () => void;
  onSaveWork: (notes: string, quizScore?: number) => void;
  onBack: () => void;
  onNextLesson?: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  user,
  dataSaver,
  onOpenTutor,
  onOpenPayment,
  onSaveWork,
  onBack,
  onNextLesson,
}) => {
  const [userNotes, setUserNotes] = useState(user.savedNotes[lesson.id] || '');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(user.quizScores[lesson.id] ?? null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Check if lesson is locked (lessons 4+ are locked for non-premium)
  const isLocked = !lesson.isFree && !user.isPremium;

  useEffect(() => {
    setUserNotes(user.savedNotes[lesson.id] || '');
    setQuizScore(user.quizScores[lesson.id] ?? null);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setVideoPlaying(false);
  }, [lesson.id, user]);

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitQuiz = () => {
    if (quizSubmitted) return;

    let correctCount = 0;
    lesson.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / lesson.quiz.length) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);

    if (percentage >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#1D4ED8', '#3B82F6', '#F59E0B'],
      });
    }

    // Auto save
    onSaveWork(userNotes, percentage);
  };

  const handleSaveWorkClick = () => {
    onSaveWork(userNotes, quizScore ?? undefined);
    StorageService.saveLessonOffline(lesson.id, userNotes, quizScore ?? undefined, lesson);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top navigation & action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Curriculum</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Ask Ms Elevate Live Button */}
          <button
            id="ask-ms-elevate-lesson-btn"
            onClick={onOpenTutor}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span>Ask Ms Elevate - Online Now</span>
          </button>

          {/* Save My Work Button */}
          <button
            id="save-my-work-btn"
            onClick={handleSaveWorkClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all"
          >
            <Save className="w-4 h-4 text-blue-600" />
            <span>Save My Work</span>
          </button>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Your work is safe - saved in cloud and cached offline!</strong> Your notes and quiz answers have been synchronized.
          </span>
        </div>
      )}

      {/* Lesson Hero / Metadata Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            {lesson.gradeLevel} • {lesson.subjectName}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Lesson {lesson.order}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {lesson.durationMinutes} mins
          </span>
          {lesson.isFree ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
              FREE CAPS LESSON
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-600" />
              PREMIUM ONLY
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {lesson.title}
        </h1>
        <p className="text-sm font-semibold text-blue-600 mb-4">{lesson.topic}</p>

        {/* CAPS Official Objective */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="text-blue-950 block font-bold mb-0.5">CAPS Curriculum Objective:</strong>
            {lesson.capsObjective}
          </div>
        </div>
      </div>

      {/* If lesson is locked, show blurred overlay */}
      {isLocked ? (
        <div className="relative rounded-3xl bg-white border border-blue-200 overflow-hidden shadow-md">
          {/* Blurred dummy content behind lock */}
          <div className="filter blur-md pointer-events-none select-none p-8 space-y-6 opacity-40">
            <div className="h-6 bg-slate-200 rounded-md w-1/3" />
            <div className="h-4 bg-slate-200 rounded-md w-full" />
            <div className="h-4 bg-slate-200 rounded-md w-5/6" />
            <div className="h-48 bg-slate-200 rounded-2xl w-full" />
            <div className="h-20 bg-slate-200 rounded-2xl w-full" />
          </div>

          {/* Premium Lock Banner */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-extrabold mb-1">
              Unlock with Premium R50
            </h3>
            <p className="text-sm text-blue-100 max-w-md mb-6">
              The first 3 lessons in each subject are completely free. Unlock Lesson {lesson.order} and all advanced CAPS subjects, past paper solutions, and unlimited Ms Elevate chats!
            </p>
            <button
              id="unlock-premium-lesson-btn"
              onClick={onOpenPayment}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-extrabold text-sm shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 flex items-center gap-2"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Unlock Everything for R50/Month</span>
            </button>
            <p className="text-xs text-slate-300 mt-3">Cancel anytime • Instant Yoco, Absa or Paystack activation</p>
          </div>
        </div>
      ) : (
        <>
          {/* SECTION 1: SHORT LESSON NOTES (CAPS) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 border-b border-blue-100 pb-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="font-extrabold text-lg">Short Lesson Notes (CAPS Aligned)</h2>
            </div>

            <div className="space-y-2.5">
              {lesson.summaryNotes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{note}</span>
                </div>
              ))}
            </div>

            {/* Key CAPS Terms */}
            {lesson.keyTerms && lesson.keyTerms.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Essential DBE Definitions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lesson.keyTerms.map((term, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs"
                    >
                      <strong className="text-blue-900 font-bold block">{term.term}</strong>
                      <span className="text-slate-600">{term.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: PRACTICAL EXAMPLE WITH STEP-BY-STEP SOLUTION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 border-b border-blue-100 pb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="font-extrabold text-lg">Practical CAPS Example & Solution</h2>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
                Exam Scenario
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {lesson.practicalExample.scenario}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Step-by-Step DBE Working:
              </span>
              {lesson.practicalExample.stepByStepSolution.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 font-mono"
                >
                  {step}
                </div>
              ))}
            </div>

            {/* DBE Exam Tip */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Matric Examiner Mark-Saver Tip: </strong>
                {lesson.practicalExample.examTip}
              </div>
            </div>
          </div>

          {/* SECTION 3: VIDEO PLACEHOLDER (LOW DATA: ONLY LOADS ON CLICK) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                <h2 className="font-extrabold text-lg">Video Walkthrough</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Low-Data: Loads on click only
              </span>
            </div>

            {dataSaver ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <WifiOff className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">Video Paused in Data-less Mode</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Videos are disabled to keep your consumption under 5MB/day. You can read the full text notes and step-by-step example above!
                </p>
              </div>
            ) : videoPlaying ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-black">
                <iframe
                  className="w-full h-full"
                  src={`${lesson.video.videoUrl}?autoplay=1`}
                  title={lesson.video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                onClick={() => setVideoPlaying(true)}
                className="relative rounded-2xl overflow-hidden group cursor-pointer border border-blue-100 aspect-video max-h-72 bg-slate-900 flex items-center justify-center"
              >
                <img
                  src={lesson.video.thumbnailUrl}
                  alt={lesson.video.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="relative z-10 flex flex-col items-center text-center p-4">
                  <div className="w-14 h-14 rounded-full bg-blue-600 group-hover:bg-blue-500 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform mb-2">
                    <Play className="w-6 h-6 ml-0.5 fill-white" />
                  </div>
                  <span className="text-sm font-bold text-white max-w-md">
                    {lesson.video.title}
                  </span>
                  <span className="text-xs font-semibold text-blue-200 mt-1">
                    Tap to stream ({lesson.video.duration}) • Low Data Optimized
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: 5-QUESTION QUIZ */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h2 className="font-extrabold text-lg">5-Question Knowledge Quiz</h2>
              </div>
              {quizScore !== null && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    quizScore >= 70
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Score: {quizScore}%
                </span>
              )}
            </div>

            <div className="space-y-6">
              {lesson.quiz.map((q, qIdx) => {
                const selectedOpt = selectedAnswers[qIdx];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = isAnswered && selectedOpt === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <p className="text-sm font-bold text-slate-900">{q.question}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle =
                          'bg-white border-slate-200 text-slate-700 hover:border-blue-300';
                        if (selectedOpt === optIdx) {
                          btnStyle = 'bg-blue-50 border-blue-500 text-blue-900 font-bold';
                        }
                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                          } else if (selectedOpt === optIdx && !isCorrect) {
                            btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 line-through';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            disabled={quizSubmitted}
                            className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all ${btnStyle}`}
                          >
                            <span className="font-bold mr-2 text-slate-400">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation after submission */}
                    {quizSubmitted && (
                      <div
                        className={`p-3 rounded-xl text-xs ${
                          isCorrect
                            ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
                            : 'bg-rose-50/80 border border-rose-200 text-rose-900'
                        }`}
                      >
                        <div className="font-bold mb-0.5">
                          {isCorrect ? '✓ Correct!' : '✗ Explanation:'}
                        </div>
                        <div>{q.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                id="submit-quiz-btn"
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 transition-all"
              >
                Submit Quiz & Grade Answers
              </button>
            ) : (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <div>
                  <span className="text-xs text-blue-700 font-semibold block">Quiz Result</span>
                  <span className="text-xl font-extrabold text-blue-900">
                    {quizScore}% Mastery Recorded
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </div>

          {/* SECTION 5: LEARNER NOTES & "SAVE MY WORK" */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">
                My CAPS Study Notes
              </h3>
              <span className="text-xs text-slate-500">Saved in cloud + offline cache</span>
            </div>

            <textarea
              id="lesson-notes-textarea"
              rows={4}
              placeholder="Write your personal summary notes, tricky steps, or formulas for this lesson..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full p-3.5 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                "Your work is safe - saved in cloud"
              </span>
              <button
                onClick={handleSaveWorkClick}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save My Work</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
