import React from 'react';
import {
  Star,
  Zap,
  BookOpen,
  GraduationCap,
  ChevronRight,
  SlidersHorizontal,
  Trophy,
  CheckCircle2,
  Sparkles,
  Flame,
  Sigma,
  Dna,
  Calculator,
  Languages,
  BookA,
  HeartHandshake,
  Microscope,
  Compass,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Palette,
  Globe2,
  Landmark,
  Briefcase,
  Receipt,
  CircleDollarSign,
  FileSpreadsheet,
  Terminal,
} from 'lucide-react';
import { UserProgress, SubjectInfo } from '../types';
import { SUBJECTS } from '../data/curriculum';

interface MySubjectsMasteryProps {
  user: UserProgress;
  onOpenGradeSubjectModal: () => void;
  onOpenPracticeMode: (subjectId?: string) => void;
  onSelectSubjectForLessons: (subjectId: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sigma,
  Zap,
  Dna,
  Calculator,
  Languages,
  BookA,
  HeartHandshake,
  Microscope,
  Compass,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Palette,
  Globe2,
  Landmark,
  Briefcase,
  Receipt,
  CircleDollarSign,
  FileSpreadsheet,
  Terminal,
};

export const MySubjectsMastery: React.FC<MySubjectsMasteryProps> = ({
  user,
  onOpenGradeSubjectModal,
  onOpenPracticeMode,
  onSelectSubjectForLessons,
}) => {
  const userEnrolledSubjectIds = user.selectedSubjects || [];

  // Enrolled subjects matching user's selections
  const enrolledSubjects = SUBJECTS.filter((s) => userEnrolledSubjectIds.includes(s.id));

  // Fallback if none chosen yet: default to Grade 10-12 top subjects
  const displaySubjects =
    enrolledSubjects.length > 0
      ? enrolledSubjects
      : SUBJECTS.filter((s) => s.gradeBand === 'Grade 10-12').slice(0, 6);

  const isFETPhase =
    user.grade.includes('10') || user.grade.includes('11') || user.grade.includes('12');

  // Compute total stars earned across chosen subjects
  const totalStarsEarned = displaySubjects.reduce((acc, sub) => {
    return acc + (user.practiceStats?.[sub.id]?.stars || 0);
  }, 0);

  const maxPossibleStars = displaySubjects.length * 5;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-blue-100/80 space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              {user.grade}
            </span>
            {isFETPhase && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black">
                NSC & IEB Choice Stream
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>My Chosen Subjects & Practice Stars</span>
            <span className="text-xs font-bold text-slate-400 font-normal">
              ({displaySubjects.length} enrolled)
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Practice each subject across 3 difficulty levels to earn up to 5 mastery stars.
          </p>
        </div>

        {/* Global actions: Edit Subjects & Practice All */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="open-grade-subject-modal-btn"
            type="button"
            onClick={onOpenGradeSubjectModal}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Change Grade & Subjects</span>
          </button>

          <button
            id="open-practice-mode-all-btn"
            type="button"
            onClick={() => onOpenPracticeMode(displaySubjects[0]?.id)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Practice Mode</span>
          </button>
        </div>
      </div>

      {/* Star Progress Bar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-blue-50/50 to-indigo-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300 flex items-center justify-center text-amber-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span>Overall Subject Practice Mastery:</span>
              <strong className="text-amber-700 font-black">
                {totalStarsEarned} / {maxPossibleStars} Stars
              </strong>
            </div>
            <div className="text-[11px] text-slate-500">
              Complete Advanced practice to achieve 5-Star Distinction across all subjects.
            </div>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (totalStarsEarned / (maxPossibleStars || 1)) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displaySubjects.map((subject) => {
          const stats = user.practiceStats?.[subject.id];
          const stars = stats?.stars || 0;
          const attempts = stats?.totalAttempts || 0;
          const accuracy = stats?.accuracy || 0;
          const IconComponent = ICON_MAP[subject.iconName] || BookOpen;

          let masteryLabel = 'Not Practiced Yet';
          let badgeColor = 'bg-slate-100 text-slate-600';
          if (stars === 5) {
            masteryLabel = 'Distinction Mastery';
            badgeColor = 'bg-amber-100 text-amber-900 border border-amber-300 font-black';
          } else if (stars === 4) {
            masteryLabel = 'Advanced Scholar';
            badgeColor = 'bg-blue-100 text-blue-900 border border-blue-200 font-bold';
          } else if (stars === 3) {
            masteryLabel = 'Proficient';
            badgeColor = 'bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold';
          } else if (stars >= 1) {
            masteryLabel = 'Developing';
            badgeColor = 'bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold';
          }

          return (
            <div
              key={subject.id}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top indicator bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  stars === 5
                    ? 'bg-amber-400'
                    : stars >= 3
                    ? 'bg-blue-500'
                    : 'bg-slate-200'
                }`}
              />

              <div>
                {/* Subject Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors">
                        {subject.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        {subject.code} • {subject.gradeBand}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${badgeColor} shrink-0`}>
                    {masteryLabel}
                  </span>
                </div>

                {/* Stars Display */}
                <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700">Practice Stars:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx <= stars
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-black text-slate-700 ml-1.5">
                      {stars}/5
                    </span>
                  </div>
                </div>

                {/* Practice Metrics */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-1">
                  <span>Questions solved: <strong className="text-slate-700">{attempts}</strong></span>
                  <span>Accuracy: <strong className="text-slate-700">{accuracy}%</strong></span>
                  {stats?.highestDifficulty && (
                    <span className="capitalize font-semibold text-blue-600">
                      {stats.highestDifficulty}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  id={`practice-btn-${subject.id}`}
                  onClick={() => onOpenPracticeMode(subject.id)}
                  className="py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Practice (3 Levels)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSubjectForLessons(subject.id)}
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lessons</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
