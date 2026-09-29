import React, { useState } from 'react';
import { Phone, Lock, User, Cloud, Sparkles, GraduationCap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserProgress } from '../types';
import { StorageService } from '../services/storage';
import { ElevateLogo } from './ElevateLogo';

interface AuthModalProps {
  isOpen: boolean;
  onAuthenticated: (user: UserProgress) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onAuthenticated }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('Grade 12');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setError('Please provide a valid South African mobile number (e.g. 082 123 4567)');
      return;
    }
    if (!pin || pin.length < 4) {
      setError('Please enter a secure password or 4-digit PIN');
      return;
    }
    if (isSignUp && !fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const user = await StorageService.loginServer(
        phoneNumber.trim(),
        pin,
        fullName.trim() || 'SA Learner',
        grade
      );
      onAuthenticated(user);
    } catch (err: any) {
      setError('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const mockPhone = '082' + Math.floor(1000000 + Math.random() * 9000000);
      const user = await StorageService.loginServer(
        mockPhone,
        'google_oauth_token',
        'Naledi Zulu (Google)',
        grade
      );
      onAuthenticated(user);
    } catch (err) {
      setError('Google sign-in error. Try phone login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-blue-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Background glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700" />
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-100 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <ElevateLogo size="xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {isSignUp ? 'Welcome to Elevate' : 'Welcome Back to Elevate'}
          </h2>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">
            "Elevating Young Minds" • South Africa
          </p>
          <p className="text-xs text-slate-500 mt-2">
            No guest mode — login is required so your completed lessons, quiz scores, and notes are always preserved.
          </p>
        </div>

        {/* Cloud Safe Reassurance Badge */}
        <div className="mb-5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-2.5 text-xs text-blue-950">
          <Cloud className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            <strong>Your work is safe - saved in cloud.</strong> When you log in on another phone or tablet, all progress comes back instantly.
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="auth-name-input"
                  type="text"
                  placeholder="e.g. Sipho Ndlovu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              SA Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="auth-phone-input"
                type="tel"
                placeholder="082 123 4567 or +27821234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isSignUp ? 'Choose Password / PIN' : 'Password / PIN'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="auth-pin-input"
                type="password"
                placeholder="••••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Grade
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                id="auth-grade-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <optgroup label="FET Phase & Matric (NSC & IEB)">
                  <option value="Grade 12">Grade 12 (Matric)</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 10">Grade 10</option>
                </optgroup>
                <optgroup label="Senior Phase">
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 7">Grade 7</option>
                </optgroup>
                <optgroup label="Intermediate Phase">
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 4">Grade 4</option>
                </optgroup>
                <optgroup label="Foundation Phase">
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade R">Grade R</option>
                </optgroup>
              </select>
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting to Cloud...
              </span>
            ) : (
              <span>{isSignUp ? 'Start Learning with Cloud Save' : 'Log In & Restore My Work'}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth button */}
        <button
          id="google-auth-btn"
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-2 px-3 border border-slate-200 hover:border-blue-300 rounded-xl bg-white hover:bg-blue-50/50 text-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google Account</span>
        </button>

        {/* Toggle sign up / sign in */}
        <div className="text-center mt-5">
          <button
            id="toggle-auth-mode-btn"
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
          >
            {isSignUp
              ? 'Already have an account? Log In'
              : "Don't have an Elevate account yet? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
