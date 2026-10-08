import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  QrCode,
  Package,
  Wrench,
  ChevronDown,
  ChevronUp,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Booking Conflict');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  const guides = [
    {
      title: 'How to book a facility',
      icon: BookOpen,
      desc: 'Navigate to "Book Facility", pick your date, inspect real-time conflict status, and bundle required projectors or microphones.',
    },
    {
      title: 'How approvals work',
      icon: Clock,
      desc: 'Student and club bookings route through Faculty Coordinators then to Department HODs and Facility Managers with full audit timestamps.',
    },
    {
      title: 'How to cancel a booking',
      icon: CheckCircle2,
      desc: 'Open "My Bookings", select your reservation, and press Cancel. The venue and all hardware units are immediately returned to inventory.',
    },
    {
      title: 'How QR verification works',
      icon: QrCode,
      desc: 'Every approved booking issues an encrypted QR digital pass. Gate security scans this code to verify schedule and attendee legitimacy.',
    },
    {
      title: 'Resource booking',
      icon: Package,
      desc: 'You can allocate laser projectors, handheld microphones, and banquet chairs concurrently during room checkout.',
    },
    {
      title: 'Maintenance protocols',
      icon: Wrench,
      desc: 'Venues undergoing acoustic or electrical calibration are temporarily quarantined to prevent double booking disruptions.',
    },
  ];

  const faqs = [
    {
      q: 'How far in advance can a campus facility be booked?',
      a: 'Students and student organizations can reserve facilities up to 30 days in advance. Faculty and department coordinators can schedule recurring academic symposiums up to one semester in advance.',
    },
    {
      q: 'What happens if my booking encounters a schedule conflict?',
      a: 'The system highlights conflicting bookings in real-time and provides 3 instant alternative time windows that are clear of conflicts.',
    },
    {
      q: 'Who approves weekend or late evening events?',
      a: 'Events past 7:00 PM or on Saturdays require additional clearance from Campus Security and Estate Management.',
    },
    {
      q: 'Can equipment be booked without reserving a room?',
      a: 'Yes, departmental staff and faculty can checkout portable AV equipment and presentation laptops from the Equipment Depot.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      error('Fields Missing', 'Please fill in all ticket details.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      success('Support Ticket Dispatched', 'Campus IT Helpdesk has received your ticket (#HD-9421).');
      setTicketSubject('');
      setTicketMessage('');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          CampusFlow Knowledge Base & Help Center
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Step-by-step guides, campus booking rules, frequently asked questions, and support ticket dispatch.
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((g, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <g.icon className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {g.title}
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">{g.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ Accordion Section */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Frequently Asked Questions
        </h3>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left font-semibold text-neutral-900 hover:text-indigo-600 dark:text-neutral-100 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                </button>
                {isOpen && (
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Support Form */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4 text-xs">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Contact Campus Operations Support
          </h3>
          <p className="text-neutral-500 mt-0.5">
            Submit a priority service ticket to Campus Facilities & Infrastructure management.
          </p>
        </div>

        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="Booking Conflict">Booking Conflict / Schedule Override</option>
                <option value="Hardware Malfunction">Hardware / Projector Malfunction</option>
                <option value="Gate Access Issue">QR Pass Scanner Failure</option>
                <option value="Permission Adjustment">Role & Department Privileges</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Laser projector HDMI port signal loss in Seminar Hall A"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Issue Description & Timing
            </label>
            <textarea
              rows={3}
              required
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Describe the problem, affected venue, or needed accommodation..."
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Sending Ticket...' : 'Dispatch Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
