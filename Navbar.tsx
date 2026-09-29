import React, { useState } from 'react';
import {
  Sparkles,
  Cloud,
  Wifi,
  WifiOff,
  Crown,
  Settings,
  LogOut,
  BookOpen,
  Users,
  User,
  ArrowRight,
  Menu,
  Search,
  FileText,
  Mic,
  GraduationCap,
  Zap,
  Star,
} from 'lucide-react';
import { UserProgress, GradeBand } from '../types';
import { GRADE_BANDS } from '../data/curriculum';
import { ElevateLogo } from './ElevateLogo';

export type AppTab = 'learn' | 'papers' | 'foundation' | 'groups' | 'profile';

interface NavbarProps {
  user: UserProgress;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedGradeBand: GradeBand;
  setSelectedGradeBand: (band: GradeBand) => void;
  dataSaver: boolean;
  setDataSaver: (val: boolean) => void;
  onOpenPayment: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onOpenDrawer: () => void;
  onAskAi: (query: string) => void;
  onOpenGradeSubjectModal?: () => void;
  onOpenPracticeMode?: (subjectId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  selectedGradeBand,
  setSelectedGradeBand,
  dataSaver,
  setDataSaver,
  onOpenPayment,
  onOpenAdmin,
  onLogout,
  onOpenDrawer,
  onAskAi,
  onOpenGradeSubjectModal,
  onOpenPracticeMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAskAi(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      {/* Top Royal Blue Micro Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold tracking-wide text-blue-100">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
              CAPS & IEB Aligned 2026 Curriculum
            </span>
            <span className="hidden sm:inline text-blue-300/60">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-blue-100">
              <Cloud className="w-3 h-3 text-emerald-300" />
              Your work is safe - saved in cloud
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Data Saver Mode Toggle */}
            <button
              id="data-saver-toggle"
              onClick={() => setDataSaver(!dataSaver)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                dataSaver
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title="Toggle Data-less mode (5MB/day text-only)"
            >
              {dataSaver ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span>{dataSaver ? 'Data Saver ON (5MB/day)' : 'Data Saver: Normal'}</span>
            </button>

            {/* Admin trigger button */}
            <button
              id="admin-settings-btn"
              onClick={onOpenAdmin}
              className="p-1 text-blue-200 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Admin Settings (OpenAI, Yoco, Paystack & Absa Keys)"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Row matching Screenshot 1 */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Hamburger menu + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="mobile-drawer-toggle"
            onClick={onOpenDrawer}
            className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
            title="Open Menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div
            onClick={() => setActiveTab('learn')}
            className="cursor-pointer group flex items-center"
          >
            <ElevateLogo size="sm" showText={true} />
          </div>

          {/* Grade Band & Chosen Subjects Selector */}
          <div className="hidden lg:flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
            <select
              id="grade-band-selector"
              value={selectedGradeBand}
              onChange={(e) => setSelectedGradeBand(e.target.value as GradeBand)}
              className="text-xs font-semibold text-slate-700 bg-blue-50/70 border border-blue-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {GRADE_BANDS.map((g) => (
                <option key={g.band} value={g.band}>
                  {g.band} ({g.phase})
                </option>
              ))}
            </select>

            {onOpenGradeSubjectModal && (
              <button
                type="button"
                id="nav-grade-subjects-btn"
                onClick={onOpenGradeSubjectModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                title="Choose your Grade & CAPS Subjects"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>{user.grade}</span>
                <span className="px-1.5 py-0.2 bg-blue-200/70 rounded text-[10px] font-black">
                  {(user.selectedSubjects || []).length} Subs
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Search Bar matching Screenshot 1: "Ask your AI teacher..." */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md hidden md:flex items-center relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Ask your AI teacher... (e.g., Explain Newton's laws)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 transition-colors"
          />
          {searchQuery && (
            <button
              type="submit"
              className="absolute right-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-colors"
            >
              Ask
            </button>
          )}
        </form>

        {/* Center/Right Tabs for larger screens */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-1.5">
          <button
            id="tab-learn"
            onClick={() => setActiveTab('learn')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'learn'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Lessons</span>
          </button>

          {/* Practice Mode with Difficulty Levels */}
          {onOpenPracticeMode && (
            <button
              id="tab-practice"
              type="button"
              onClick={() => onOpenPracticeMode()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 shadow-xs cursor-pointer"
              title="Practice chosen subjects with 3 difficulty levels and earn mastery stars"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Practice Mode</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
            </button>
          )}

          {/* Foundation Phase Phonics & Reading Assistant */}
          <button
            id="tab-foundation"
            onClick={() => setActiveTab('foundation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'foundation'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'text-orange-700 hover:text-orange-800 hover:bg-orange-50'
            }`}
            title="Grade R-3 Phonics, AI Reading Voice Coach & Early Math Studio"
          >
            <Mic className="w-4 h-4 text-amber-500" />
            <span>Gr R-3 Phonics</span>
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full">
              AI
            </span>
          </button>

          <button
            id="tab-papers"
            onClick={() => setActiveTab('papers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'papers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
            title="Download PDF past papers & memorandums, upload papers for 1-on-1 AI tutoring"
          >
            <FileText className="w-4 h-4" />
            <span>Past Papers (PDF)</span>
          </button>

          <button
            id="tab-groups"
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'groups'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Study Squads</span>
          </button>
        </nav>

        {/* Right Actions: Upgrade Pill + Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user.isPremium ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold shadow-xs">
              <Crown className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Premium Active</span>
            </div>
          ) : (
            <button
              id="upgrade-r50-btn"
              onClick={onOpenPayment}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 hover:shadow-md transition-all group"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>R50/mo</span>
            </button>
          )}

          {/* User Profile Avatar matching Screenshot 1 */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-600 ring-2 ring-blue-100 hover:opacity-90 transition-opacity bg-blue-100 flex items-center justify-center text-blue-700"
              title={`${user.fullName} (${user.grade})`}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>

            <button
              id="logout-btn"
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
