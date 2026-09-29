import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Bot,
  Search,
  Filter,
  Eye,
  X,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Clock,
  Award,
  ChevronRight,
  Maximize2,
  BookOpen,
} from 'lucide-react';
import { UserProgress, PastPaper, UploadedPaper } from '../types';
import { PAST_PAPERS } from '../data/pastPapers';
import { downloadQuestionPaperPDF, downloadMemorandumPDF } from '../utils/pdfGenerator';
import { PDFReaderModal } from './PDFReaderModal';

interface PastPapersViewProps {
  user: UserProgress;
  onOpenPayment: () => void;
  onStartTutorOnPaper: (paper: {
    name: string;
    type: 'pdf' | 'image';
    dataUrl?: string;
    subject?: string;
    grade?: string;
    extractedText?: string;
  }) => void;
}

export const PastPapersView: React.FC<PastPapersViewProps> = ({
  user,
  onOpenPayment,
  onStartTutorOnPaper,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [uploadedPapers, setUploadedPapers] = useState<UploadedPaper[]>([]);
  const [latestUploaded, setLatestUploaded] = useState<UploadedPaper | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // In-app PDF Reader modal states
  const [readerPaper, setReaderPaper] = useState<PastPaper | null>(null);
  const [readerUploadedPaper, setReaderUploadedPaper] = useState<UploadedPaper | null>(null);
  const [readerMode, setReaderMode] = useState<'paper' | 'memo'>('paper');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Subjects for filter pills
  const subjects = ['All', 'Mathematics', 'Physical Sciences', 'Life Sciences'];

  // Filter papers
  const filteredPapers = PAST_PAPERS.filter((paper) => {
    const matchSubject = selectedSubject === 'All' || paper.subject === selectedSubject;
    const matchSession = selectedSession === 'All' || paper.session.includes(selectedSession);
    const matchQuery =
      searchQuery === '' ||
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSession && matchQuery;
  });

  const handleFileUpload = (file: File) => {
    setUploadError(null);

    // Validate type: PDF or Images
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage =
      file.type.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);

    if (!isPdf && !isImage) {
      setUploadError('Please upload a PDF question paper or a photo (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds 25MB limit. Please compress or take a clearer photo.');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      // Extract subject hint from filename if available
      let inferredSubject = 'General CAPS Question Paper';
      const lower = file.name.toLowerCase();
      if (lower.includes('math')) inferredSubject = 'Mathematics';
      else if (lower.includes('phys') || lower.includes('chem') || lower.includes('sci')) inferredSubject = 'Physical Sciences';
      else if (lower.includes('life') || lower.includes('bio')) inferredSubject = 'Life Sciences';
      else if (lower.includes('acc')) inferredSubject = 'Accounting';
      else if (lower.includes('eng')) inferredSubject = 'English FAL / HL';

      const newUpload: UploadedPaper = {
        id: `upload-${Date.now()}`,
        fileName: file.name,
        fileType: isPdf ? 'pdf' : 'image',
        fileSize: file.size,
        dataUrl,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: inferredSubject,
        grade: user.grade,
      };

      setUploadedPapers((prev) => [newUpload, ...prev]);
      setLatestUploaded(newUpload);
      setIsUploading(false);
    };

    reader.onerror = () => {
      setUploadError('Failed to read the file. Please try again.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const startTutorOnUploaded = (paper: UploadedPaper) => {
    onStartTutorOnPaper({
      name: paper.fileName,
      type: paper.fileType,
      dataUrl: paper.dataUrl,
      subject: paper.subject,
      grade: paper.grade,
    });
  };

  const startTutorOnPastPaper = (paper: PastPaper) => {
    onStartTutorOnPaper({
      name: paper.title,
      type: 'pdf',
      subject: paper.subject,
      grade: paper.grade,
      extractedText: `Questions in this paper: ${paper.questions.map((q) => `${q.number} (${q.topic}): ${q.subQuestions.map((s) => s.questionText).join(' ')}`).join('\n')}`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-blue-700/50">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-700/60 border border-blue-400/30 text-amber-300 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Official DBE & IEB Past Papers + 1-on-1 AI Tutoring</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Past Papers & Memorandums (PDF Downloads)
          </h2>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Download printable CAPS examination question papers with step-by-step marking memos.
            Upload your own question paper or snap a photo to get <strong>instant one-on-one AI live tutoring</strong> with Ms Elevate!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-blue-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Real PDF format download
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Complete worked marking memos
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Photo / PDF upload for 1-on-1 live tutoring
            </span>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: UPLOAD QUESTION PAPER OR PHOTO (Prompt Requirement) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Upload Question Paper or Photo
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Upload any PDF exam paper, test, or snap a photo of homework for 1-on-1 live AI tutoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-2 border border-blue-200 transition-colors"
              title="Take a photo with camera"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Camera Photo</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Upload PDF / Image</span>
            </button>
          </div>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/heic"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        {/* Drag and Drop Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isUploading
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50/30 bg-slate-50/60'
          }`}
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center mb-3">
            {isUploading ? (
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7 text-blue-600" />
            )}
          </div>

          <h4 className="text-sm sm:text-base font-bold text-slate-800">
            {isUploading ? 'Processing your question paper...' : 'Drop your PDF question paper or photo here'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Supports PDF exam papers, test photocopies, or clear photos taken with your phone. Max 25MB.
          </p>
        </div>

        {uploadError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONE-ON-ONE AI LIVE TUTOR PROMPT AFTER UPLOAD (Prompt Requirement) */}
        {/* ========================================================================= */}
        {latestUploaded && (
          <div
            id="uploaded-tutor-banner"
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-2 border-blue-300 shadow-sm animate-in slide-in-from-top-3 duration-250 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3">
              {latestUploaded.fileType === 'image' ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-blue-200 bg-slate-100 shrink-0">
                  <img
                    src={latestUploaded.dataUrl}
                    alt="Paper photo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase">PDF</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Uploaded Successfully
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {formatFileSize(latestUploaded.fileSize)} • {latestUploaded.uploadedAt}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-0.5 truncate max-w-sm sm:max-w-md">
                  {latestUploaded.fileName}
                </h4>
                <p className="text-xs text-blue-800 font-semibold mt-0.5">
                  Ready for One-on-One Live AI Tutoring with Ms Elevate!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  setReaderUploadedPaper(latestUploaded);
                  setReaderPaper(null);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors"
                title="Read and view document in app"
              >
                <BookOpen className="w-4 h-4 text-blue-700" />
                <span>Read in App</span>
              </button>

              <button
                id="start-one-on-one-tutor-btn"
                type="button"
                onClick={() => startTutorOnUploaded(latestUploaded)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Bot className="w-4 h-4 text-amber-300" />
                <span>Start 1-on-1 AI Tutor</span>
              </button>

              <button
                type="button"
                onClick={() => setLatestUploaded(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Uploaded History List if user uploaded previous papers */}
        {uploadedPapers.length > 1 && (
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Recently Uploaded Papers ({uploadedPapers.length})
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {uploadedPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {paper.fileType === 'image' ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                        <img src={paper.dataUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{paper.fileName}</p>
                      <span className="text-[10px] text-slate-500">{formatFileSize(paper.fileSize)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setReaderUploadedPaper(paper);
                        setReaderPaper(null);
                      }}
                      className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center gap-1"
                      title="Read document in app"
                    >
                      <BookOpen className="w-3 h-3 text-blue-600" />
                      <span>Read</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startTutorOnUploaded(paper)}
                      className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1"
                      title="1-on-1 Tutor with Ms Elevate"
                    >
                      <Bot className="w-3 h-3" />
                      <span>Tutor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: OFFICIAL PAST EXAM PAPERS & MEMOS (PDF DOWNLOADS) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Controls & Search */}
        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {subjects.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedSubject === sub
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search past papers, calculus, physics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Paper metadata header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-blue-100 text-blue-800 border border-blue-200">
                    {paper.examBoard} • {paper.session}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {paper.durationHours}h
                    </span>
                    <span>•</span>
                    <span className="text-blue-700 font-bold">{paper.totalMarks} Marks</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-950 leading-snug">
                  {paper.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {paper.description}
                </p>

                {/* Topics Covered */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {paper.questions.map((q) => (
                    <span
                      key={q.number}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                    >
                      {q.number}: {q.topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Read in App without downloading + 1-on-1 Tutor + Download */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {/* PRIMARY ROW: In-App PDF Reading directly in browser without downloading */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReaderPaper(paper);
                      setReaderMode('paper');
                      setReaderUploadedPaper(null);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs shadow-blue-500/20 active:scale-95 transition-all"
                    title="Read official question paper directly inside the app without downloading"
                  >
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    <span>Read Paper (In-App)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReaderPaper(paper);
                      setReaderMode('memo');
                      setReaderUploadedPaper(null);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs shadow-emerald-500/20 active:scale-95 transition-all"
                    title="Read official marking guideline memo directly inside the app without downloading"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-200" />
                    <span>Read Memo (In-App)</span>
                  </button>
                </div>

                {/* SECONDARY ROW: 1-on-1 AI Tutor + Download fallback */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => startTutorOnPastPaper(paper)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                    title="Start one-on-one live AI tutoring on this past paper"
                  >
                    <Bot className="w-3.5 h-3.5 text-slate-950" />
                    <span>1-on-1 AI Tutor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadQuestionPaperPDF(paper)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    title="Download offline copy of question paper PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* IN-APP PDF READER MODAL (ZERO DOWNLOADS REQUIRED) */}
      {/* ========================================================================= */}
      <PDFReaderModal
        isOpen={Boolean(readerPaper || readerUploadedPaper)}
        paper={readerPaper}
        uploadedPaper={readerUploadedPaper}
        initialMode={readerMode}
        onClose={() => {
          setReaderPaper(null);
          setReaderUploadedPaper(null);
        }}
        onStartTutorOnPaper={onStartTutorOnPaper}
      />
    </div>
  );
};
