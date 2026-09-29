import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  X,
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
  Check,
  Layers,
  Info,
} from 'lucide-react';
import { GradeBand, SubjectInfo } from '../types';
import { GRADE_BANDS, SUBJECTS } from '../data/curriculum';

interface GradeSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGrade: string;
  currentSelectedSubjects?: string[];
  onSave: (grade: string, selectedSubjectIds: string[]) => void;
  isInitialOnboarding?: boolean;
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

// Map grade to appropriate grade band
export function getGradeBandFromGrade(grade: string): GradeBand {
  const g = grade.toLowerCase();
  if (g.includes('12') || g.includes('11') || g.includes('10')) {
    return 'Grade 10-12';
  }
  if (g.includes('9') || g.includes('8') || g.includes('7')) {
    return 'Grade 7-9';
  }
  if (g.includes('6') || g.includes('5') || g.includes('4')) {
    return 'Grade 4-6';
  }
  return 'Grade R-3';
}

const ALL_GRADES = [
  {
    phase: 'FET Phase (Matric Ready)',
    grades: ['Grade 12', 'Grade 11', 'Grade 10'],
    band: 'Grade 10-12' as GradeBand,
    note: 'NSC & IEB examinations focus',
  },
  {
    phase: 'Senior Phase',
    grades: ['Grade 9', 'Grade 8', 'Grade 7'],
    band: 'Grade 7-9' as GradeBand,
    note: 'Transition to high school & subject choices',
  },
  {
    phase: 'Intermediate Phase',
    grades: ['Grade 6', 'Grade 5', 'Grade 4'],
    band: 'Grade 4-6' as GradeBand,
    note: 'Core literacy, mathematics & sciences',
  },
  {
    phase: 'Foundation Phase',
    grades: ['Grade 3', 'Grade 2', 'Grade 1', 'Grade R'],
    band: 'Grade R-3' as GradeBand,
    note: 'Early childhood phonics & numbers',
  },
];

export const GradeSubjectModal: React.FC<GradeSubjectModalProps> = ({
  isOpen,
  onClose,
  currentGrade,
  currentSelectedSubjects = [],
  onSave,
  isInitialOnboarding = false,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>(currentGrade || 'Grade 12');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Calculate current grade band based on selected grade
  const currentBand = useMemo(() => getGradeBandFromGrade(selectedGrade), [selectedGrade]);

  // Available subjects for the current grade band
  const availableSubjects = useMemo(() => {
    return SUBJECTS.filter((s) => s.gradeBand === currentBand);
  }, [currentBand]);

  // Sync state when modal opens or current values change
  useEffect(() => {
    if (isOpen) {
      const grade = currentGrade || 'Grade 12';
      setSelectedGrade(grade);
      const band = getGradeBandFromGrade(grade);
      const bandSubjects = SUBJECTS.filter((s) => s.gradeBand === band);

      if (currentSelectedSubjects && currentSelectedSubjects.length > 0) {
        // Keep valid subjects for this band, or default to all if none match
        const valid = currentSelectedSubjects.filter((id) =>
          bandSubjects.some((s) => s.id === id)
        );
        if (valid.length > 0) {
          setSelectedSubjects(valid);
        } else {
          // Pre-select top subjects for this band
          setSelectedSubjects(getDefaultSubjectsForBand(band, bandSubjects));
        }
      } else {
        // Default subjects
        setSelectedSubjects(getDefaultSubjectsForBand(band, bandSubjects));
      }
    }
  }, [isOpen, currentGrade, currentSelectedSubjects]);

  function getDefaultSubjectsForBand(band: GradeBand, subjects: SubjectInfo[]): string[] {
    if (band === 'Grade 10-12') {
      // Pre-select recommended Matric 7 subjects
      const recommendedCodes = ['1012-math', '1012-phys', '1012-life', '1012-fal', '1012-hl', '1012-lo', '1012-acc'];
      const matched = subjects.filter((s) => recommendedCodes.includes(s.id)).map((s) => s.id);
      return matched.length > 0 ? matched : subjects.slice(0, 6).map((s) => s.id);
    }
    // For other phases, select all or first 6 subjects
    return subjects.map((s) => s.id);
  }

  // When grade changes, update subjects to default for that band if grade band changes
  const handleGradeChange = (newGrade: string) => {
    setSelectedGrade(newGrade);
    const newBand = getGradeBandFromGrade(newGrade);
    if (newBand !== currentBand) {
      const newBandSubjects = SUBJECTS.filter((s) => s.gradeBand === newBand);
      setSelectedSubjects(getDefaultSubjectsForBand(newBand, newBandSubjects));
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedSubjects(availableSubjects.map((s) => s.id));
  };

  const handleSelectRecommended = () => {
    setSelectedSubjects(getDefaultSubjectsForBand(currentBand, availableSubjects));
  };

  const handleSave = () => {
    // If no subjects chosen, select at least the first available
    const finalSubjects =
      selectedSubjects.length > 0 ? selectedSubjects : availableSubjects.slice(0, 1).map((s) => s.id);
    onSave(selectedGrade, finalSubjects);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-6 shadow-2xl border border-blue-100 relative overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 sm:p-6 relative shrink-0">
          {!isInitialOnboarding && (
            <button
              id="close-grade-subject-modal"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-amber-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-200">
                {isInitialOnboarding ? 'Welcome to Elevate' : 'Personalize Your Studies'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Choose Your Grade & Subjects
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Select your grade and enroll in your official CAPS subjects. Elevate will tailor your
            video lessons, Ms Elevate AI homework tutor, and past exam papers to match your syllabus.
          </p>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* STEP 1: GRADE SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Select Your Grade
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Active: {selectedGrade}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_GRADES.map((phaseGroup) => (
                <div
                  key={phaseGroup.phase}
                  className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80"
                >
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>{phaseGroup.phase}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {phaseGroup.grades.map((gradeOption) => {
                      const isSelected = selectedGrade === gradeOption;
                      return (
                        <button
                          key={gradeOption}
                          id={`grade-btn-${gradeOption.replace(/\s+/g, '-').toLowerCase()}`}
                          type="button"
                          onClick={() => handleGradeChange(gradeOption)}
                          className={`flex-1 min-w-[75px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600 ring-offset-1'
                              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          <span>{gradeOption}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2: SUBJECT SELECTION */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Choose Your Subjects ({selectedGrade})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tap to enroll or remove. You can change these anytime.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectRecommended}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-2.5 py-1 rounded-lg transition-colors border border-blue-200"
                >
                  Recommended
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Select All
                </button>
              </div>
            </div>

            {/* Selection Counter Bar */}
            <div className="mb-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
              <span className="font-semibold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                {selectedSubjects.length} of {availableSubjects.length} subjects enrolled
              </span>
              {selectedGrade.includes('10') || selectedGrade.includes('11') || selectedGrade.includes('12') ? (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  Required: Select your Matric subject package
                </span>
              ) : null}
            </div>

            {/* FET Phase Notice for Grade 10, 11, 12 */}
            {(selectedGrade.includes('10') || selectedGrade.includes('11') || selectedGrade.includes('12')) && (
              <div className="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Grade 10 - 12 (FET Phase) Subject Choice Rule:</span>
                </div>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  Learners from Grade 10 must choose their personal CAPS subject stream. Typically 7 subjects: 2 official languages, Mathematics or Mathematical Literacy, Life Orientation, plus your 3 chosen electives (e.g. Physical Sciences, Life Sciences, Accounting, History, Geography, Business Studies). Select your specific subjects below:
                </p>
              </div>
            )}

            {/* Subject Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {availableSubjects.map((subject) => {
                const isSelected = selectedSubjects.includes(subject.id);
                const IconComponent = ICON_MAP[subject.iconName] || BookOpen;

                return (
                  <button
                    key={subject.id}
                    id={`subject-toggle-${subject.id}`}
                    type="button"
                    onClick={() => toggleSubject(subject.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 relative group ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {subject.name}
                        </h4>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                        {subject.description}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {subject.code}
                        </span>
                        {subject.isHighDemand && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            Matric Core
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-emerald-600 ml-auto">
                            Enrolled
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer / Save Action */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span className="font-semibold text-slate-700">Enrolling in:</span> {selectedGrade} with{' '}
            <strong className="text-blue-600">{selectedSubjects.length} subjects</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isInitialOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              id="save-grade-subjects-btn"
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Grade & Subjects</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
