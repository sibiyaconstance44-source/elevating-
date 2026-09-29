import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Bot,
  FileText,
  FileCheck,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Eye,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { PastPaper, UploadedPaper } from '../types';
import {
  generateQuestionPaperPDFBlobUrl,
  generateMemorandumPDFBlobUrl,
  downloadQuestionPaperPDF,
  downloadMemorandumPDF,
} from '../utils/pdfGenerator';

interface PDFReaderModalProps {
  isOpen: boolean;
  paper: PastPaper | null;
  uploadedPaper?: UploadedPaper | null;
  initialMode?: 'paper' | 'memo';
  onClose: () => void;
  onStartTutorOnPaper: (paper: {
    name: string;
    type: 'pdf' | 'image';
    dataUrl?: string;
    subject?: string;
    grade?: string;
    extractedText?: string;
  }) => void;
}

export const PDFReaderModal: React.FC<PDFReaderModalProps> = ({
  isOpen,
  paper,
  uploadedPaper,
  initialMode = 'paper',
  onClose,
  onStartTutorOnPaper,
}) => {
  const [activeTab, setActiveTab] = useState<'paper' | 'memo'>(initialMode);
  const [viewEngine, setViewEngine] = useState<'pdf' | 'reader'>('pdf');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  // Exam timer states
  const [timerActive, setTimerActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3 * 3600); // 3 hours default
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Initialize or reset view when modal opens or paper changes
  useEffect(() => {
    if (!isOpen) return;

    setActiveTab(initialMode);
    setZoomLevel(100);

    if (paper) {
      // Set timer to paper duration (hours to seconds)
      setSecondsRemaining(Math.round(paper.durationHours * 3600));
      setTimerActive(false);

      // Generate blob URL for in-app PDF rendering
      try {
        const url =
          initialMode === 'paper'
            ? generateQuestionPaperPDFBlobUrl(paper)
            : generateMemorandumPDFBlobUrl(paper);
        setPdfBlobUrl(url);

        return () => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        };
      } catch (err) {
        console.warn('PDF blob generation fallback to reader:', err);
        setViewEngine('reader');
      }
    } else if (uploadedPaper) {
      if (uploadedPaper.fileType === 'pdf') {
        setPdfBlobUrl(uploadedPaper.dataUrl);
      }
    }
  }, [isOpen, paper, uploadedPaper, initialMode]);

  // Update blob URL when switching between Question Paper and Memo
  const handleTabChange = (mode: 'paper' | 'memo') => {
    setActiveTab(mode);
    if (paper) {
      if (pdfBlobUrl && pdfBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
      const newUrl =
        mode === 'paper'
          ? generateQuestionPaperPDFBlobUrl(paper)
          : generateMemorandumPDFBlobUrl(paper);
      setPdfBlobUrl(newUrl);
    }
  };

  // Exam timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, secondsRemaining]);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(180, Math.max(70, prev + delta)));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleAskTutor = (questionText?: string) => {
    if (paper) {
      onStartTutorOnPaper({
        name: paper.title,
        type: 'pdf',
        subject: paper.subject,
        grade: paper.grade,
        extractedText: questionText
          ? `Question context: ${questionText}\n\nFrom paper: ${paper.title} (${paper.examBoard} ${paper.session})`
          : `Questions from ${paper.title}:\n${paper.questions.map((q) => `Q${q.number}: ${q.subQuestions.map((s) => s.questionText).join(' ')}`).join('\n')}`,
      });
      onClose();
    } else if (uploadedPaper) {
      onStartTutorOnPaper({
        name: uploadedPaper.fileName,
        type: uploadedPaper.fileType,
        dataUrl: uploadedPaper.dataUrl,
        subject: uploadedPaper.subject,
        grade: uploadedPaper.grade,
        extractedText: questionText,
      });
      onClose();
    }
  };

  if (!isOpen || (!paper && !uploadedPaper)) return null;

  const currentTitle = paper ? paper.title : uploadedPaper?.fileName || 'Exam Document';
  const currentSubject = paper ? paper.subject : uploadedPaper?.subject || 'Examination';

  return (
    <div
      ref={modalContainerRef}
      className={`fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-xs transition-all ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4'
      }`}
    >
      <div
        className={`flex flex-col w-full h-full bg-white shadow-2xl border border-blue-200 overflow-hidden transition-all ${
          isFullscreen ? 'rounded-none' : 'rounded-3xl max-w-6xl mx-auto'
        } ${nightMode ? 'bg-slate-900 text-slate-100 border-slate-700' : ''}`}
      >
        {/* ========================================================================= */}
        {/* TOP BAR: Header & Document Information */}
        {/* ========================================================================= */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-blue-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/60 border border-blue-400/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-800 text-blue-200 border border-blue-600/40">
                  {paper ? `${paper.examBoard} • ${paper.session}` : uploadedPaper?.fileType.toUpperCase()}
                </span>
                {paper && (
                  <span className="text-[11px] font-bold text-amber-300">
                    {paper.totalMarks} Marks • {paper.durationHours} Hours
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-black truncate max-w-md sm:max-w-xl text-white">
                {currentTitle}
              </h2>
            </div>
          </div>

          {/* Quick Controls & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Exam Countdown Timer */}
            {paper && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/60 border border-blue-700/50 text-xs font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className={`font-bold ${secondsRemaining < 600 ? 'text-rose-400 animate-pulse' : 'text-blue-100'}`}>
                  {formatTimer(secondsRemaining)}
                </span>
                <button
                  type="button"
                  onClick={() => setTimerActive(!timerActive)}
                  className="p-1 text-blue-200 hover:text-white rounded-md hover:bg-blue-800/50 transition-colors"
                  title={timerActive ? 'Pause exam timer' : 'Start exam countdown'}
                >
                  {timerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerActive(false);
                    setSecondsRemaining(Math.round(paper.durationHours * 3600));
                  }}
                  className="p-1 text-blue-300 hover:text-white rounded-md hover:bg-blue-800/50"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* 1-on-1 AI Tutor Button */}
            <button
              id="pdf-reader-ai-tutor-btn"
              type="button"
              onClick={() => handleAskTutor()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Bot className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Ask Ms Elevate AI</span>
              <span className="sm:hidden">AI Tutor</span>
            </button>

            {/* Close Modal */}
            <button
              id="close-pdf-reader-btn"
              type="button"
              onClick={onClose}
              className="p-2 text-blue-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECOND TOOLBAR: Mode Switchers, Zoom, Fullscreen & Views */}
        {/* ========================================================================= */}
        <div
          className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2.5 text-xs ${
            nightMode
              ? 'bg-slate-950 border-slate-800 text-slate-300'
              : 'bg-slate-100/90 border-slate-200 text-slate-700'
          }`}
        >
          {/* Question Paper vs Memo Tabs (for past papers) */}
          {paper ? (
            <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleTabChange('paper')}
                className={`px-3 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
                  activeTab === 'paper'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Question Paper</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('memo')}
                className={`px-3 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
                  activeTab === 'memo'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/50'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Marking Memorandum</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Learner Uploaded Document</span>
            </div>
          )}

          {/* Engine & Display controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Engine switcher: Embedded PDF document vs Interactive Exam Reader */}
            {paper && (
              <div className="hidden sm:flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setViewEngine('pdf')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewEngine === 'pdf' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'text-slate-600'
                  }`}
                  title="Official PDF document format"
                >
                  PDF Document View
                </button>
                <button
                  type="button"
                  onClick={() => setViewEngine('reader')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewEngine === 'reader' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'text-slate-600'
                  }`}
                  title="Interactive responsive exam text view"
                >
                  Interactive Reader
                </button>
              </div>
            )}

            {/* Zoom Controls (Active in Interactive Reader) */}
            {viewEngine === 'reader' && (
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => handleZoom(-10)}
                  disabled={zoomLevel <= 70}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-40"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] w-9 text-center font-bold">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => handleZoom(10)}
                  disabled={zoomLevel >= 180}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-40"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Night mode toggle */}
            <button
              type="button"
              onClick={() => setNightMode(!nightMode)}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
              title={nightMode ? 'Switch to Light Mode' : 'Switch to Night Study Mode'}
            >
              {nightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Optional Download button */}
            {paper && (
              <button
                type="button"
                onClick={() =>
                  activeTab === 'paper'
                    ? downloadQuestionPaperPDF(paper)
                    : downloadMemorandumPDF(paper)
                }
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 flex items-center gap-1 transition-colors"
                title="Download offline copy"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN VIEWER VIEWPORT */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {/* OPTION A: EMBEDDED REAL PDF VIEWER (Direct in-app reading without download) */}
          {viewEngine === 'pdf' && (
            <div className="w-full h-full flex flex-col bg-slate-800">
              {pdfBlobUrl ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`${pdfBlobUrl}#view=FitH&toolbar=1&navpanes=0`}
                    className="w-full h-full border-0 bg-white"
                    title={currentTitle}
                  />
                  {/* Floating quick action to switch to structured reader if needed */}
                  <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewEngine('reader')}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-950 text-white font-bold text-xs shadow-lg backdrop-blur-xs flex items-center gap-1.5 border border-slate-700 transition-transform active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Switch to Interactive Text Mode</span>
                    </button>
                  </div>
                </div>
              ) : uploadedPaper && uploadedPaper.fileType === 'image' ? (
                <div className="w-full h-full p-4 overflow-auto flex items-center justify-center bg-slate-900">
                  <img
                    src={uploadedPaper.dataUrl}
                    alt={uploadedPaper.fileName}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-700"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
                  <FileText className="w-12 h-12 text-slate-500 animate-pulse" />
                  <p className="text-sm font-semibold">Preparing In-App PDF Document Viewer...</p>
                  <button
                    type="button"
                    onClick={() => setViewEngine('reader')}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    Open Interactive Reader
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OPTION B: INTERACTIVE STRUCTURED CAPS EXAM READER */}
          {viewEngine === 'reader' && paper && (
            <div
              className={`flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 ${
                nightMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
              }`}
              style={{ fontSize: `${(zoomLevel / 100) * 14}px` }}
            >
              {/* Exam Cover summary */}
              <div
                className={`p-5 rounded-2xl border ${
                  activeTab === 'paper'
                    ? nightMode
                      ? 'bg-blue-950/40 border-blue-800'
                      : 'bg-blue-50/80 border-blue-200'
                    : nightMode
                    ? 'bg-emerald-950/40 border-emerald-800'
                    : 'bg-emerald-50/80 border-emerald-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-extrabold uppercase text-xs tracking-wider text-blue-700 dark:text-blue-300">
                    Republic of South Africa • CAPS Curriculum
                  </span>
                  <span className="font-bold text-xs">
                    Total: {paper.totalMarks} Marks ({paper.durationHours} Hours)
                  </span>
                </div>
                <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                  {paper.subject} • Paper {paper.paperNumber} ({paper.session})
                </h3>

                {activeTab === 'paper' && (
                  <div className="mt-3 text-xs space-y-1 text-slate-600 dark:text-slate-300 border-t pt-2 border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-slate-800 dark:text-slate-200">INSTRUCTIONS & INFORMATION:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {paper.instructions.map((inst, idx) => (
                        <li key={idx}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'memo' && (
                  <div className="mt-3 text-xs space-y-1 text-emerald-800 dark:text-emerald-300 border-t pt-2 border-emerald-200 dark:border-emerald-800">
                    <p className="font-bold">CAPS MARKING PRINCIPLES:</p>
                    <p>[M] = Method, [A] = Accuracy, [R] = Geometric / Conceptual Reason. Consistent accuracy (CA) applies to candidate working throughout.</p>
                  </div>
                )}
              </div>

              {/* Question Navigation Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2">
                <span className="text-xs font-bold text-slate-500 mr-1">Jump to Question:</span>
                {paper.questions.map((q, idx) => (
                  <button
                    key={q.number}
                    type="button"
                    onClick={() => {
                      setActiveQuestionIndex(idx);
                      const el = document.getElementById(`question-card-${q.number}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      activeQuestionIndex === idx
                        ? 'bg-blue-600 text-white shadow-xs'
                        : nightMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Q{q.number} ({q.marks}m)
                  </button>
                ))}
              </div>

              {/* Questions Stream */}
              <div className="space-y-6">
                {paper.questions.map((q, qIndex) => (
                  <div
                    key={q.number}
                    id={`question-card-${q.number}`}
                    className={`rounded-2xl p-5 border transition-all ${
                      nightMode
                        ? 'bg-slate-800/80 border-slate-700'
                        : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-xs">
                          QUESTION {q.number}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {q.topic}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400">
                          [{q.marks} MARKS]
                        </span>
                        {/* 1-on-1 Ask Tutor on this Question */}
                        <button
                          type="button"
                          onClick={() =>
                            handleAskTutor(
                              `Question ${q.number} (${q.topic}):\n${q.subQuestions.map((s) => `${s.label} ${s.questionText}`).join('\n')}`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs flex items-center gap-1 transition-colors"
                          title="Ask Ms Elevate to explain this question"
                        >
                          <Bot className="w-3.5 h-3.5 text-amber-700" />
                          <span>Explain Q{q.number}</span>
                        </button>
                      </div>
                    </div>

                    {q.instructions && (
                      <p className="text-xs italic text-slate-500 dark:text-slate-400 mt-2 mb-3">
                        {q.instructions}
                      </p>
                    )}

                    {/* Question Content vs Memo Solutions */}
                    {activeTab === 'paper' ? (
                      <div className="space-y-3 pt-3">
                        {q.subQuestions.map((sub) => (
                          <div
                            key={sub.label}
                            className="flex items-start justify-between gap-3 text-sm p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <span className="font-black text-slate-900 dark:text-slate-100 w-12 shrink-0">
                              {sub.label}
                            </span>
                            <div className="flex-1 text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                              {sub.questionText}
                            </div>
                            <span className="font-extrabold text-blue-700 dark:text-blue-400 shrink-0">
                              ({sub.marks})
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 pt-3">
                        {q.subQuestions.map((sub) => (
                          <div
                            key={sub.label}
                            className={`p-3.5 rounded-xl border space-y-2 ${
                              nightMode
                                ? 'bg-slate-900 border-slate-700'
                                : 'bg-emerald-50/30 border-emerald-100'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-black">
                              <span className="text-emerald-700 dark:text-emerald-400">
                                {sub.label} Marking Guideline & Steps
                              </span>
                              <span className="text-blue-700 dark:text-blue-400">
                                ({sub.marks} Marks)
                              </span>
                            </div>

                            <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed bg-white/60 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                              {sub.answerGuide}
                            </pre>

                            {sub.examTip && (
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5 pt-1">
                                <span>💡 CAPS Examiner Tip: {sub.examTip}</span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Formula sheet if present */}
              {paper.formulaSheet && paper.formulaSheet.length > 0 && (
                <div
                  className={`p-5 rounded-2xl border space-y-3 ${
                    nightMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase">
                    CAPS Examination Formulae & Information Sheet
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {paper.formulaSheet.map((sec, sIdx) => (
                      <div
                        key={sIdx}
                        className={`p-3 rounded-xl border ${
                          nightMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        <span className="font-extrabold text-blue-700 dark:text-blue-400 block mb-1">
                          {sec.sectionTitle}
                        </span>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                          {sec.formulas.map((f, fIdx) => (
                            <li key={fIdx} className="font-mono text-[11px]">
                              • {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FOOTER: Quick navigation & Tutor Launcher */}
        {/* ========================================================================= */}
        <div
          className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
            nightMode
              ? 'bg-slate-950 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>In-App Reading Mode Active (Zero Downloads Required)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => handleAskTutor()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Study with Ms Elevate AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
