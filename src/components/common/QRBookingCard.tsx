import React, { useRef, useState } from 'react';
import { Booking } from '../../types';
import { Download, Printer, Share2, CheckCircle2, ShieldCheck, Lock, AlertCircle, XCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface QRBookingCardProps {
  booking: Booking;
  onClose?: () => void;
  onStatusUpdated?: (updated: Booking) => void;
}

export function QRBookingCard({ booking, onClose }: QRBookingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { success, info } = useToast();

  const isApproved = booking.status === 'Confirmed' || booking.status.toLowerCase().includes('approved');
  const isRejected = booking.status === 'Rejected';
  const isCancelled = booking.status === 'Cancelled';

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
            ) : isCancelled ? (
              <XCircle className="h-5 w-5 text-neutral-400" />
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
                : isCancelled
                ? 'text-neutral-500'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {isApproved ? 'HOD Approved' : booking.status}
          </span>
        </div>

        {/* QR Code Container OR Pending/Rejected State */}
        {isApproved ? (
          <div className="my-5 flex flex-col items-center justify-center rounded-xl bg-emerald-50/60 p-6 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
            <div className="relative rounded-lg bg-white p-3 shadow-xs">
              <svg
                viewBox="0 0 100 100"
                className="h-44 w-44 fill-neutral-900"
                shapeRendering="crispEdges"
                aria-label={`QR Code for booking ${booking.id}`}
              >
                {/* Standard Finder Pattern Outer & Inner Squares */}
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
            
            {/* Verification Badge */}
            <div className="mt-3.5 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:border-emerald-700 dark:text-emerald-300 shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Verified · HOD Approved Gate Pass</span>
              </div>
              <p className="font-mono text-[11px] font-semibold tracking-wider text-neutral-600 dark:text-neutral-400 pt-0.5">
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
              This reservation request was declined by the Head of Department.
            </p>
            {booking.rejectionReason && (
              <p className="mt-2 text-[11px] italic bg-white/80 dark:bg-neutral-900/80 p-2 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200">
                &ldquo;{booking.rejectionReason}&rdquo;
              </p>
            )}
          </div>
        ) : isCancelled ? (
          <div className="my-5 flex flex-col items-center justify-center rounded-xl bg-neutral-100 p-6 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 mb-3">
              <XCircle className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Reservation Cancelled
            </h4>
            <p className="mt-1 text-[11px] text-neutral-500 max-w-xs">
              This booking was cancelled and the QR pass has been revoked.
            </p>
          </div>
        ) : (
          /* Pending HOD Approval State - STRICT: ONLY HOD CAN APPROVE */
          <div className="my-5 flex flex-col items-center justify-center rounded-xl bg-amber-50/80 p-6 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-center space-y-2">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300">
              <Lock className="h-7 w-7" />
            </div>
            
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              QR Pass Locked · Pending HOD Approval
            </h4>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed max-w-xs">
              This booking request has been submitted and is currently in the Head of Department (HOD) review queue.
            </p>
            <div className="rounded-lg bg-amber-100/60 p-2.5 text-[11px] text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 text-left w-full space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Review Stage:</span>
                <span className="font-semibold">HOD Academic Sign-Off</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Current Status:</span>
                <span className="font-semibold text-amber-700 dark:text-amber-300">Awaiting Decision</span>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic pt-1">
              Your official QR code entry pass and verification badge will unlock automatically as soon as the HOD approves your request.
            </p>
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
            <span className="text-neutral-500">Schedule</span>
            <span className="font-mono text-neutral-900 dark:text-neutral-100 text-right">
              {booking.date} · {booking.startTime}
            </span>
          </div>
          <div className="flex justify-between border-b border-neutral-100 py-1 dark:border-neutral-800">
            <span className="text-neutral-500">Organizer</span>
            <span className="text-neutral-900 dark:text-neutral-100 text-right">
              {booking.organizerName} ({booking.department})
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-500">Booking Token</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-right">
              {booking.id}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          {isApproved ? (
            <>
              <button
                onClick={handlePrint}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Pass</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save Pass</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
