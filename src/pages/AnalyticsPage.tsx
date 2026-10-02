import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Building,
  Users,
  Clock,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { analyticsService, AnalyticsSummary } from '../services/analyticsService';
import { LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedFacility, setSelectedFacility] = useState('All');
  const [selectedEventType, setSelectedEventType] = useState('All');

  const { success } = useToast();

  useEffect(() => {
    analyticsService.getMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Metric,Value\nTotal Bookings,528\nCompleted,342\nCancelled,18\nAverage Duration,2.8 Hours\nFacility Utilization,74.2%\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusFlow_Analytics_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('Report Exported', 'Campus executive analytics CSV downloaded successfully.');
  };

  if (loading || !metrics) {
    return <LoadingState message="Calculating university performance indices..." />;
  }

  // Weekly bookings trend
  const weeklyTrend = [
    { week: 'Week 1', bookings: 24, completed: 22 },
    { week: 'Week 2', bookings: 35, completed: 31 },
    { week: 'Week 3', bookings: 42, completed: 39 },
    { week: 'Week 4', bookings: 38, completed: 36 },
  ];

  // Cancellation and rejection rate trend
  const cancellationData = [
    { month: 'May', rate: 4.2 },
    { month: 'Jun', rate: 3.8 },
    { month: 'Jul', rate: 2.9 },
    { month: 'Aug', rate: 3.5 },
    { month: 'Sep', rate: 2.1 },
    { month: 'Oct', rate: 1.8 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Campus Facility & Resource Analytics
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Statistical breakdown of space demand, cancellation ratios, and multi-department scheduling density.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Report (CSV)</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
            Date Window
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-neutral-50 p-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 3 Months">Last 3 Months</option>
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="Academic Year 2026">Academic Year 2026</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
            Department
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-neutral-50 p-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="MBA">MBA Management</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
            Facility Type
          </label>
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-neutral-50 p-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="All">All Facilities</option>
            <option value="Seminar Halls">Seminar Halls</option>
            <option value="Auditorium">Auditorium</option>
            <option value="Labs">Computer Labs</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
            Event Type
          </label>
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-neutral-50 p-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="All">All Events</option>
            <option value="Workshop">Workshops</option>
            <option value="Seminar">Seminars</option>
            <option value="Examinations">Examinations</option>
          </select>
        </div>
      </div>

      {/* Metrics Row (7 Metrics requested) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-500 block truncate">Total Bookings</span>
          <p className="font-mono text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
            {metrics.totalBookings}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-500 block truncate">Completed</span>
          <p className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.completedBookings}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-500 block truncate">Cancelled</span>
          <p className="font-mono text-xl font-bold text-neutral-600 dark:text-neutral-400 mt-1">
            18
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-500 block truncate">Rejected</span>
          <p className="font-mono text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            12
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-500 block truncate">Avg Duration</span>
          <p className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics.averageDurationHours} hrs
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-500 block truncate">Facility Util.</span>
          <p className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.overallUtilizationRate}%
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-500 block truncate">Resource Util.</span>
          <p className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            64.5%
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Bookings vs Completed */}
        <div className="lg:col-span-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Weekly Booking Throughput
            </h3>
            <p className="text-[11px] text-neutral-500">Reservations made vs sessions concluded</p>
          </div>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="bookings" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Requested" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cancellation Rate Trend */}
        <div className="lg:col-span-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Cancellation Rate Trend (%)
            </h3>
            <p className="text-[11px] text-neutral-500">Monthly dropped reservations ratio</p>
          </div>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cancellationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  name="Cancellation %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
