import React from 'react';
import {
  Calendar,
  Clock,
  Award,
  Sparkles,
  BookOpen,
  Users,
  WifiOff,
  Mic,
  RotateCcw,
  Trophy,
  GraduationCap,
  ArrowRight,
  Brain,
  FileCheck,
} from 'lucide-react';
import { UserProgress } from '../types';
import { getTermCountdown, getMatricCountdowns } from '../data/saTerms';
import { ElevateLogo } from './ElevateLogo';

interface HeroBannerProps {
  user: UserProgress;
  dataSaver: boolean;
  onExploreLessons: () => void;
  onExploreGroups: () => void;
  onOpenTutor: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  user,
  dataSaver,
  onExploreLessons,
  onExploreGroups,
  onOpenTutor,
}) => {
  const isMatric =
    user.grade.toLowerCase().includes('12') ||
    user.grade.toLowerCase().includes('matric');
  const termInfo = getTermCountdown();
  const matricCountdowns = getMatricCountdowns();

  // Calculate user total points
  const quizScoresList = Object.values(user.quizScores || {}) as number[];
  const points =
    user.completedLessonIds.length * 50 +
    quizScoresList.reduce((acc: number, curr: number) => acc + (Number(curr) || 0), 0);

  return (
    <div className="space-y-6 mb-8">
      {/* Top White Hero Section matching Screenshot 1 */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-blue-100 shadow-xs relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Pill Badge matching Screenshot 1 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              {isMatric ? 'GRADE 12 STUDY COMPANION' : `${user.grade.toUpperCase()} STUDY COMPANION`}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              NSC & IEB Ready
            </span>

            {dataSaver && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <WifiOff className="w-3 h-3 text-emerald-600" />
                Data-less mode (5MB/day)
              </span>
            )}
          </div>

          {/* Giant Display Typography matching Screenshot 1 */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 leading-[0.95] uppercase">
              Master <br />
              <span className="text-blue-600 drop-shadow-xs">Matric</span> <br />
              With <br />
              Elevate.
            </h1>
          </div>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl leading-relaxed">
            The ultimate learning companion for South African {user.grade} subjects. Access past papers, AI tutoring with Ms Elevate, collaborative study squads, and CAPS-aligned study tools.
          </p>

          {/* Quick Action Button matching Screenshot 2: [ 🎙️ Live AI Tutor ] */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-live-ai-tutor-btn"
              onClick={onOpenTutor}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2.5"
            >
              <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>Live AI Tutor</span>
            </button>

            <button
              id="hero-explore-lessons-btn"
              onClick={onExploreLessons}
              className="px-5 py-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 text-slate-800 hover:text-blue-700 font-bold text-sm border border-slate-200 hover:border-blue-300 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Explore CAPS Lessons</span>
            </button>

            <button
              id="hero-explore-groups-btn"
              onClick={onExploreGroups}
              className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-700 font-bold text-sm border border-slate-200 transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Study Squads</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Royal Blue Exam Countdown Card + White Past Papers & Points Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIGNATURE ROYAL BLUE EXAM COUNTDOWN CARD (Matching Screenshot 2) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#2437E8] via-[#2F44EE] to-[#4F36DC] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-600/20 relative overflow-hidden flex flex-col justify-between">
          {/* Decorative ambient bubble */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

          <div className="space-y-4 relative z-10">
            {/* Translucent countdown pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-extrabold uppercase tracking-wider text-blue-100">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Exam Countdown</span>
            </div>

            {/* Giant Number Display */}
            <div className="py-2">
              <span className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight block leading-none drop-shadow-md">
                {isMatric ? matricCountdowns.finalsDays : termInfo.daysRemaining}
              </span>
              <p className="text-lg sm:text-xl font-bold text-blue-100 mt-1">
                {isMatric ? 'Days until NSC Finals' : `Days until ${termInfo.name} closes`}
              </p>
            </div>

            {/* Progress Bar with Gold Fill matching Screenshot 2 */}
            <div className="space-y-2 pt-2">
              <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: '65%' }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-blue-200">
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  65% OF SYLLABUS COVERED
                </span>
                <span className="text-white/80">Term 3 / Prelims</span>
              </div>
            </div>
          </div>

          {/* Sub-dates for Matric / Term */}
          <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-2 gap-3 relative z-10 text-xs">
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-blue-200 font-semibold block text-[11px]">Matric Trial Exams</span>
              <span className="font-bold text-white text-xs sm:text-sm">
                {matricCountdowns.prelimsLabel} ({matricCountdowns.prelimsDays}d)
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-amber-200 font-semibold block text-[11px]">National Finals</span>
              <span className="font-bold text-amber-300 text-xs sm:text-sm">
                {matricCountdowns.finalsLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Past Papers & Points Cards (Matching Screenshot 1 & 2) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* PAST PAPERS & MEMOS WHITE CARD (Matching Screenshot 2) */}
          <div
            onClick={onExploreLessons}
            className="bg-white rounded-3xl p-6 border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-6 h-6 text-blue-600" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-950 group-hover:text-blue-600 transition-colors">
              Past Papers & Memos
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Access high-yield practice questions and worked solutions modeled after previous NSC and IEB national exam papers.
            </p>

            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600">
              <span>Start Past Paper Practice</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* TOTAL POINTS CARD (Matching Screenshot 1) */}
          <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Points
                </span>
                <span className="text-2xl font-black text-slate-900 leading-tight">
                  {points} <span className="text-xs font-bold text-blue-600">PTS</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 block">
                {user.completedLessonIds.length} lessons done
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                Streak: {user.studyStreakDays} days 🔥
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
