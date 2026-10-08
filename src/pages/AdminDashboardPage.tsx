import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  Clock,
  Package,
  Wrench,
  ArrowUpRight,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { analyticsService, AnalyticsSummary } from '../services/analyticsService';
import { bookingService } from '../services/bookingService';
import { maintenanceService } from '../services/maintenanceService';
import { Booking, MaintenanceTicket } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { LoadingState } from '../components/common/EmptyState';

const PIE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentMaintenance, setRecentMaintenance] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const [data, bookings, maintenance] = await Promise.all([
      analyticsService.getMetrics(),
      bookingService.getAll(),
      maintenanceService.getAll(),
    ]);
    setMetrics(data);
    setRecentBookings(bookings.slice(0, 5));
    setRecentMaintenance(maintenance.slice(0, 3));
    setLoading(false);
  };

  if (loading || !metrics) {
    return <LoadingState message="Aggregating campus administrative telemetry..." />;
  }

  // Peak booking hours mock data
  const peakHours = [
    { hour: '08:00 AM', density: 35 },
    { hour: '09:00 AM', density: 65 },
    { hour: '10:00 AM', density: 95 },
    { hour: '11:00 AM', density: 90 },
    { hour: '12:00 PM', density: 40 },
    { hour: '01:00 PM', density: 30 },
    { hour: '02:00 PM', density: 85 },
    { hour: '03:00 PM', density: 80 },
    { hour: '04:00 PM', density: 75 },
    { hour: '05:00 PM', density: 50 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Campus Administration Console
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Real-time venue utilization, resource demand telemetry, and maintenance surveillance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <span>Detailed Analytics</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/book"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <span>Create Reservation</span>
          </Link>
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Total Facilities</span>
            <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            48
          </p>
          <span className="mt-1 block text-[10px] text-emerald-600 dark:text-emerald-400">
            {metrics.activeFacilities} online & active
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Active Bookings</span>
            <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {metrics.totalBookings}
          </p>
          <span className="mt-1 block text-[10px] text-neutral-500">Across 5 departments</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Pending Approvals</span>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
            {metrics.pendingApprovals}
          </p>
          <Link to="/approvals" className="mt-1 block text-[10px] text-indigo-600 hover:underline">
            Review queue →
          </Link>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Resources Tracked</span>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            525
          </p>
          <span className="mt-1 block text-[10px] text-neutral-500">Hardware & furniture</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Maintenance Issues</span>
            <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-orange-600 dark:text-orange-400">
            {metrics.underMaintenance}
          </p>
          <Link to="/maintenance" className="mt-1 block text-[10px] text-neutral-500 hover:underline">
            Manage work orders →
          </Link>
        </div>
      </div>

      {/* Chart Row 1: Bookings Over Time (Line) & Facility Distribution (Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bookings Over Time Line Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Bookings Over Time
              </h3>
              <p className="text-[11px] text-neutral-500">
                Monthly reservations and confirmed administrative clearances
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +28% this semester
            </span>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.bookingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  name="Total Bookings"
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Approved"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facility Type Donut Distribution */}
        <div className="lg:col-span-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between">
          <div className="pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Venue Distribution
            </h3>
            <p className="text-[11px] text-neutral-500">Allocation breakdown by space genre</p>
          </div>

          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.facilityTypeDistribution}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {metrics.facilityTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400">
            {metrics.facilityTypeDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="truncate">{item.name}</span>
                <span className="font-mono font-semibold ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Row 2: Department Usage (Bar) & Facility Popularity Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Usage Bar Chart */}
        <div className="lg:col-span-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Department Booking Volume
            </h3>
            <p className="text-[11px] text-neutral-500">
              Total reservations made per academic department
            </p>
          </div>

          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.departmentUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facility Popularity & Utilization Meters */}
        <div className="lg:col-span-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Facility Utilization Rates
              </h3>
              <p className="text-[11px] text-neutral-500">Most utilized venues across campus</p>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Avg: {metrics.overallUtilizationRate}%
            </span>
          </div>

          <div className="space-y-4 pt-3 text-xs">
            {metrics.facilityPopularity.slice(0, 4).map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {f.name}
                  </span>
                  <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
                    {f.rate}% Utilization
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      f.rate > 80
                        ? 'bg-emerald-500'
                        : f.rate > 60
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${f.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Peak Booking Hours Heatmap Grid & Resource Utilization Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Peak Booking Hours Grid */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Peak Booking Hours Distribution
            </h3>
            <p className="text-[11px] text-neutral-500">
              Occupancy density across standard operating hours
            </p>
          </div>

          <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-2 text-center text-xs">
            {peakHours.map((h, idx) => {
              const intensity = h.density;
              return (
                <div key={idx} className="space-y-1.5">
                  <div
                    className="h-20 w-full rounded-lg flex items-end justify-center pb-2 text-[10px] font-mono font-bold transition-all"
                    style={{
                      backgroundColor:
                        intensity > 85
                          ? '#4338ca'
                          : intensity > 60
                          ? '#6366f1'
                          : intensity > 40
                          ? '#a5b4fc'
                          : '#e0e7ff',
                      color: intensity > 50 ? '#ffffff' : '#1e1b4b',
                    }}
                  >
                    {intensity}%
                  </div>
                  <span className="block text-[10px] text-neutral-500 truncate">{h.hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resource Utilization Meters */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Hardware Asset In-Use Meters
            </h3>
            <p className="text-[11px] text-neutral-500">Concurrent active hardware dispatch</p>
          </div>

          <div className="space-y-3.5 pt-3 text-xs">
            {metrics.resourceUtilization.slice(0, 4).map((res, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {res.name}
                  </span>
                  <span className="font-mono text-neutral-500">
                    {res.inUse} of {res.total} in use ({res.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                    style={{ width: `${res.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Bookings Table & Maintenance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-8 rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Recent Bookings Stream
              </h3>
              <p className="text-[11px] text-neutral-500">Latest reservations across faculties</p>
            </div>
            <Link to="/my-bookings" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/70 text-neutral-500 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">ID</th>
                  <th className="px-5 py-2.5 font-semibold">Venue</th>
                  <th className="px-5 py-2.5 font-semibold">Event</th>
                  <th className="px-5 py-2.5 font-semibold">Date & Time</th>
                  <th className="px-5 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                    <td className="px-5 py-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {b.id}
                    </td>
                    <td className="px-5 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                      {b.facilityName}
                    </td>
                    <td className="px-5 py-3 truncate max-w-xs text-neutral-600 dark:text-neutral-300">
                      {b.eventName}
                    </td>
                    <td className="px-5 py-3 font-mono text-neutral-500 whitespace-nowrap">
                      {b.date} ({b.startTime})
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="lg:col-span-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Active Maintenance Alerts
              </h3>
              <Link to="/maintenance" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                Manage
              </Link>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 pt-2">
              {recentMaintenance.map((m) => (
                <div key={m.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {m.itemName}
                    </span>
                    <span className="font-mono text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase">
                      {m.priority}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-[11px] line-clamp-2">{m.reason}</p>
                  <p className="font-mono text-[10px] text-neutral-400">
                    Target: {m.expectedCompletionDate}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/maintenance"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <span>Open Maintenance Board</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
