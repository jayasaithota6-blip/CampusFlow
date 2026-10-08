import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Calendar,
  Clock,
  QrCode,
  BarChart,
  CheckCircle,
  Layers,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-md px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg">
              CF
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                CampusFlow
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                Smart Campus Facility Booking
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            <a href="#why-campusflow" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Why CampusFlow
            </a>
            <a href="#facilities" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Facilities
            </a>
            <a href="#how-it-works" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              How It Works
            </a>
            <a href="#recommendations" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Smart AI Engine
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-100 px-6 py-20 lg:py-28 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Generation College Operations Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.1]">
              Book Campus Facilities. Manage Resources. Run Events Smarter.
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              One centralized university platform for discovering, booking, approving, and managing
              campus facilities, technical equipment, and student events with instant conflict
              prevention and QR verification.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors"
              >
                <span>Book a Facility</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/facilities"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>Explore Facilities</span>
              </Link>
            </div>

            {/* Quick Proof Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-100 dark:border-neutral-800/80">
              <div>
                <p className="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">48+</p>
                <p className="text-xs text-neutral-500">Verified Campus Venues</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">100%</p>
                <p className="text-xs text-neutral-500">Conflict Detection</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">&lt; 2 hrs</p>
                <p className="text-xs text-neutral-500">Average Approval Cycle</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Display */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
              <div className="overflow-hidden rounded-xl">
                <img
                  src="/src/assets/images/hero_campus_facility_1790943295573.jpg"
                  alt="Modern University Campus Architecture"
                  referrerPolicy="no-referrer"
                  className="h-64 sm:h-80 w-full object-cover"
                />
              </div>

              {/* Floating interactive highlight card */}
              <div className="mt-3 rounded-xl border border-neutral-200/80 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Reservation Confirmed
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400">BK-2026-00128</span>
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Seminar Hall A · Main Block
                </h4>
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
                  <span>Today · 10:00 AM – 12:00 PM</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">QR Validated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section A: Why CampusFlow? */}
      <section id="why-campusflow" className="border-b border-neutral-100 px-6 py-20 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Enterprise Campus Management
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Why CampusFlow?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Eliminate double bookings, lost equipment, paper approval slips, and scheduling chaos
              with an automated digital operating system.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Real-Time Availability
              </h4>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Live interactive multi-view calendar reflects exact room and equipment reservations in
                real-time across all college faculties.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Smart Conflict Detection
              </h4>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Instant algorithm prevents overlapping time slots, double-assigned projectors, and
                maintenance closures with auto-suggested alternatives.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center mb-4">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Easy Approval Workflow
              </h4>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Automated hierarchical approval routing from Faculty Coordinator to HOD, Admin, and
                Facility Manager with full audit trails.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Equipment Management
              </h4>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Bundle laser projectors, microphones, PA systems, and conference furniture with
                live inventory stock counts and return tracking.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center mb-4">
                <QrCode className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                QR Booking Verification
              </h4>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Every confirmed reservation issues a secure cryptographic digital QR pass that campus
                security and facility staff can scan in 1 second.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center mb-4">
                <BarChart className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Analytics & Reports
              </h4>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                High-resolution charts tracking venue utilization rate, department demand peaks, and
                predictive maintenance trends for college leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section B: Facilities Showcase */}
      <section id="facilities" className="border-b border-neutral-100 px-6 py-20 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Campus Venues
              </h2>
              <h3 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Facilities Designed for Excellence
              </h3>
            </div>
            <Link
              to="/facilities"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <span>View all 48 facilities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Seminar Hall A */}
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="h-48 overflow-hidden">
                <img
                  src="/src/assets/images/facility_seminar_hall_1790943322198.jpg"
                  alt="Seminar Hall A"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>Main Academic Block</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Available</span>
                </div>
                <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Seminar Hall A
                </h4>
                <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                  Capacity: 100 people · Tiered acoustic theater with dual laser projection.
                </p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-300">
                    100 Seats
                  </span>
                  <Link
                    to="/facilities/fac-sem-a"
                    className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Auditorium */}
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="h-48 overflow-hidden">
                <img
                  src="/src/assets/images/facility_auditorium_1790943308793.jpg"
                  alt="Main Auditorium"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>Auditorium Complex</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Available</span>
                </div>
                <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Main Auditorium
                </h4>
                <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                  Capacity: 650 people · Proscenium theater, concert sound, 4K screen.
                </p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-300">
                    650 Seats
                  </span>
                  <Link
                    to="/facilities/fac-aud-main"
                    className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Computer Lab 1 */}
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="h-48 overflow-hidden">
                <img
                  src="/src/assets/images/facility_computer_lab_1790943333710.jpg"
                  alt="Computer Lab 1"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>Computer Science Block</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Available</span>
                </div>
                <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Computer Lab 1
                </h4>
                <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                  Capacity: 60 people · High-performance workstation rigs with dual monitors.
                </p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-300">
                    60 Workstations
                  </span>
                  <Link
                    to="/facilities/fac-lab-cs1"
                    className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: How It Works */}
      <section id="how-it-works" className="border-b border-neutral-100 px-6 py-20 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Seamless 6-Step Flow
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              How CampusFlow Works
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              From discovering the ideal space to on-ground access, the entire journey is completely digitized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { num: '01', title: 'Choose a facility', desc: 'Browse curated auditoriums, labs, or seminar halls.' },
              { num: '02', title: 'Select date & time', desc: 'Real-time conflict detection validates availability.' },
              { num: '03', title: 'Add resources', desc: 'Select laser projectors, microphones, or chairs.' },
              { num: '04', title: 'Submit request', desc: 'One-click submission generates a tracking ID.' },
              { num: '05', title: 'Get approval', desc: 'Coordinator & HOD approve via digital workflow.' },
              { num: '06', title: 'Use QR verification', desc: 'Show digital pass at entrance for instant entry.' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="font-mono text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {step.num}
                </span>
                <h4 className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {step.title}
                </h4>
                <p className="mt-1.5 text-xs text-neutral-500 leading-normal">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section D: Smart Recommendation Preview */}
      <section id="recommendations" className="border-b border-neutral-100 px-6 py-20 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                  Smart Recommendation Engine
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Tell us what you are hosting. We find the perfect space.
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Our ranking engine matches audience size, necessary AV equipment, schedule constraints, and campus location so you never under or over-book.
                </p>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between border-b border-neutral-200 py-1.5 dark:border-neutral-700">
                    <span className="text-neutral-500">Event Scenario:</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">Technical Workshop</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 py-1.5 dark:border-neutral-700">
                    <span className="text-neutral-500">Participants:</span>
                    <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">80</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 py-1.5 dark:border-neutral-700">
                    <span className="text-neutral-500">Requirements:</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">Projector + Microphone + Wi-Fi</span>
                  </div>
                </div>

                <Link
                  to="/recommendations"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  <span>Launch Recommendation Engine</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Recommendation Card Outcome */}
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-800/80 dark:bg-neutral-850">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        #1 Recommended
                      </span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        Seminar Hall A
                      </span>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      96% Match
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800">
                      <p className="text-neutral-500 text-[10px]">Capacity</p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">100 Seats</p>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800">
                      <p className="text-neutral-500 text-[10px]">Projector</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">Available</p>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800">
                      <p className="text-neutral-500 text-[10px]">Microphone</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">Available</p>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800">
                      <p className="text-neutral-500 text-[10px]">Wi-Fi 6E</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">Available</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Capacity matches perfectly (80 attendees in 100 capacity hall)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Required audio/visual equipment installed natively</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Zero schedule conflicts on chosen workshop date</span>
                    </li>
                  </ul>

                  <div className="mt-5 flex gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      to="/facilities/fac-sem-a"
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      View Details
                    </Link>
                    <Link
                      to="/book?facility=fac-sem-a"
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Book This Facility
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section E: Footer */}
      <footer className="border-t border-neutral-200 bg-white px-6 py-12 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-white font-bold text-sm">
                CF
              </div>
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-100">
                CampusFlow
              </span>
            </div>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              Smart campus facility booking and resource management infrastructure for colleges and
              universities.
            </p>
            <p className="text-[11px] text-neutral-400">
              © {new Date().getFullYear()} CampusFlow System. All rights reserved.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
              Facilities
            </h5>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li><Link to="/facilities" className="hover:text-neutral-900 dark:hover:text-neutral-100">Seminar Halls</Link></li>
              <li><Link to="/facilities" className="hover:text-neutral-900 dark:hover:text-neutral-100">Main Auditorium</Link></li>
              <li><Link to="/facilities" className="hover:text-neutral-900 dark:hover:text-neutral-100">Computer Labs</Link></li>
              <li><Link to="/facilities" className="hover:text-neutral-900 dark:hover:text-neutral-100">Sports Grounds</Link></li>
              <li><Link to="/facilities" className="hover:text-neutral-900 dark:hover:text-neutral-100">Conference Rooms</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
              Platform
            </h5>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li><Link to="/calendar" className="hover:text-neutral-900 dark:hover:text-neutral-100">Master Calendar</Link></li>
              <li><Link to="/recommendations" className="hover:text-neutral-900 dark:hover:text-neutral-100">Recommendation Engine</Link></li>
              <li><Link to="/resources" className="hover:text-neutral-900 dark:hover:text-neutral-100">Resource Inventory</Link></li>
              <li><Link to="/campus-map" className="hover:text-neutral-900 dark:hover:text-neutral-100">Campus Map</Link></li>
              <li><Link to="/qr-verification" className="hover:text-neutral-900 dark:hover:text-neutral-100">QR Gate Verification</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
              Support & Legal
            </h5>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li><Link to="/help" className="hover:text-neutral-900 dark:hover:text-neutral-100">Help Center & FAQs</Link></li>
              <li><Link to="/help" className="hover:text-neutral-900 dark:hover:text-neutral-100">Contact Support</Link></li>
              <li><span className="cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100">Campus Terms</span></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
