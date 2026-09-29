import React, { useState, useEffect } from 'react';
import { Sparkles, X, Crown, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { UserProgress } from '../types';

interface BottomAdBannerProps {
  user: UserProgress;
  onOpenPayment: () => void;
}

interface AdItem {
  id: string;
  sponsor: string;
  headline: string;
  subtext: string;
  ctaText: string;
  badge: string;
  actionType: 'premium' | 'external';
  externalUrl?: string;
  bgGradient: string;
  textColor: string;
}

const SPONSOR_ADS: AdItem[] = [
  {
    id: 'ad-elevate-premium',
    sponsor: 'Elevate Academic',
    headline: 'Ace Your Matric & CAPS Exams: Unlimited 1-on-1 AI Live Tutor',
    subtext: 'Get unlimited voice tutoring, all past papers & memos, and isiZulu/Sesotho explanations for R50/mo.',
    ctaText: 'Upgrade for R50',
    badge: 'Special Offer',
    actionType: 'premium',
    bgGradient: 'from-blue-900 via-indigo-950 to-blue-900',
    textColor: 'text-white',
  },
  {
    id: 'ad-vodacom-data',
    sponsor: 'Vodacom e-School Partner',
    headline: 'Zero-Rated Educational Browsing for South African Scholars',
    subtext: 'Vodacom SIM cards access Elevate past papers & curriculum without eating into your daytime airtime bundle.',
    ctaText: 'Data Saver Active',
    badge: 'Zero-Rated',
    actionType: 'external',
    bgGradient: 'from-red-950 via-slate-900 to-rose-950',
    textColor: 'text-white',
  },
  {
    id: 'ad-mtn-pulse',
    sponsor: 'MTN Pulse Academic',
    headline: '10GB Student Night Owl & Study Bundles from R29',
    subtext: 'Stream step-by-step video solutions and download complete past question paper memos with high-speed data.',
    ctaText: 'Learn More',
    badge: 'Student Deal',
    actionType: 'external',
    bgGradient: 'from-amber-950 via-slate-900 to-yellow-950',
    textColor: 'text-white',
  },
];

export const BottomAdBanner: React.FC<BottomAdBannerProps> = ({ user, onOpenPayment }) => {
  // Free users see bottom-only ads; premium users see none
  const [isVisible, setIsVisible] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  const [dismissedUntil, setDismissedUntil] = useState<number>(0);

  useEffect(() => {
    if (user.isPremium) {
      setIsVisible(false);
      return;
    }

    // Pop smoothly at the bottom after 4 seconds of learning, and never full screen
    const timer = setTimeout(() => {
      const now = Date.now();
      if (now > dismissedUntil) {
        setIsVisible(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [user.isPremium, dismissedUntil]);

  // Periodic subtle rotation of bottom ad every 30 seconds
  useEffect(() => {
    if (!isVisible || user.isPremium) return;

    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % SPONSOR_ADS.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [isVisible, user.isPremium]);

  if (!isVisible || user.isPremium) {
    return null;
  }

  const currentAd = SPONSOR_ADS[adIndex];

  const handleDismiss = () => {
    setIsVisible(false);
    // Snooze bottom ad for 2 minutes before re-popping politely at the bottom
    setDismissedUntil(Date.now() + 120000);
  };

  const handleCta = () => {
    if (currentAd.actionType === 'premium') {
      onOpenPayment();
    } else {
      // Toggle to next sponsor
      setAdIndex((prev) => (prev + 1) % SPONSOR_ADS.length);
    }
  };

  return (
    <div
      id="bottom-docked-ad"
      role="complementary"
      aria-label="Sponsored notification"
      className="fixed bottom-0 inset-x-0 z-30 pointer-events-auto select-none transition-all duration-300 ease-out"
    >
      {/* Sleek bottom docked bar - strictly bottom only, never full-screen */}
      <div
        className={`w-full bg-gradient-to-r ${currentAd.bgGradient} border-t-2 border-amber-400/80 shadow-2xl px-3.5 py-2.5 sm:py-3 text-white backdrop-blur-md`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
          {/* Left: Sponsor & Tagline */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-amber-400 text-slate-950 shadow-xs">
                AD
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-blue-200 border border-white/10 hidden sm:inline-flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-300" />
                {currentAd.badge}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-blue-200 tracking-wide uppercase truncate">
                  {currentAd.sponsor}
                </span>
                <span className="text-white/40 text-xs hidden md:inline">•</span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {currentAd.headline}
                </h4>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1 hidden md:block">
                {currentAd.subtext}
              </p>
            </div>
          </div>

          {/* Right: Actions & Close */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
            <p className="text-[10px] text-slate-400 sm:hidden truncate">
              {currentAd.subtext}
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="bottom-ad-cta-btn"
                type="button"
                onClick={handleCta}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                {currentAd.actionType === 'premium' ? (
                  <Crown className="w-3.5 h-3.5 text-slate-900" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                )}
                <span>{currentAd.ctaText}</span>
              </button>

              <button
                id="bottom-ad-dismiss-btn"
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Dismiss ad (Ads only pop at the bottom of the screen)"
                aria-label="Dismiss bottom ad"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
