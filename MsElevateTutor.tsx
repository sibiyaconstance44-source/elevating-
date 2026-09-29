import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  Lock,
  Crown,
  Globe,
  X,
  ChevronDown,
  GraduationCap,
  Lightbulb,
  CheckCircle,
  Mic,
  MicOff,
  AlertCircle,
  Paperclip,
  Camera,
  FileText,
  Image as ImageIcon,
  Bot,
} from 'lucide-react';
import { UserProgress, SouthAfricanLanguage, ChatMessage, Lesson } from '../types';

export interface ActivePaperContext {
  name: string;
  type: 'pdf' | 'image';
  dataUrl?: string;
  subject?: string;
  grade?: string;
  extractedText?: string;
}

interface MsElevateTutorProps {
  user: UserProgress;
  activeLesson?: Lesson;
  attachedPaper?: ActivePaperContext | null;
  onClearAttachedPaper?: () => void;
  onAttachPaper?: (paper: ActivePaperContext) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment: () => void;
  onUpdateUserChats: (newCount: number) => void;
}

export const MsElevateTutor: React.FC<MsElevateTutorProps> = ({
  user,
  activeLesson,
  attachedPaper,
  onClearAttachedPaper,
  onAttachPaper,
  isOpen,
  onClose,
  onOpenPayment,
  onUpdateUserChats,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedLang, setSelectedLang] = useState<SouthAfricanLanguage>('en');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef<string>('');
  const tutorFileInputRef = useRef<HTMLInputElement>(null);
  const tutorCameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize greeting on open
  useEffect(() => {
    if (messages.length === 0) {
      const greetingText = attachedPaper
        ? `Sawubona ${user.fullName.split(' ')[0]}! I'm Ms Elevate, your personal CAPS live tutor. I have loaded your uploaded question paper "${attachedPaper.name}" for our one-on-one live tutor session! Which question would you like us to solve together first?`
        : activeLesson
        ? `Sawubona ${user.fullName.split(' ')[0]}! I'm Ms Elevate, your South African CAPS teacher. We're currently studying "${activeLesson.title}". Remember, I won't hand you direct exam answers—we work through every step together so you ace your tests. What step can I help you understand?`
        : `Sawubona ${user.fullName.split(' ')[0]}! I'm Ms Elevate, your personal CAPS live tutor. Tell me what subject or topic you want to elevate today, or upload a question paper for 1-on-1 live tutoring!`;

      setMessages([
        {
          id: 'welcome-msg',
          sender: 'tutor',
          text: greetingText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [activeLesson, attachedPaper, user.fullName]);

  // When attachedPaper changes while tutor is open, announce it
  useEffect(() => {
    if (attachedPaper && messages.length > 0) {
      const alreadyAnnounced = messages.some(
        (m) => m.sender === 'tutor' && m.text.includes(attachedPaper.name)
      );
      if (!alreadyAnnounced) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'paper-attached-' + Date.now(),
            sender: 'tutor',
            text: `Sawubona ${user.fullName.split(' ')[0]}! 📄 I've loaded your question paper "${attachedPaper.name}" for our 1-on-1 AI live tutoring session! Which question number or topic shall we break down first?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [attachedPaper, messages, user.fullName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleInTutorFileUpload = (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage =
      file.type.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);

    if (!isPdf && !isImage) {
      setSpeechError('Please upload a PDF question paper or a photo (JPG, PNG).');
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newPaper: ActivePaperContext = {
        name: file.name,
        type: isPdf ? 'pdf' : 'image',
        dataUrl,
        grade: user.grade,
      };

      if (onAttachPaper) {
        onAttachPaper(newPaper);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'user-paper-up-' + Date.now(),
          sender: 'user',
          text: `[Uploaded question paper: ${file.name}]`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: 'tutor-paper-conf-' + Date.now(),
          sender: 'tutor',
          text: `Excellent! I've loaded your uploaded question paper "${file.name}". Let's start our one-on-one live tutor session! Which question number or problem would you like to begin with?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    };

    reader.readAsDataURL(file);
  };

  // Clean up speech synthesis and speech recognition
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (loading || (!user.isPremium && user.dailyChatsCount >= 3)) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        'Voice speech recognition is not supported in this browser. Try opening Elevate in Google Chrome or Microsoft Edge!'
      );
      setTimeout(() => setSpeechError(null), 6000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Locale mapping for South African learners
      const langMap: Record<SouthAfricanLanguage, string> = {
        en: 'en-ZA',
        zu: 'zu-ZA',
        xh: 'xh-ZA',
        st: 'st-ZA',
        tn: 'tn-ZA',
      };
      recognition.lang = langMap[selectedLang] || 'en-ZA';

      baseInputRef.current = input;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        const base = baseInputRef.current ? baseInputRef.current.trim() + ' ' : '';
        setInput(`${base}${transcript}`.trimStart());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError(
            'Microphone access blocked. Please allow microphone permissions in your browser address bar to speak to Ms Elevate.'
          );
        } else if (event.error === 'no-speech') {
          // Silent or benign timeout
        } else {
          setSpeechError(`Microphone notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError('Could not start microphone. Please verify browser permissions.');
      setIsListening(false);
    }
  };

  const handleLanguageSelect = (lang: SouthAfricanLanguage) => {
    if (lang !== 'en' && !user.isPremium) {
      // Prompt user to upgrade for SA languages
      setMessages((prev) => [
        ...prev,
        {
          id: 'lang-lock-' + Date.now(),
          sender: 'tutor',
          text: 'Sawubona! Explanations in isiZulu, Sesotho, Setswana, and isiXhosa are exclusive to Elevate Premium scholars. Unlock SA languages with Premium R50!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }
    setSelectedLang(lang);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    // Check free chat limit
    if (!user.isPremium && user.dailyChatsCount >= 3) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'limit-' + Date.now(),
          sender: 'tutor',
          text: "You've reached your 3 free chats with Ms Elevate today! Upgrade to Premium for R50/month to get unlimited 24/7 AI tutoring.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: selectedLang,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const newChatCount = user.dailyChatsCount + 1;
    onUpdateUserChats(newChatCount);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          grade: user.grade,
          subject: attachedPaper?.subject || activeLesson?.subjectName || 'CAPS General',
          lessonTitle: attachedPaper ? `Uploaded Exam Paper: ${attachedPaper.name}` : activeLesson?.title || '',
          isPremium: user.isPremium,
          language: selectedLang,
          userChatsToday: user.dailyChatsCount,
          paperName: attachedPaper?.name,
          paperContext: attachedPaper?.extractedText || (attachedPaper ? `Format: ${attachedPaper.type}, Subject: ${attachedPaper.subject || 'General CAPS'}` : undefined),
          paperImage: attachedPaper?.type === 'image' ? attachedPaper.dataUrl : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const tutorReply: ChatMessage = {
          id: 'tutor-' + Date.now(),
          sender: 'tutor',
          text: data.reply || 'Let us examine the problem carefully. What is your initial hypothesis?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language: selectedLang,
        };
        setMessages((prev) => [...prev, tutorReply]);
      } else {
        throw new Error('Tutor server error');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'tutor-err-' + Date.now(),
          sender: 'tutor',
          text: "I'm right here with you! Let's review the CAPS lesson example step-by-step. What is the first formula given in your notes?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Browser TTS Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Gentle teacher cadence
    utterance.pitch = 1.05;

    // Try finding South African or British English voice
    const voices = window.speechSynthesis.getVoices();
    const zaVoice = voices.find((v) => v.lang.includes('en-ZA')) || voices.find((v) => v.lang.includes('en-GB')) || voices[0];
    if (zaVoice) {
      utterance.voice = zaVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[620px] z-50 flex flex-col bg-white sm:rounded-3xl shadow-2xl border border-blue-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Header with Ms Elevate persona */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 bg-blue-200">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                alt="Ms Elevate"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Green Online Dot + Pulse */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow-xs" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-base tracking-tight leading-tight">Ms Elevate</h3>
              <span className="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                CAPS Live Tutor
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-100">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span>Online Now • Step-by-Step Mentor</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-blue-100 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Language Selector bar */}
      <div className="bg-blue-50/90 border-b border-blue-100 px-3 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-600 font-semibold">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>Language:</span>
        </div>

        <div className="flex items-center gap-1">
          {(
            [
              { code: 'en', label: 'English' },
              { code: 'zu', label: 'isiZulu' },
              { code: 'st', label: 'Sesotho' },
              { code: 'tn', label: 'Setswana' },
              { code: 'xh', label: 'isiXhosa' },
            ] as const
          ).map((lang) => {
            const isLocked = lang.code !== 'en' && !user.isPremium;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors flex items-center gap-1 ${
                  selectedLang === lang.code
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-blue-100'
                }`}
                title={isLocked ? 'Unlock SA languages with Premium R50' : lang.label}
              >
                <span>{lang.label}</span>
                {isLocked && <Lock className="w-2.5 h-2.5 text-blue-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Free Tier Chat Quota Indicator */}
      {!user.isPremium && (
        <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-100 flex items-center justify-between text-[11px] text-amber-900">
          <span>
            Daily Free Chats: <strong>{Math.max(0, 3 - user.dailyChatsCount)} of 3 left</strong>
          </span>
          <button
            onClick={onOpenPayment}
            className="font-bold text-blue-700 hover:underline flex items-center gap-1"
          >
            <Crown className="w-3 h-3 text-amber-600" />
            <span>Unlock Unlimited R50</span>
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages.map((msg) => {
          const isTutor = msg.sender === 'tutor';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                  isTutor
                    ? 'bg-white border border-blue-100 text-slate-800 shadow-xs'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Tutor Audio Read-aloud button */}
                {isTutor && (
                  <div className="mt-2 pt-2 border-t border-blue-50 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => speakText(msg.text)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-blue-50 text-blue-600 font-semibold transition-colors"
                      title="Read answer aloud with text-to-speech"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-500" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen (TTS)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live typing animation with green dot */}
        {loading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Sparkles className="w-3 h-3 animate-spin" />
            </div>
            <div className="bg-white border border-blue-100 rounded-2xl px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Ms Elevate is typing guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Attached Question Paper Banner */}
      {attachedPaper && (
        <div className="px-3 py-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-t border-b border-blue-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {attachedPaper.type === 'image' && attachedPaper.dataUrl ? (
              <img
                src={attachedPaper.dataUrl}
                alt="Paper snapshot"
                className="w-8 h-8 rounded-lg object-cover border border-blue-300 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-blue-950 truncate max-w-[170px] sm:max-w-xs">
                  {attachedPaper.name}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 flex items-center gap-0.5">
                  <Bot className="w-2.5 h-2.5 text-emerald-700" />
                  1-on-1 Live Tutor
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                Ms Elevate is guiding you step-by-step on this question paper
              </p>
            </div>
          </div>

          {onClearAttachedPaper && (
            <button
              type="button"
              onClick={onClearAttachedPaper}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md shrink-0"
              title="Detach paper"
              aria-label="Detach paper"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Suggested Quick Prompts */}
      <div className="p-2 bg-white border-t border-blue-50 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        {attachedPaper ? (
          <>
            <button
              onClick={() => handleSend("Let's break down Question 1 step-by-step.")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 font-semibold border border-blue-300"
            >
              Solve Question 1
            </button>
            <button
              onClick={() => handleSend("What CAPS formula or theorem is required for this problem?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium border border-blue-200"
            >
              Formula needed
            </button>
            <button
              onClick={() => handleSend("Can you check my step 1 calculation and tell me if I'm on track?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium border border-blue-200"
            >
              Check my calculation
            </button>
            <button
              onClick={() => handleSend("What common mistakes do students make on this question?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium border border-blue-200"
            >
              Exam traps
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleSend("Can you explain step 1 of this topic?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium border border-blue-200"
            >
              Explain step 1
            </button>
            <button
              onClick={() => handleSend("What are common mistakes learners make on this exam question?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium border border-blue-200"
            >
              Exam pitfalls
            </button>
            <button
              onClick={() => handleSend("Can you give me an easy memory trick or mnemonic for this?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium border border-blue-200"
            >
              Memory trick
            </button>
          </>
        )}
      </div>

      {/* Listening Status Banner for younger learners */}
      {isListening && (
        <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100 flex items-center justify-between text-xs text-blue-900 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">
              Listening to your voice... Speak clearly to Ms Elevate!
            </span>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
          >
            <MicOff className="w-3 h-3" />
            <span>Done</span>
          </button>
        </div>
      )}

      {/* Speech error or permission reminder banner */}
      {speechError && (
        <div className="px-3 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] leading-tight">{speechError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
            title="Dismiss notification"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Hidden File and Camera Inputs */}
      <input
        ref={tutorFileInputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleInTutorFileUpload(e.target.files[0]);
          }
        }}
      />
      <input
        ref={tutorCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleInTutorFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Input area */}
      <div className="p-3 bg-white border-t border-blue-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Upload Paper / Photo Button */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              id="tutor-upload-paper-btn"
              type="button"
              onClick={() => tutorFileInputRef.current?.click()}
              disabled={loading || (!user.isPremium && user.dailyChatsCount >= 3)}
              title="Upload question paper PDF or photo"
              aria-label="Upload question paper PDF or photo"
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-all active:scale-95 disabled:opacity-40"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              id="tutor-camera-photo-btn"
              type="button"
              onClick={() => tutorCameraInputRef.current?.click()}
              disabled={loading || (!user.isPremium && user.dailyChatsCount >= 3)}
              title="Snap photo of question paper with camera"
              aria-label="Snap photo with camera"
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-all active:scale-95 disabled:opacity-40 hidden sm:flex items-center justify-center"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <input
            id="tutor-chat-input"
            type="text"
            placeholder={
              !user.isPremium && user.dailyChatsCount >= 3
                ? 'Daily limit reached. Unlock R50 for unlimited...'
                : isListening
                ? 'Listening to you... Speak now'
                : attachedPaper
                ? `Ask Ms Elevate about ${attachedPaper.name}...`
                : 'Ask Ms Elevate for step-by-step guidance...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || (!user.isPremium && user.dailyChatsCount >= 3)}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-colors ${
              isListening
                ? 'border-blue-400 ring-2 ring-blue-200 bg-blue-50/40 text-blue-900 font-medium'
                : 'border-slate-200'
            }`}
          />

          {/* Microphone Speech-to-Text Button for Younger Learners */}
          <button
            id="tutor-mic-btn"
            type="button"
            onClick={toggleListening}
            disabled={loading || (!user.isPremium && user.dailyChatsCount >= 3)}
            title={
              isListening
                ? 'Listening now - tap to stop speaking'
                : 'Speak to Ms Elevate (Microphone voice typing)'
            }
            aria-label={isListening ? 'Stop microphone voice input' : 'Start microphone speech-to-text'}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/30 ring-2 ring-rose-300 animate-pulse'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border-blue-200'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          <button
            id="tutor-send-btn"
            type="submit"
            disabled={!input.trim() || loading || (!user.isPremium && user.dailyChatsCount >= 3)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white shadow-xs transition-transform active:scale-95 shrink-0"
            title="Send question to Ms Elevate"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
