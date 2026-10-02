import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  User,
  Search,
  ScanLine,
  AlertTriangle,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import { StatusBadge } from '../components/common/Badge';

export function QRVerificationPage() {
  const [tokenInput, setTokenInput] = useState('BK-2026-00128');
  const [verifiedBooking, setVerifiedBooking] = useState<Booking | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleVerify = async (tokenToTest?: string) => {
    const raw = (tokenToTest || tokenInput).trim();
    if (!raw) return;

    setIsScanning(true);
    setIsInvalid(false);
    setVerifiedBooking(null);

    // Simulate 400ms scanner latency
    setTimeout(async () => {
      const all = await bookingService.getAll();
      const match = all.find(
        (b) =>
          b.id.toLowerCase() === raw.toLowerCase() ||
          b.qrCodeToken.toLowerCase().includes(raw.toLowerCase())
      );

      if (match) {
        setVerifiedBooking(match);
        setIsInvalid(false);
      } else {
        setIsInvalid(true);
      }
      setIsScanning(false);
    }, 400);
  };

  const handleQuickDemoScan = (id: string) => {
    setTokenInput(id);
    handleVerify(id);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Security & Facility Gate Control</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Scan & Verify Booking QR Pass
        </h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Scan attendee mobile digital passes or verify reservation tokens against active campus registrations.
        </p>
      </div>

      {/* Scanner Visual Container */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-6">
        {/* Simulated Camera Viewfinder */}
        <div className="relative mx-auto flex h-60 w-full max-w-sm flex-col items-center justify-center rounded-2xl bg-neutral-950 p-6 text-center text-white overflow-hidden shadow-inner">
          {/* Scanning line animation */}
          {isScanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-950/40">
              <div className="h-0.5 w-full bg-indigo-400 shadow-[0_0_12px_#818cf8] animate-pulse" />
              <span className="mt-4 text-xs font-mono text-indigo-300">Decrypting pass payload...</span>
            </div>
          ) : (
            <div className="space-y-3 z-10">
              <ScanLine className="mx-auto h-12 w-12 text-indigo-400 animate-pulse" />
              <p className="text-xs font-medium text-neutral-300">
                Align campus QR code within the frame
              </p>
            </div>
          )}

          {/* Viewfinder corners */}
          <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-indigo-500" />
          <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-indigo-500" />
          <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-indigo-500" />
          <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-indigo-500" />
        </div>

        {/* Manual Input Fallback */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Manual Booking Token or Scan Payload
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. BK-2026-00128"
              className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <button
              onClick={() => handleVerify()}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <QrCode className="h-4 w-4" />
              <span>Verify Pass</span>
            </button>
          </div>
        </div>

        {/* Demo Fast Scan Tokens */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
            Click to Test Simulation Scenarios:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoScan('BK-2026-00128')}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono"
            >
              ✓ Valid (BK-2026-00128)
            </button>
            <button
              onClick={() => handleQuickDemoScan('BK-2026-00122')}
              className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-mono"
            >
              ✗ Rejected (BK-2026-00122)
            </button>
            <button
              onClick={() => handleQuickDemoScan('BK-2026-00125')}
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-neutral-700 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 font-mono"
            >
              ⏱ Expired (BK-2026-00125)
            </button>
            <button
              onClick={() => handleQuickDemoScan('BK-INVALID-FAKE')}
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-neutral-700 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 font-mono"
            >
              ? Unregistered Token
            </button>
          </div>
        </div>
      </div>

      {/* VERIFICATION RESULT PANEL */}
      {verifiedBooking && (
        <div
          className={`rounded-2xl border p-6 shadow-md transition-all ${
            verifiedBooking.status === 'Confirmed'
              ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/40'
              : verifiedBooking.status === 'Rejected'
              ? 'border-rose-300 bg-rose-50/70 dark:border-rose-800 dark:bg-rose-950/40'
              : 'border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/40'
          }`}
        >
          <div className="flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              {verifiedBooking.status === 'Confirmed' ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white">
                  <XCircle className="h-5 w-5" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {verifiedBooking.status === 'Confirmed'
                    ? '✓ Valid Booking Pass — Grant Access'
                    : `⚠️ Notice: Pass Status is ${verifiedBooking.status}`}
                </h3>
                <span className="font-mono text-xs text-neutral-500">
                  Token: {verifiedBooking.id}
                </span>
              </div>
            </div>

            <StatusBadge status={verifiedBooking.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-neutral-500 block">Facility Venue</span>
              <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">
                {verifiedBooking.facilityName}
              </strong>
              <p className="text-[11px] text-neutral-500">{verifiedBooking.building}</p>
            </div>

            <div>
              <span className="text-neutral-500 block">Time Slot</span>
              <strong className="text-neutral-900 dark:text-neutral-100 font-mono">
                {verifiedBooking.startTime} – {verifiedBooking.endTime}
              </strong>
              <p className="text-[11px] text-neutral-500">{verifiedBooking.date}</p>
            </div>

            <div>
              <span className="text-neutral-500 block">Lead Organizer</span>
              <strong className="text-neutral-900 dark:text-neutral-100">
                {verifiedBooking.organizerName}
              </strong>
              <p className="text-[11px] text-neutral-500">{verifiedBooking.organizerPhone}</p>
            </div>

            <div>
              <span className="text-neutral-500 block">Expected Attendance</span>
              <strong className="text-neutral-900 dark:text-neutral-100">
                {verifiedBooking.participants} People
              </strong>
              <p className="text-[11px] text-neutral-500">{verifiedBooking.department}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-neutral-500">
              Event: <strong className="text-neutral-800 dark:text-neutral-200">{verifiedBooking.eventName}</strong>
            </span>
            <span className="font-mono text-[11px] text-neutral-400">
              Secured via CampusFlow Cryptographic Digest
            </span>
          </div>
        </div>
      )}

      {/* INVALID TOKEN STATE */}
      {isInvalid && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-6 text-center text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-200 text-rose-700 dark:bg-rose-900 dark:text-rose-200">
            <XCircle className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold">Unrecognized or Tampered Pass</h4>
          <p className="max-w-sm mx-auto">
            The provided token was not found in the active campus registration directory. Please check the reservation ID or re-issue.
          </p>
        </div>
      )}
    </div>
  );
}
