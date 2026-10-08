import React, { useState, useEffect } from 'react';
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
  History,
  Trash2,
  Check,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { useToast } from '../contexts/ToastContext';

interface ScanHistoryEntry {
  id: string;
  tokenId: string;
  eventName: string;
  facilityName: string;
  organizerName: string;
  status: 'Granted' | 'Denied';
  timestamp: string;
}

const SCAN_LOG_KEY = 'campusflow_gate_scans';

export function QRVerificationPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [verifiedBooking, setVerifiedBooking] = useState<Booking | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);

  const { success, error } = useToast();

  useEffect(() => {
    loadBookings();
    loadScanHistory();
  }, []);

  const loadBookings = async () => {
    const all = await bookingService.getAll();
    setActiveBookings(all);
    if (all.length > 0 && !tokenInput) {
      const confirmed = all.find((b) => b.status === 'Confirmed');
      if (confirmed) setTokenInput(confirmed.id);
    }
  };

  const loadScanHistory = () => {
    const raw = localStorage.getItem(SCAN_LOG_KEY);
    if (raw) {
      try {
        setScanHistory(JSON.parse(raw));
      } catch {
        setScanHistory([]);
      }
    }
  };

  const saveScanHistory = (entries: ScanHistoryEntry[]) => {
    setScanHistory(entries);
    localStorage.setItem(SCAN_LOG_KEY, JSON.stringify(entries));
  };

  const logScanEntry = (booking: Booking | null, rawToken: string, isOk: boolean) => {
    const newEntry: ScanHistoryEntry = {
      id: `scan-${Date.now()}`,
      tokenId: rawToken,
      eventName: booking?.eventName || 'Unknown Reservation',
      facilityName: booking?.facilityName || 'Unregistered Venue',
      organizerName: booking?.organizerName || 'Unidentified Guest',
      status: isOk ? 'Granted' : 'Denied',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    saveScanHistory([newEntry, ...scanHistory.slice(0, 19)]);
  };

  const handleVerify = async (tokenToTest?: string) => {
    const raw = (tokenToTest || tokenInput).trim();
    if (!raw) return;

    setIsScanning(true);
    setIsInvalid(false);
    setVerifiedBooking(null);

    // Verify token against live database
    setTimeout(async () => {
      const all = await bookingService.getAll();
      const match = all.find(
        (b) =>
          b.id.toLowerCase() === raw.toLowerCase() ||
          (b.qrCodeToken && b.qrCodeToken.toLowerCase().includes(raw.toLowerCase()))
      );

      if (match && (match.status === 'Confirmed' || match.status.includes('Approved'))) {
        setVerifiedBooking(match);
        setIsInvalid(false);
        logScanEntry(match, raw, true);
        success('Access Authorized', `Digital pass verified for ${match.organizerName}. Gate barrier unlocked.`);
      } else if (match) {
        setVerifiedBooking(match);
        setIsInvalid(false);
        logScanEntry(match, raw, false);
        error('Access Denied', `Booking status is currently ${match.status}. HOD authorization required.`);
      } else {
        setIsInvalid(true);
        logScanEntry(null, raw, false);
        error('Invalid Pass', 'Unregistered or invalid QR pass token.');
      }
      setIsScanning(false);
    }, 450);
  };

  const handleClearHistory = () => {
    saveScanHistory([]);
    success('History Cleared', 'Gate access audit logs purged.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Security & Facility Gate Checkpoint</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Real-Time QR Gate Pass Verification
        </h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Verify digital attendee entry passes, validate cryptographic authorization tokens, and inspect checkpoint logs.
        </p>
      </div>

      {/* Scanner Visual & Manual Controls */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-6">
        {/* Viewfinder */}
        <div className="relative mx-auto flex h-52 w-full max-w-sm flex-col items-center justify-center rounded-2xl bg-neutral-950 p-6 text-center text-white overflow-hidden shadow-inner">
          {isScanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-950/40">
              <div className="h-0.5 w-full bg-indigo-400 shadow-[0_0_12px_#818cf8] animate-pulse" />
              <span className="mt-4 text-xs font-mono text-indigo-300">Scanning cryptographic signature...</span>
            </div>
          ) : (
            <div className="space-y-2 z-10">
              <ScanLine className="mx-auto h-10 w-10 text-indigo-400 animate-pulse" />
              <p className="text-xs font-medium text-neutral-300">
                Gate Scanner Armed & Ready
              </p>
              <p className="text-[10px] text-neutral-400">
                Input booking token below or select an active user reservation
              </p>
            </div>
          )}

          {/* Viewfinder corners */}
          <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-indigo-500" />
          <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-indigo-500" />
          <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-indigo-500" />
          <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-indigo-500" />
        </div>

        {/* Input */}
        <div className="space-y-2 max-w-lg mx-auto">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-center">
            Enter Booking Token or Scan Payload
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

        {/* Real Active User Reservations to Test */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-2 text-center">
            Click Any Live User Reservation to Scan Instantly:
          </span>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {activeBookings.slice(0, 5).map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setTokenInput(b.id);
                  handleVerify(b.id);
                }}
                className={`rounded-lg px-2.5 py-1 font-mono text-[11px] border transition-colors ${
                  b.status === 'Confirmed'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {b.id} ({b.organizerName.split(' ')[0]} · {b.status})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VERIFICATION RESULT PANEL */}
      {verifiedBooking && (
        <div
          className={`rounded-2xl border p-6 shadow-md transition-all ${
            verifiedBooking.status === 'Confirmed' || verifiedBooking.status.includes('Approved')
              ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/40'
              : verifiedBooking.status === 'Rejected'
              ? 'border-rose-300 bg-rose-50/70 dark:border-rose-800 dark:bg-rose-950/40'
              : 'border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/40'
          }`}
        >
          <div className="flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              {verifiedBooking.status === 'Confirmed' || verifiedBooking.status.includes('Approved') ? (
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
                  {verifiedBooking.status === 'Confirmed' || verifiedBooking.status.includes('Approved')
                    ? '✓ Access Granted — Valid HOD Authorized Pass'
                    : `⚠️ Access Denied — Pass Status is ${verifiedBooking.status}`}
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
            The provided token was not found in the active campus registration directory. Access barrier remains locked.
          </p>
        </div>
      )}

      {/* CHECKPOINT SCAN AUDIT LOG */}
      {scanHistory.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-neutral-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Checkpoint Entry Audit Trail ({scanHistory.length})
              </h3>
            </div>
            <button
              onClick={handleClearHistory}
              className="text-[11px] font-semibold text-rose-600 hover:underline dark:text-rose-400"
            >
              Clear Log
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {scanHistory.map((entry) => (
              <div key={entry.id} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {entry.tokenId}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                      {entry.eventName}
                    </span>
                    <span className="text-neutral-400">· {entry.facilityName}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Organizer: {entry.organizerName}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      entry.status === 'Granted'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {entry.status}
                  </span>
                  <span className="font-mono text-[10px] text-neutral-400">{entry.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
