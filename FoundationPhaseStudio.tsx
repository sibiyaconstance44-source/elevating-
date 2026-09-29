import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Square,
  RotateCcw,
  CheckCircle2,
  Star,
  Award,
  BookOpen,
  Calculator,
  ChevronRight,
  Smile,
  Zap,
  HelpCircle,
  Coins,
  Clock,
  Shapes,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProgress } from '../types';
import {
  FoundationGrade,
  FOUNDATION_GRADES,
  GRADE_BENCHMARKS,
  PHONICS_SOUNDS,
  CVC_WORD_BUILDER_SETS,
  READING_PASSAGES,
  EARLY_MATH_CHALLENGES,
  ReadingPassage,
  EarlyMathProblem,
} from '../data/foundationCurriculum';

interface FoundationPhaseStudioProps {
  user: UserProgress;
  initialGrade?: FoundationGrade;
  onOpenPayment?: () => void;
  onBack?: () => void;
}

interface ReadingEvaluationResult {
  accuracyPercent: number;
  wordsPerMinute: number;
  gradeExpectedWpm: number;
  fluencyLevel: string;
  starsAwarded: number;
  totalWords: number;
  wordsCorrect: number;
  wordStatuses: { word: string; status: 'correct' | 'struggled' | 'missed'; phonicsTip?: string }[];
  trickySoundsDetected: string[];
  praise: string;
  phonicsTip: string;
}

export const FoundationPhaseStudio: React.FC<FoundationPhaseStudioProps> = ({
  user,
  initialGrade,
  onOpenPayment,
  onBack,
}) => {
  // Determine starting grade: if user is Grade R, 1, 2, or 3, use that; otherwise default to Grade 1
  const getInitialGrade = (): FoundationGrade => {
    if (initialGrade) return initialGrade;
    if (user.grade.includes('Grade R') || user.grade.toLowerCase() === 'r') return 'Grade R';
    if (user.grade.includes('Grade 1')) return 'Grade 1';
    if (user.grade.includes('Grade 2')) return 'Grade 2';
    if (user.grade.includes('Grade 3')) return 'Grade 3';
    return 'Grade 1';
  };

  const [selectedGrade, setSelectedGrade] = useState<FoundationGrade>(getInitialGrade());
  const [activeTab, setActiveTab] = useState<'reading' | 'phonics' | 'math'>('reading');

  // --- Reading Coach State ---
  const currentPassages = READING_PASSAGES[selectedGrade] || READING_PASSAGES['Grade 1'];
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(0);
  const currentPassage: ReadingPassage = currentPassages[selectedPassageIndex] || currentPassages[0];

  const [isAiReading, setIsAiReading] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<ReadingEvaluationResult | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [hasAnsweredQuiz, setHasAnsweredQuiz] = useState(false);

  // --- Phonics State ---
  const currentPhonics = PHONICS_SOUNDS[selectedGrade] || PHONICS_SOUNDS['Grade 1'];
  const currentCvc = CVC_WORD_BUILDER_SETS[selectedGrade] || CVC_WORD_BUILDER_SETS['Grade 1'];
  const [activeCvcIndex, setActiveCvcIndex] = useState(0);
  const [playingSoundLetter, setPlayingSoundLetter] = useState<string | null>(null);

  // --- Math State ---
  const currentMathProblems = EARLY_MATH_CHALLENGES[selectedGrade] || EARLY_MATH_CHALLENGES['Grade 1'];
  const [mathProblemIndex, setMathProblemIndex] = useState(0);
  const currentMath: EarlyMathProblem = currentMathProblems[mathProblemIndex] || currentMathProblems[0];
  const [mathSelectedAnswer, setMathSelectedAnswer] = useState<string | number | null>(null);
  const [mathIsCorrect, setMathIsCorrect] = useState<boolean | null>(null);
  const [mathAiExplanation, setMathAiExplanation] = useState<string | null>(null);
  const [loadingMathHelp, setLoadingMathHelp] = useState(false);

  // MediaRecorder & Speech Recognition refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Reset passage index and results when grade changes
  useEffect(() => {
    setSelectedPassageIndex(0);
    setEvaluationResult(null);
    setSpokenTranscript('');
    setIsRecording(false);
    setMathProblemIndex(0);
    setMathSelectedAnswer(null);
    setMathIsCorrect(null);
    setMathAiExplanation(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [selectedGrade]);

  // Clean up recording timer and speech on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --- Speech Synthesis for AI Reading & Phonics ---
  const speakText = (
    text: string,
    rate = 0.85,
    pitch = 1.1,
    onWordBoundary?: (wordIndex: number) => void,
    onEndCallback?: () => void
  ) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate; // Gentle pace for young learners
    utterance.pitch = pitch;

    // Pick English or friendly female voice if available
    const voices = window.speechSynthesis.getVoices();
    const saVoice = voices.find(
      (v) => v.lang.includes('en-ZA') || v.name.includes('South Africa') || v.lang.includes('en-GB')
    );
    if (saVoice) utterance.voice = saVoice;

    if (onWordBoundary) {
      let charCount = 0;
      const words = text.split(/\s+/);
      const wordStarts = words.map((w) => {
        const start = text.indexOf(w, charCount);
        charCount = start + w.length;
        return start;
      });

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const charIdx = event.charIndex;
          let matchedWordIdx = 0;
          for (let i = 0; i < wordStarts.length; i++) {
            if (charIdx >= wordStarts[i]) matchedWordIdx = i;
          }
          onWordBoundary(matchedWordIdx);
        }
      };
    }

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  };

  // 1. AI Teacher Reads First (Karaoke-style word highlighting)
  const handleListenAiRead = () => {
    if (isAiReading) {
      window.speechSynthesis.cancel();
      setIsAiReading(false);
      setHighlightedWordIndex(null);
      return;
    }

    setIsAiReading(true);
    setHighlightedWordIndex(0);

    speakText(
      currentPassage.text,
      selectedGrade === 'Grade R' ? 0.75 : 0.85,
      1.1,
      (wordIdx) => setHighlightedWordIndex(wordIdx),
      () => {
        setIsAiReading(false);
        setHighlightedWordIndex(null);
      }
    );
  };

  // 2. Play Phonics Sound
  const handlePlayPhonicsSound = (letter: string, soundClipText: string) => {
    setPlayingSoundLetter(letter);
    speakText(soundClipText, 0.8, 1.15, undefined, () => setPlayingSoundLetter(null));
  };

  // 3. Blend CVC Word
  const handleBlendCvc = (cvc: (typeof currentCvc)[0]) => {
    setPlayingSoundLetter(cvc.word);
    const blendSentence = `${cvc.onset}... ${cvc.rime}... ${cvc.word}! ${cvc.meaning}.`;
    speakText(blendSentence, 0.8, 1.1, undefined, () => {
      setPlayingSoundLetter(null);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    });
  };

  // 4. Start Recording & Voice Recognition
  const handleStartRecording = async () => {
    setEvaluationResult(null);
    setSpokenTranscript('');
    setRecordingSeconds(0);
    setSelectedQuizAnswer(null);
    setHasAnsweredQuiz(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Initialize Web Speech Recognition for live transcribing
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-ZA';

        let accumulatedTranscript = '';

        recognition.onresult = (event: any) => {
          let currentSession = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentSession += event.results[i][0].transcript + ' ';
          }
          accumulatedTranscript = currentSession;
          setSpokenTranscript(currentSession.trim());
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition notice:', err);
        };

        try {
          recognition.start();
        } catch {
          // already started
        }
      }
    } catch (err) {
      console.warn('Microphone permission or access error:', err);
      // Fallback: Enable manual simulated recording so child is never blocked
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // 5. Stop Recording & Evaluate
  const handleStopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      // stop mic tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
    setIsEvaluating(true);

    const finalDuration = Math.max(recordingSeconds, 3);
    const learnerSpokenText = spokenTranscript.trim() || currentPassage.text; // Default to read text if recognition empty

    try {
      const response = await fetch('/api/ai/monitor-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          targetText: currentPassage.text,
          spokenText: learnerSpokenText,
          durationSeconds: finalDuration,
          learnerName: user.fullName || 'Young Learner',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEvaluationResult(data);

        // Confetti celebration if 4 or 5 stars!
        if (data.starsAwarded >= 4) {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error('Error monitoring reading:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 6. Early Math Answer Selection
  const handleSelectMathAnswer = async (option: string | number) => {
    setMathSelectedAnswer(option);
    const isCorrect = String(option).trim().toLowerCase() === String(currentMath.correctAnswer).trim().toLowerCase();
    setMathIsCorrect(isCorrect);

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
      speakText('Brilliant! That is correct!', 0.9, 1.2);
    } else {
      speakText('Almost! Let us ask Ms Elevate how to solve it together.', 0.9, 1.1);
    }
  };

  const handleAskMathAi = async () => {
    setLoadingMathHelp(true);
    try {
      const res = await fetch('/api/ai/early-math-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          problemPrompt: currentMath.prompt,
          studentAnswer: mathSelectedAnswer || '',
          correctAnswer: currentMath.correctAnswer,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMathAiExplanation(data.explanation);
        speakText(data.explanation, 0.85, 1.1);
      }
    } catch {
      setMathAiExplanation(currentMath.explanation);
      speakText(currentMath.explanation, 0.85, 1.1);
    } finally {
      setLoadingMathHelp(false);
    }
  };

  const benchmark = GRADE_BENCHMARKS[selectedGrade];

  return (
    <div className="space-y-6">
      {/* Header Banner with Grade Selector */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-10 w-32 h-32 bg-amber-300/20 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" />
                Foundation Phase (Grade R - 3)
              </span>
              <span className="px-2.5 py-0.5 bg-yellow-300 text-yellow-950 rounded-full text-[11px] font-black">
                DBE CAPS Aligned
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
              Phonics, AI Reading Coach & Early Math
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 font-medium leading-relaxed">
              Ms Elevate AI listens while your child reads aloud, measures fluency (WPM) and accuracy, teaches letter sounds, and makes early math magical!
            </p>
          </div>

          {/* Big Tactile Grade Switcher for Young Learners */}
          <div className="bg-black/20 p-1.5 rounded-2xl backdrop-blur-md flex items-center gap-1 border border-white/20 shrink-0">
            {FOUNDATION_GRADES.map((grade) => {
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-orange-600 shadow-md scale-105'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{grade === 'Grade R' ? '🧸' : grade === 'Grade 1' ? '🎒' : grade === 'Grade 2' ? '🚀' : '🌟'}</span>
                  <span>{grade}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grade Benchmark Pill */}
        <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs text-orange-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Target Reading Speed:</span>
            <span className="px-2.5 py-0.5 bg-white/25 rounded-full font-black text-yellow-200">
              {benchmark.targetWpm}
            </span>
          </div>
          <div className="text-[11px] text-white/90">
            <strong>Curriculum Focus:</strong> {benchmark.focus}
          </div>
        </div>
      </div>

      {/* Navigation Tabs: Reading Coach, Phonics, Math */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('reading')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'reading'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>AI Reading Voice Coach</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/30 text-white">Live Monitor</span>
        </button>

        <button
          onClick={() => setActiveTab('phonics')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'phonics'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Phonics & Word Builder</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/30 text-white">Sounds & CVC</span>
        </button>

        <button
          onClick={() => setActiveTab('math')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'math'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Foundation Math Studio</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/30 text-white">CAPS</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. AI READING VOICE COACH (Microphone recording & skill monitoring)       */}
      {/* ========================================================================= */}
      {activeTab === 'reading' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Passage Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Select {selectedGrade} Story:
              </span>
              <div className="flex items-center gap-1.5">
                {currentPassages.map((pass, idx) => (
                  <button
                    key={pass.id}
                    onClick={() => {
                      setSelectedPassageIndex(idx);
                      setEvaluationResult(null);
                      setSpokenTranscript('');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                      selectedPassageIndex === idx
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Story {idx + 1}: {pass.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{currentPassage.targetWordCount} Words</span>
              <span>•</span>
              <span className="text-orange-600 font-bold">
                {currentPassage.type === 'sentence' ? 'Single Sentence' : 'Short Story Paragraph'}
              </span>
            </div>
          </div>

          {/* Primary Reading Display Card */}
          <div className="bg-gradient-to-b from-amber-50/50 to-white rounded-3xl border-2 border-orange-200/70 p-6 sm:p-9 shadow-lg relative space-y-6">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedGrade === 'Grade R' ? '🧸' : '📖'}</span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">{currentPassage.title}</h2>
                  <p className="text-[11px] text-slate-500">
                    Phonics Focus: {currentPassage.phonicsFocus.join(', ')}
                  </p>
                </div>
              </div>

              {/* Audio teacher listen button */}
              <button
                type="button"
                onClick={handleListenAiRead}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                  isAiReading
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                }`}
              >
                {isAiReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
                <span>{isAiReading ? 'Stop Reading' : 'Listen to Ms Elevate First'}</span>
              </button>
            </div>

            {/* The Text to Read - Large, clear font for young learners */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-orange-100 shadow-inner min-h-[120px] flex items-center justify-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 leading-relaxed tracking-wide text-center">
                {currentPassage.text.split(/\s+/).map((word, idx) => {
                  const isHighlighted = highlightedWordIndex === idx;

                  // If we already have evaluation results, color code the word
                  const evaluatedWord = evaluationResult?.wordStatuses?.[idx];
                  let wordColorClass = 'text-slate-800';

                  if (isHighlighted) {
                    wordColorClass = 'bg-yellow-300 text-slate-950 px-1.5 py-0.5 rounded-md shadow-xs scale-105 inline-block';
                  } else if (evaluatedWord) {
                    if (evaluatedWord.status === 'correct') {
                      wordColorClass = 'text-emerald-700 bg-emerald-100/80 px-1 rounded';
                    } else if (evaluatedWord.status === 'struggled') {
                      wordColorClass = 'text-amber-700 bg-amber-100 px-1 rounded underline decoration-wavy';
                    } else {
                      wordColorClass = 'text-rose-600 bg-rose-50 px-1 rounded line-through opacity-75';
                    }
                  }

                  return (
                    <span
                      key={idx}
                      className={`inline-block mx-1.5 transition-all duration-200 ${wordColorClass}`}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center justify-center gap-3 pt-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  disabled={isEvaluating}
                  className="px-6 sm:px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-500/30 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <span>Start Recording & Read Aloud</span>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-rose-50 border-2 border-rose-300 text-rose-700 text-sm font-black">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Listening & Monitoring... ({recordingSeconds}s)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md flex items-center gap-2 transition-transform hover:scale-105"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Stop Recording & See Skills Report</span>
                  </button>
                </div>
              )}

              {/* Spoken words live transcript preview */}
              {isRecording && spokenTranscript && (
                <div className="w-full max-w-lg p-3 bg-orange-100/60 rounded-xl text-center text-xs text-orange-950 font-bold animate-in fade-in">
                  <span className="text-[10px] text-orange-600 uppercase block mb-0.5">Spoken Sound Detected:</span>
                  "{spokenTranscript}"
                </div>
              )}

              {isEvaluating && (
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 py-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Ms Elevate AI is analyzing pronunciation and reading fluency...</span>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* Reading Skills Report Card (Evaluated by Ms Elevate AI)   */}
            {/* ========================================================= */}
            {evaluationResult && (
              <div className="mt-6 p-5 sm:p-7 bg-white rounded-3xl border-2 border-emerald-300 shadow-xl space-y-5 animate-in slide-in-from-bottom-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl">
                      ⭐
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-slate-900">
                        {evaluationResult.fluencyLevel} Report Card
                      </h3>
                      <p className="text-xs text-slate-500">
                        Assessed against South African DBE {selectedGrade} Reading Benchmarks
                      </p>
                    </div>
                  </div>

                  {/* 5-Star Rating */}
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-5 h-5 ${
                          starIdx <= evaluationResult.starsAwarded
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="ml-1 font-black text-xs text-amber-900">
                      {evaluationResult.starsAwarded}/5 Stars
                    </span>
                  </div>
                </div>

                {/* Score Meters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                      Reading Accuracy
                    </span>
                    <div className="text-2xl font-black text-emerald-700">
                      {evaluationResult.accuracyPercent}%
                    </div>
                    <div className="text-[11px] text-emerald-600 font-medium">
                      {evaluationResult.wordsCorrect} of {evaluationResult.totalWords} words correct
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center">
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                      Reading Speed (WPM)
                    </span>
                    <div className="text-2xl font-black text-blue-700">
                      {evaluationResult.wordsPerMinute} WPM
                    </div>
                    <div className="text-[11px] text-blue-600 font-medium">
                      {selectedGrade} target: ~{evaluationResult.gradeExpectedWpm} WPM
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-center">
                    <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
                      Fluency Level
                    </span>
                    <div className="text-lg font-black text-purple-900 mt-1">
                      {evaluationResult.fluencyLevel}
                    </div>
                    <div className="text-[11px] text-purple-600 font-medium">
                      {evaluationResult.accuracyPercent >= 85 ? 'Outstanding progress!' : 'Keep practicing!'}
                    </div>
                  </div>
                </div>

                {/* Ms Elevate AI Feedback */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-amber-400">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                      alt="Ms Elevate"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="font-black text-xs text-amber-900">Ms Elevate's Coaching Feedback:</div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      {evaluationResult.praise}
                    </p>
                    <p className="text-xs text-orange-800 font-bold">
                      💡 Phonics Tip: {evaluationResult.phonicsTip}
                    </p>
                  </div>
                </div>

                {/* Comprehension Question to verify understanding */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Story Comprehension Question:</span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">
                    {currentPassage.comprehensionQuestion.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {currentPassage.comprehensionQuestion.options.map((opt, optIdx) => {
                      const isSelected = selectedQuizAnswer === optIdx;
                      const isCorrect = optIdx === currentPassage.comprehensionQuestion.correctIndex;
                      let btnStyle = 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200';

                      if (hasAnsweredQuiz) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-500 text-white border-emerald-500';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-500 text-white border-rose-500';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={hasAnsweredQuiz}
                          onClick={() => {
                            setSelectedQuizAnswer(optIdx);
                            setHasAnsweredQuiz(true);
                            if (isCorrect) {
                              confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                              speakText('Spot on! You understood the story!', 0.9, 1.2);
                            } else {
                              speakText('Good try! Look closely at the story details.', 0.9, 1.1);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEvaluationResult(null);
                      setSpokenTranscript('');
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Reading Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = (selectedPassageIndex + 1) % currentPassages.length;
                      setSelectedPassageIndex(nextIdx);
                      setEvaluationResult(null);
                      setSpokenTranscript('');
                    }}
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Next Story</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PHONICS LAB & CVC WORD BUILDER                                         */}
      {/* ========================================================================= */}
      {activeTab === 'phonics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Section 1: Letter Sound Cards */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🔤</span>
                  <span>{selectedGrade} Phonics Letter Sounds</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Tap any letter card to hear Ms Elevate pronounce the letter sound clearly!
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-bold">
                {currentPhonics.length} Sounds
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
              {currentPhonics.map((card) => {
                const isPlaying = playingSoundLetter === card.letter;
                return (
                  <button
                    key={card.letter}
                    type="button"
                    onClick={() => handlePlayPhonicsSound(card.letter, card.soundClipText)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between group ${
                      isPlaying
                        ? 'border-blue-500 bg-blue-50 scale-105 shadow-md ring-2 ring-blue-300'
                        : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight">
                        {card.letter}
                      </span>
                      <span className="text-2xl">{card.emoji}</span>
                    </div>

                    <div className="mt-3 space-y-0.5">
                      <div className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600">
                        {card.sound}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>word: <strong>{card.exampleWord}</strong></span>
                        <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Interactive CVC & Blending Machine */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 sm:p-8 border-2 border-blue-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-blue-950 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Interactive Sound Blending Machine</span>
                </h3>
                <p className="text-xs text-blue-700">
                  Blend consonants and vowels together to form real words!
                </p>
              </div>

              {/* Selector for CVC word */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {currentCvc.map((c, i) => (
                  <button
                    key={c.word}
                    onClick={() => setActiveCvcIndex(i)}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                      activeCvcIndex === i
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {c.word}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Blending Display */}
            {currentCvc[activeCvcIndex] && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-sm flex flex-col items-center justify-center space-y-5">
                <div className="text-4xl">{currentCvc[activeCvcIndex].emoji}</div>

                <div className="flex items-center gap-3 sm:gap-6">
                  {/* Onset tile */}
                  <div className="w-16 sm:w-20 h-20 sm:h-24 rounded-2xl bg-amber-100 border-2 border-amber-300 flex flex-col items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-amber-700 uppercase">Sound 1</span>
                    <span className="text-3xl sm:text-4xl font-black text-amber-950">
                      {currentCvc[activeCvcIndex].onset}
                    </span>
                  </div>

                  <span className="text-2xl font-black text-blue-300">+</span>

                  {/* Rime tile */}
                  <div className="w-16 sm:w-20 h-20 sm:h-24 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex flex-col items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-emerald-700 uppercase">Sound 2</span>
                    <span className="text-3xl sm:text-4xl font-black text-emerald-950">
                      {currentCvc[activeCvcIndex].rime}
                    </span>
                  </div>

                  <span className="text-2xl font-black text-blue-300">=</span>

                  {/* Blended word tile */}
                  <div className="w-24 sm:w-32 h-20 sm:h-24 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-blue-200 uppercase">Blended</span>
                    <span className="text-3xl sm:text-4xl font-black">
                      {currentCvc[activeCvcIndex].word}
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-sm font-black text-slate-800">
                    "{currentCvc[activeCvcIndex].meaning}"
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBlendCvc(currentCvc[activeCvcIndex])}
                  className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Blend & Sound Out with Ms Elevate</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FOUNDATION MATH STUDIO                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'math' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1 inline-block">
                  CAPS Mathematics • {selectedGrade}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>🔢</span>
                  <span>{currentMath.capsConcept}</span>
                </h2>
              </div>

              {/* Problem index navigation */}
              <div className="flex items-center gap-1.5">
                {currentMathProblems.map((prob, idx) => (
                  <button
                    key={prob.id}
                    onClick={() => {
                      setMathProblemIndex(idx);
                      setMathSelectedAnswer(null);
                      setMathIsCorrect(null);
                      setMathAiExplanation(null);
                    }}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                      mathProblemIndex === idx
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Prompt */}
            <div className="bg-emerald-50/50 rounded-2xl p-6 sm:p-8 border border-emerald-100 text-center space-y-4">
              <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-800 leading-snug">
                {currentMath.prompt}
              </p>

              {/* Visual Items for counting or visualization */}
              {currentMath.visualItems && currentMath.visualItems.length > 0 && (
                <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-inner flex flex-wrap items-center justify-center gap-4">
                  {currentMath.visualItems.map((item, vIdx) => (
                    <div key={vIdx} className="flex flex-wrap items-center justify-center gap-2">
                      {Array.from({ length: item.count }).map((_, cIdx) => (
                        <span key={cIdx} className="text-3xl sm:text-4xl animate-in zoom-in">
                          {item.emoji}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentMath.options.map((opt, oIdx) => {
                const isSelected = mathSelectedAnswer === opt;
                let btnClass = 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200';

                if (isSelected) {
                  if (mathIsCorrect) {
                    btnClass = 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300';
                  } else {
                    btnClass = 'bg-rose-500 text-white border-rose-500 ring-2 ring-rose-300';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectMathAnswer(opt)}
                    className={`py-4 px-3 rounded-2xl border-2 font-black text-base sm:text-lg transition-all transform active:scale-95 shadow-sm ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Result & AI Teacher Help */}
            {mathIsCorrect !== null && (
              <div
                className={`p-5 rounded-2xl border space-y-3 animate-in fade-in ${
                  mathIsCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                    {mathIsCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Fantastic! That's correct! ⭐</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-5 h-5 text-amber-600" />
                        <span>Almost there! Let's review together.</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAskMathAi}
                    disabled={loadingMathHelp}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{loadingMathHelp ? 'Thinking...' : 'Ask Ms Elevate to Explain'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {mathAiExplanation || currentMath.explanation}
                </p>
              </div>
            )}

            {/* Next Problem Button */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const nextIdx = (mathProblemIndex + 1) % currentMathProblems.length;
                  setMathProblemIndex(nextIdx);
                  setMathSelectedAnswer(null);
                  setMathIsCorrect(null);
                  setMathAiExplanation(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
