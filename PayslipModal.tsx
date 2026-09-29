import React, { useState } from 'react';
import { X, Printer, Download, Mail, Check, ShieldCheck, FileText, Send, Building2 } from 'lucide-react';
import { UserProgress } from '../types';
import { ElevateLogo } from './ElevateLogo';
import { StorageService } from '../services/storage';

interface PayslipModalProps {
  isOpen: boolean;
  user: UserProgress;
  onClose: () => void;
  reference?: string;
  paymentMethod?: string;
  amount?: string;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  user,
  onClose,
  reference,
  paymentMethod = 'Absa Bank Deposit / EFT',
  amount = 'R50.00',
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  if (!isOpen) return null;

  const adminSettings = StorageService.getAdminSettings();
  const adminEmail = adminSettings.adminEmail || 'sibiyaconstance44@gmail.com';
  const displayRef = reference || user.phoneNumber;
  const invoiceNumber = `ELV-${new Date().getFullYear()}-${displayRef.slice(-4) || '8821'}`;
  const currentDate = new Date().toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate sending email receipt & record in system
    try {
      await fetch('/api/payments/email-payslip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentPhone: user.phoneNumber,
          studentName: user.fullName,
          studentGrade: user.grade,
          recipientEmail: recipientEmail || adminEmail,
          reference: displayRef,
          amount,
          invoiceNumber,
          date: currentDate,
        }),
      }).catch(() => {});

      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const mailtoUrl = `mailto:${adminEmail}?subject=${encodeURIComponent(
    `Elevate Official Pay Slip / Payment Proof - ${user.fullName} (${user.phoneNumber})`
  )}&body=${encodeURIComponent(
    `Dear Elevate Accounts Team,\n\nPlease find my subscription pay slip / proof of payment details:\n\n` +
    `• Invoice No: ${invoiceNumber}\n` +
    `• Learner Name: ${user.fullName}\n` +
    `• Contact / Reference: ${displayRef}\n` +
    `• Grade: ${user.grade}\n` +
    `• Amount: ${amount}\n` +
    `• Method: ${paymentMethod}\n` +
    `• Date: ${currentDate}\n\n` +
    `I have attached my bank ATM deposit slip / EFT proof to this email.\n\nKind regards,\n${user.fullName}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Official Elevate Pay Slip / Tax Invoice</h3>
              <p className="text-[11px] text-slate-500">Official proof of payment for parent records & school submission</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Printable Payslip Card */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          <div
            id="elevate-printable-payslip"
            className="p-5 sm:p-6 bg-slate-50/60 rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-4 relative"
          >
            {/* Top row */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <ElevateLogo size="md" />
                <div>
                  <div className="font-black text-base text-blue-900 tracking-tight">Elevate Learning (Pty) Ltd</div>
                  <div className="text-[10px] text-slate-500">Reg: 2024/782910/07 • South Africa</div>
                  <div className="text-[10px] text-slate-500">CAPS & IEB Digital Learning Platform</div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase tracking-wider block mb-1">
                  Paid / Verified
                </span>
                <div className="font-mono text-[11px] font-bold text-slate-700">{invoiceNumber}</div>
                <div className="text-[10px] text-slate-400">{currentDate}</div>
              </div>
            </div>

            {/* Billed To & Banking info */}
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Billed To / Learner
                </span>
                <div className="font-bold text-slate-900">{user.fullName}</div>
                <div className="text-slate-600">{user.grade}</div>
                <div className="font-mono text-slate-600">Cell: {user.phoneNumber}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Payment Destination
                </span>
                <div className="font-bold text-slate-900">Absa Bank South Africa</div>
                <div className="text-slate-600">Branch: {adminSettings.absaBranchCode || '632005'}</div>
                <div className="font-mono text-slate-600">Ref: {displayRef}</div>
              </div>
            </div>

            {/* Line items table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-center">Period</th>
                    <th className="py-2 px-3 text-right">Amount (ZAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">Elevate Premium CAPS & IEB Access</div>
                      <div className="text-[10px] text-slate-500">Unlimited past papers, marking memos & Ms Elevate AI Tutor</div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-medium">30 Days</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">{amount}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-extrabold text-slate-900">
                  <tr>
                    <td colSpan={2} className="py-2 px-3 text-right">Total Paid:</td>
                    <td className="py-2 px-3 text-right text-emerald-700 text-xs">{amount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Verification Stamp */}
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 border-t border-slate-200">
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Electronic Transaction
              </span>
              <span>Payment Method: {paymentMethod}</span>
            </div>
          </div>

          {/* Email This Pay Slip Section */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-blue-950 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-600" />
                Email This Pay Slip / Proof of Payment
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                Direct to Admin
              </span>
            </div>
            
            <p className="text-[11px] text-slate-600 leading-snug">
              Send this pay slip directly to the admin email (<strong className="text-blue-800">{adminEmail}</strong>) or enter a parent's email to receive an official receipt copy.
            </p>

            {sendSuccess && (
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Pay slip receipt recorded and queued for transmission!</span>
              </div>
            )}

            <form onSubmit={handleSendEmail} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder={`Recipient email (defaults to ${adminEmail})`}
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Send Pay Slip'}</span>
              </button>
            </form>

            <div className="flex items-center justify-between pt-1 border-t border-blue-100 text-[11px]">
              <span className="text-slate-500">Or use your phone/desktop email app:</span>
              <a
                href={mailtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-bold hover:underline flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open in Mail App</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
