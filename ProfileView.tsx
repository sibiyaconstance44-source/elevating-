import React from 'react';
import {
  User,
  GraduationCap,
  Crown,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  Smartphone,
  Cloud,
  FileText,
} from 'lucide-react';
import { UserProgress } from '../types';

interface ProfileViewProps {
  user: UserProgress;
  onOpenPayment: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onOpenPayment,
  onSelectLesson,
}) => {
  const completedCount = user.completedLessonIds.length;
  const progressPercent = Math.min(100, Math.round((completedCount / 15) * 100));
  const quizScoresEntries = Object.entries(user.quizScores);
  const savedNotesEntries = Object.entries(user.savedNotes || {});

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-600 ring-4 ring-blue-100 shadow-md">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {user.isPremium && (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
                <Crown className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {user.fullName}
                </h1>
                <p className="text-sm font-semibold text-blue-600 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>{user.grade} • South African CAPS Scholar</span>
                </p>
              </div>

              {user.isPremium ? (
                <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold self-center sm:self-auto flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Premium Active</span>
                </div>
              ) : (
                <button
                  onClick={onOpenPayment}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-transform active:scale-95 flex items-center gap-1.5 self-center sm:self-auto"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Upgrade to Premium (R50/mo)</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2 pt-1">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Mobile: {user.phoneNumber}</span>
              <span>•</span>
              <span className="text-slate-400">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </p>

            {/* Cloud safe status badge */}
            <div className="mt-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center gap-2.5 text-xs text-blue-950">
              <Cloud className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Your work is safe - saved in cloud.</strong> When you log in on another phone or browser, your progress, scores, and notes come back.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Circle & Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Circle Card */}
        <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-xs flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Curriculum Progress
          </h3>

          {/* SVG Progress Circle */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-slate-100 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-blue-600 stroke-current transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-900">{progressPercent}%</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase">Mastered</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            {completedCount} lessons completed across CAPS subjects
          </p>
        </div>

        {/* Stats 2: Quiz performance */}
        <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Quiz Performance
            </h3>
            <div className="text-3xl font-extrabold text-slate-900">
              {quizScoresEntries.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">CAPS quizzes completed with saved scores</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {quizScoresEntries.slice(0, 3).map(([lessonId, score]) => {
              const numScore = Number(score);
              return (
                <div key={lessonId} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 truncate max-w-[160px]">{lessonId}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md ${
                      numScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {numScore}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats 3: Ms Elevate Tutor Stats */}
        <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              AI Tutor Consultations
            </h3>
            <div className="text-3xl font-extrabold text-slate-900">
              {user.dailyChatsCount} <span className="text-sm font-semibold text-slate-400">chats today</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {user.isPremium ? 'Unlimited access active' : '3 chats/day limit on free tier'}
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-950">
            <strong>Ms Elevate:</strong> "Keep up the momentum! Consistent revision every afternoon makes matric distinctions guaranteed."
          </div>
        </div>
      </div>

      {/* BADGES SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-blue-100 pb-3">
          <Award className="w-5 h-5 text-blue-600" />
          <h2 className="font-extrabold text-lg text-slate-900">My CAPS Badges & Achievements</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.badges.map((badge) => (
            <div
              key={badge.id}
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200 flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{badge.name}</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">{badge.description}</p>
                {badge.unlockedAt && (
                  <span className="text-[10px] font-semibold text-blue-600 mt-1.5 block">
                    Unlocked on Elevate
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAVED NOTES ARCHIVE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-blue-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="font-extrabold text-lg text-slate-900">Saved Study Notes</h2>
          </div>
          <span className="text-xs text-slate-500">
            {savedNotesEntries.length} saved note{savedNotesEntries.length === 1 ? '' : 's'}
          </span>
        </div>

        {savedNotesEntries.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No notes saved yet. Click "Save My Work" on any lesson to keep your personal study summaries safe here!
          </div>
        ) : (
          <div className="space-y-3">
            {savedNotesEntries.map(([lessonId, notes]) => (
              <div
                key={lessonId}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800">Lesson ID: {lessonId}</span>
                  <button
                    onClick={() => onSelectLesson(lessonId)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                  >
                    Open Lesson
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-mono whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-100">
                  {notes}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
