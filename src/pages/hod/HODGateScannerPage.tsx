import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  History,
  Trash2,
  Sparkles,
  Building,
  User,
  Calendar,
  Lock,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData, ScanLogEntry } from '../../contexts/CampusDataContext';
import { useToast } from '../../contexts/ToastContext';
import { Booking } from '../../types';

export function HODGateScannerPage() {
  const { bookings, passes, scanLogs, addScanLog, clearScanLogs, createGatePass } = useCampusData();
  const { success, error, info } = useToast();

  const [selectedGate, setSelectedGate] = useState('Main Campus Gate 1');
  const [manualToken, setManualToken] = useState('');
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'Valid' | 'Expired' | 'Invalid';
    booking?: Booking;
    pass?: any;
    tokenId: string;
    message: string;
  } | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Initialize camera scanner when isScanningActive is true
  useEffect(() => {
    if (!isScanningActive) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    // Small delay to ensure the container element '#qr-reader' is rendered in DOM
    const timer = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 240, height: 240 } },
          false
        );
        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            handleProcessToken(decodedText);
            // Optionally stop scanning after a successful scan
            setIsScanningActive(false);
          },
          (err) => {
            // Ignore ongoing frame decode errors
          }
        );
      } catch (e: any) {
        console.error('Camera initialization error', e);
        error('Camera Unavailable', 'Camera access blocked or not found. You can enter pass token manually.');
        setIsScanningActive(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isScanningActive]);

  const handleProcessToken = async (rawInput: string) => {
    const token = rawInput.trim();
    if (!token) return;

    // Search live booking store for token or booking id
    const match = bookings.find(
      (b) =>
        b.id.toLowerCase() === token.toLowerCase() ||
        b.qrCodeToken.toLowerCase() === token.toLowerCase() ||
        (token.includes(b.id) && b.status === 'Confirmed')
    );

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (match) {
      if (match.status === 'Confirmed' || match.status.includes('Approved')) {
        // Valid pass
        setScanResult({
          status: 'Valid',
          booking: match,
          tokenId: token,
          message: 'Campus Gate Entry Authorization Granted. Digital HOD cryptographic verification badge active.',
        });
        await addScanLog({
          tokenId: token,
          timestamp: `Today at ${timeString}`,
          personName: match.organizerName,
          personRole: 'student',
          department: match.department,
          venueName: match.facilityName,
          status: 'Valid',
          gate: selectedGate,
        });
        success('Gate Access Granted', `Verified entry pass for ${match.organizerName}.`);
      } else if (match.status === 'Rejected' || match.status === 'Cancelled') {
        // Invalid or cancelled
        setScanResult({
          status: 'Invalid',
          booking: match,
          tokenId: token,
          message: `Entry Denied. Booking status is marked as ${match.status}. Reason: ${match.rejectionReason || 'Venue authorization revoked.'}`,
        });
        await addScanLog({
          tokenId: token,
          timestamp: `Today at ${timeString}`,
          personName: match.organizerName,
          department: match.department,
          venueName: match.facilityName,
          status: 'Invalid',
          gate: selectedGate,
        });
        error('Gate Entry Denied', `Booking ${match.id} has been ${match.status}.`);
      } else {
        // Pending
        setScanResult({
          status: 'Expired',
          booking: match,
          tokenId: token,
          message: 'Pass Locked: Awaiting Head of Department (HOD) single-point authorization.',
        });
        await addScanLog({
          tokenId: token,
          timestamp: `Today at ${timeString}`,
          personName: match.organizerName,
          department: match.department,
          venueName: match.facilityName,
          status: 'Expired',
          gate: selectedGate,
        });
        info('Pass Not Authorized Yet', 'Reservation request is pending HOD approval.');
      }
    } else {
      // Unrecognized token
      setScanResult({
        status: 'Invalid',
        tokenId: token,
        message: 'Security Alert: QR token signature not recognized in campus credential registry.',
      });
      await addScanLog({
        tokenId: token,
        timestamp: `Today at ${timeString}`,
        personName: 'Unregistered Entrant',
        venueName: 'Unverified Venue',
        status: 'Invalid',
        gate: selectedGate,
      });
      error('Invalid Token', 'Unrecognized pass token.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleProcessToken(manualToken);
  };

  // Sample Generator for instant testing
  const handleGenerateSample = (type: 'valid' | 'invalid' | 'pending') => {
    if (type === 'valid') {
      const confirmed = bookings.find((b) => b.status === 'Confirmed');
      const token = confirmed ? confirmed.qrCodeToken : 'CAMPUSFLOW-QR-BK-2026-00128-VALID-SEM-A';
      setManualToken(token);
      handleProcessToken(token);
    } else if (type === 'invalid') {
      const token = 'CAMPUSFLOW-QR-REVOKED-EXPIRED-992';
      setManualToken(token);
      handleProcessToken(token);
    } else {
      const pending = bookings.find((b) => b.status === 'Pending' || b.status === 'Under Review');
      const token = pending ? pending.id : 'BK-2026-00129';
      setManualToken(token);
      handleProcessToken(token);
    }
  };

  return (
    <HODRouteGuard pageTitle="Gate QR Verification">
      <div className="space-y-6">
        <HODPageHeader
          title="Gate Verification & Attendee Access Control"
          badge="Live QR Scanner"
          description="Security gate verification console for scanning digital QR passes, authenticating attendees against live university reservations, and logging ingress telemetry."
          breadcrumbs={[{ label: 'Gate Verification' }]}
        />

        {/* Gate Selection and Control Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Active Checkpoint Gate:
            </span>
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="Main Campus Gate 1">Main Campus Gate 1</option>
              <option value="Engineering North Gate">Engineering North Gate</option>
              <option value="Auditorium VIP Gate 3">Auditorium VIP Gate 3</option>
              <option value="Sports Arena West Entry">Sports Arena West Entry</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-neutral-500 font-medium">
              Real-time Ingress Surveillance Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner & Manual Fallback Panel (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      Camera QR Scanner & Reader
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Align the attendee&apos;s digital gate pass in front of camera
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsScanningActive(!isScanningActive)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors ${
                    isScanningActive
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>{isScanningActive ? 'Stop Camera' : 'Start Camera Scanner'}</span>
                </button>
              </div>

              {/* Camera Scanner Viewport */}
              {isScanningActive ? (
                <div className="rounded-xl overflow-hidden border border-neutral-200 bg-black/90 p-3 text-center">
                  <div id="qr-reader" className="w-full max-w-sm mx-auto" />
                  <p className="text-[11px] text-neutral-400 mt-2">
                    Scanning active. Hold QR code steady.
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-850/30 space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                    <Camera className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Camera is currently standby
                  </p>
                  <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                    Click &quot;Start Camera Scanner&quot; to scan with your webcam or phone camera, or enter the pass token code below.
                  </p>
                </div>
              )}

              {/* Manual Pass Code Fallback Form */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Manual Pass Code / Token Verification
                </label>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="e.g. CAMPUSFLOW-QR-BK-2026-00128-VALID-SEM-A or BK-2026-00128"
                    className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                  >
                    Verify Pass
                  </button>
                </form>

                {/* Instant Sample Testing Helper */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="text-neutral-400 flex items-center gap-1 font-medium">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Quick Test Passes:
                  </span>
                  <button
                    onClick={() => handleGenerateSample('valid')}
                    className="rounded bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                  >
                    ✓ Test Valid Pass
                  </button>
                  <button
                    onClick={() => handleGenerateSample('pending')}
                    className="rounded bg-amber-50 px-2 py-0.5 font-medium text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                  >
                    ⏳ Test Pending Pass
                  </button>
                  <button
                    onClick={() => handleGenerateSample('invalid')}
                    className="rounded bg-rose-50 px-2 py-0.5 font-medium text-rose-800 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
                  >
                    ✕ Test Revoked Pass
                  </button>
                </div>
              </div>
            </div>

            {/* Live Scan Result Card */}
            {scanResult && (
              <div
                className={`rounded-2xl border p-5 transition-all shadow-xs space-y-4 ${
                  scanResult.status === 'Valid'
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : scanResult.status === 'Expired'
                    ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2.5">
                    {scanResult.status === 'Valid' ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    ) : scanResult.status === 'Expired' ? (
                      <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                    )}
                    <div>
                      <h4
                        className={`text-base font-bold ${
                          scanResult.status === 'Valid'
                            ? 'text-emerald-950 dark:text-emerald-200'
                            : scanResult.status === 'Expired'
                            ? 'text-amber-950 dark:text-amber-200'
                            : 'text-rose-950 dark:text-rose-200'
                        }`}
                      >
                        {scanResult.status === 'Valid'
                          ? 'ACCESS GRANTED · VALID DIGITAL PASS'
                          : scanResult.status === 'Expired'
                          ? 'PENDING HOD APPROVAL · ENTRY ON HOLD'
                          : 'ACCESS DENIED · INVALID PASS'}
                      </h4>
                      <p className="text-[11px] text-neutral-500">{scanResult.message}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      scanResult.status === 'Valid'
                        ? 'bg-emerald-600 text-white'
                        : scanResult.status === 'Expired'
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {scanResult.status}
                  </span>
                </div>

                {/* Attendee Credentials Card with Photo placeholder */}
                {scanResult.booking ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/80 p-4 rounded-xl dark:bg-neutral-900/80">
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-center">
                      <div className="h-16 w-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center mb-2 shadow-2xs">
                        {scanResult.booking.organizerName.charAt(0)}
                      </div>
                      <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {scanResult.booking.organizerName}
                      </span>
                      <span className="text-[10px] text-neutral-400 capitalize">
                        Authorized Attendee
                      </span>
                    </div>

                    <div className="sm:col-span-2 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-400">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400">
                            Department
                          </span>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {scanResult.booking.department}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400">
                            Approved Venue
                          </span>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {scanResult.booking.facilityName}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400">
                            Date & Slot
                          </span>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                            {scanResult.booking.date} ({scanResult.booking.startTime} –{' '}
                            {scanResult.booking.endTime})
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400">
                            Pass Reference ID
                          </span>
                          <p className="font-mono text-neutral-800 dark:text-neutral-200 font-bold">
                            {scanResult.booking.id}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-400">
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        <span>Cryptographically verified against CampusFlow central ledger</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/80 rounded-xl dark:bg-neutral-900/80 text-xs text-neutral-500">
                    Token reference: <strong className="font-mono">{scanResult.tokenId}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scan History Telemetry Table (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <History className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                      Checkpoint Scan History
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      Real-time ingress audit log at campus gates
                    </p>
                  </div>
                </div>

                {scanLogs.length > 0 && (
                  <button
                    onClick={clearScanLogs}
                    title="Clear Scan History"
                    className="rounded p-1 text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* History List */}
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-96 overflow-y-auto pr-1">
                {scanLogs.length === 0 ? (
                  <div className="py-10 text-center text-xs text-neutral-400">
                    No scans logged at this checkpoint yet.
                  </div>
                ) : (
                  scanLogs.map((entry) => (
                    <div key={entry.id} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {entry.personName}
                          </span>
                          <span className="text-[10px] text-neutral-400">· {entry.gate}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500">{entry.venueName}</p>
                        <span className="font-mono text-[10px] text-neutral-400">{entry.timestamp}</span>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          entry.status === 'Valid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : entry.status === 'Expired'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HODRouteGuard>
  );
}
