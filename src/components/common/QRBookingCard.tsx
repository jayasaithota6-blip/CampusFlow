import React, { useRef, useState } from 'react';
import { Booking } from '../../types';
import { Download, Printer, Share2, CheckCircle2, ShieldCheck, Lock, AlertCircle, Sparkles, XCircle, ArrowRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { approvalService } from '../../services/approvalService';

interface QRBookingCardProps {
  booking: Booking;
  onClose?: () => void;
  onStatusUpdated?: (updated: Booking) => void;
}

export function QRBookingCard({ booking: initialBooking, onClose, onStatusUpdated }: QRBookingCardProps) {
  const [booking, setBooking] = useState<Booking>(initialBooking);
  const [isApproving, setIsApproving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { success, info, error } = useToast();
  const { user } = useAuth();

  const isApproved = booking.status === 'Confirmed' || booking.status.toLowerCase().includes('approved');
  const isRejected = booking.status === 'Rejected';
  const isCancelled = booking.status === 'Cancelled';
  const isPending = !isApproved && !isRejected && !isCancelled;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    success('QR Code Downloaded', `Digital entry pass for ${booking.id} saved.`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `CampusFlow Pass: ${booking.eventName}`,
        text: `Facility Pass for ${booking.facilityName} on ${booking.date}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText?.(window.location.href);
      info('Link Copied', 'Booking pass link copied to clipboard.');
    }
  };

  const handleQuickHODApprove = async () => {
    setIsApproving(true);
    try {
      const updated = await approvalService.approveRequest(
        booking.id,
        { name: user?.name || 'Dr. Marcus Vance (HOD)', role: 'hod' },
        'Approved by Head of Department (HOD). Digital QR pass generated.'
      );
      setBooking(updated);
      onStatusUpdated?.(updated);
      success(
        'HOD Approved · QR Generated!',
        `Digital QR Entry Pass for ${updated.organizerName} is now generated and verified!`
      );
    } catch (err: any) {
      error('Approval Failed', err.message || 'Could not approve request.');
    } finally {
      setIsApproving(false);
    }
  };

  // Generate deterministic QR matrix pattern based on booking id
  const patternSeed = booking.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const grid = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => {
      // Corner alignment squares (standard QR corners)
      if ((r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3)) return true;
      if (r === 1 && c === 1) return false;
      if (r === 1 && c === 7) return false;
      if (r === 7 && c === 1) return false;
      return (r * 11 + c * 7 + patternSeed) % 3 === 0 || (r + c) % 4 === 0;
    })
  );

  return (
    <div ref={cardRef} className="flex flex-col items-center">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            {isApproved ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : isRejected ? (
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            ) : (
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              CampusFlow Entry Pass
            </span>
          </div>
          <span
            className={`font-mono text-xs font-semibold ${
              isApproved
                ? 'text-emerald-600 dark:text-emerald-400'
                : isRejected
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {isApproved ? 'HOD Approved' : booking.status}
          </span>
        </div>

        {/* QR Code Container OR Pending/Rejected State */}
        {isApproved ? (
          <div className="my-5 flex flex-col items-center justify-center rounded-xl bg-emerald-50/60 p-6 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <div className="relative rounded-lg bg-white p-3 shadow-xs">
              <svg
                viewBox="0 0 100 100"
                className="h-44 w-44 fill-neutral-900"
                shapeRendering="crispEdges"
                aria-label={`QR Code for booking ${booking.id}`}
              >
                {/* Corner position markers */}
                <rect x="0" y="0" width="28" height="28" fill="#0f172a" rx="4" />
                <rect x="4" y="4" width="20" height="20" fill="#ffffff" rx="2" />
                <rect x="8" y="8" width="12" height="12" fill="#0f172a" rx="1" />

                <rect x="72" y="0" width="28" height="28" fill="#0f172a" rx="4" />
                <rect x="76" y="4" width="20" height="20" fill="#ffffff" rx="2" />
                <rect x="80" y="8" width="12" height="12" fill="#0f172a" rx="1" />

                <rect x="0" y="72" width="28" height="28" fill="#0f172a" rx="4" />
                <rect x="4" y="76" width="20" height="20" fill="#ffffff" rx="2" />
                <rect x="8" y="80" width="12" height="12" fill="#0f172a" rx="1" />

                {/* Data matrix dots */}
                {grid.map((row, rIdx) =>
                  row.map((active, cIdx) => {
                    const x = 32 + (cIdx * 4);
                    const y = 32 + (rIdx * 4);
                    return active ? (
                      <rect key={`${rIdx}-${cIdx}`} x={x} y={y} width="3.2" height="3.2" fill="#0f172a" />
                    ) : null;
                  })
                )}
              </svg>
            </div>
            
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified HOD Authorized</span>
              </div>
              <p className="mt-1.5 font-mono text-[11px] font-semibold tracking-wider text-neutral-600 dark:text-neutral-400">
                {booking.qrCodeToken || `CAMPUSFLOW-QR-${booking.id}`}
              </p>
            </div>
          </div>
        ) : isRejected ? (
          <div className="my-5 flex flex-col items-center justify-center rounded-xl bg-rose-50 p-6 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300 mb-3">
              <XCircle className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
              QR Entry Pass Not Issued
            </h4>
            <p className="mt-1 text-[11px] text-rose-700 dark:text-rose-300 max-w-xs">
              This booking request was denied by the Head of Department.
            </p>
            {booking.rejectionReason && (
              <p className="mt-2 text-[11px] italic bg-white/60 dark:bg-neutral-900/60 p-2 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200">
                &ldquo;{booking.rejectionReason}&rdquo;
              </p>
            )}
          </div>
        ) : (
          /* Pending HOD Approval State */
          <div className="my-5 flex flex-col items-center justify-center rounded-xl bg-amber-50/80 p-6 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-center">
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300">
              <Lock className="h-7 w-7" />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-600 p-1 text-white">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>
            
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              QR Pass Locked · Awaiting HOD Approval
            </h4>
            <p className="mt-1.5 text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed max-w-xs">
              CampusFlow requires Head of Department (HOD) sign-off. As soon as the HOD approves this request, your cryptographic digital QR entry pass will be generated instantly.
            </p>

            {/* Quick Demo Approval Button */}
            <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/60 w-full">
              <button
                onClick={handleQuickHODApprove}
                disabled={isApproving}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isApproving ? 'Approving & Generating...' : 'Approve as HOD Now (Demo)'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <p className="mt-1 text-[10px] text-neutral-500">
                Click above to simulate immediate HOD authorization & QR generation
              </p>
            </div>
          </div>
        )}

        {/* Booking Details */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between border-b border-neutral-100 py-1 dark:border-neutral-800">
            <span className="text-neutral-500">Facility</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">
              {booking.facilityName}
            </span>
          </div>
          <div className="flex justify-between border-b border-neutral-100 py-1 dark:border-neutral-800">
            <span className="text-neutral-500">Event</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right truncate max-w-[180px]">
              {booking.eventName}
            </span>
          </div>
          <div className="flex justify-between border-b border-neutral-100 py-1 dark:border-neutral-800">
            <span className="text-neutral-500">Date</span>
            <span className="font-mono text-neutral-900 dark:text-neutral-100">{booking.date}</span>
          </div>
          <div className="flex justify-between border-b border-neutral-100 py-1 dark:border-neutral-800">
            <span className="text-neutral-500">Time Slot</span>
            <span className="font-mono text-neutral-900 dark:text-neutral-100">
              {booking.startTime} – {booking.endTime}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-500">Authorized Requester</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {booking.organizerName}
            </span>
          </div>
        </div>

        {/* Action Buttons (Enabled when QR is generated) */}
        {isApproved && (
          <div className="mt-5 flex items-center justify-center gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
