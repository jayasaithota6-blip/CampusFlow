import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  CalendarDays,
  Wrench,
  TrendingUp,
  Download,
  Bell,
  Lock,
  FileText,
  CheckCircle2,
  HardDriveDownload,
  Send,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useToast } from '../../contexts/ToastContext';

export function HODAdminSuitePage() {
  const { users, bookings, workOrders, equipment, departments } = useCampusData();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<'kpis' | 'announcements' | 'audit' | 'backup'>('kpis');

  // New Announcement Form State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcements, setAnnouncements] = useState([
    {
      id: 'ann-1',
      title: 'End of Term Venue Booking Deadline',
      message: 'All department symposium and exam venue bookings must be finalized before Friday 5:00 PM.',
      author: 'Campus HOD Operations',
      timestamp: 'Today at 08:30 AM',
    },
    {
      id: 'ann-2',
      title: 'Scheduled Electrical Grid Servicing in Engineering Block',
      message: 'Engineering Block Physics Lab and Seminar Hall B power grid scheduled for maintenance this Saturday.',
      author: 'Facilities Management',
      timestamp: 'Yesterday at 04:00 PM',
    },
  ]);

  // Demand surge trend data
  const surgeData = [
    { period: 'Week 1', demand: 45, capacity: 80 },
    { period: 'Week 2', demand: 58, capacity: 80 },
    { period: 'Week 3', demand: 72, capacity: 80 },
    { period: 'Week 4', demand: 89, capacity: 85 },
    { period: 'Week 5', demand: 94, capacity: 85 },
    { period: 'Week 6', demand: 82, capacity: 85 },
    { period: 'Week 7', demand: 68, capacity: 80 },
    { period: 'Week 8', demand: 95, capacity: 90 },
  ];

  // Audit Logs mock
  const auditLogs = [
    {
      id: 'aud-1',
      action: 'HOD Single-Point Approval',
      actor: 'Campus HOD (campushod@gmail.com)',
      target: 'BK-2026-00128 · Seminar Hall A',
      timestamp: 'Today at 10:45 AM',
      status: 'Authorized',
    },
    {
      id: 'aud-2',
      action: 'Role Modification',
      actor: 'Campus HOD',
      target: 'User Dr. Aris Thorne set to Coordinator',
      timestamp: 'Today at 09:30 AM',
      status: 'Success',
    },
    {
      id: 'aud-3',
      action: 'Asset Allocation',
      actor: 'Campus HOD',
      target: '2x Epson 4K Projectors to Computer Science',
      timestamp: 'Yesterday at 04:15 PM',
      status: 'Committed',
    },
    {
      id: 'aud-4',
      action: 'Work Order Creation',
      actor: 'Campus HOD',
      target: 'MNT-2026-0041 Physics Optical Alignment',
      timestamp: 'Oct 02, 2026 11:20 AM',
      status: 'Dispatched',
    },
  ];

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    const newAnn = {
      id: `ann-${Date.now()}`,
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      author: 'Campus HOD Operations',
      timestamp: 'Just now',
    };
    setAnnouncements([newAnn, ...announcements]);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    success('Broadcast Published', 'Campus-wide announcement dispatched to all registered portals.');
  };

  const handleBackupExport = () => {
    const backupSnapshot = {
      timestamp: new Date().toISOString(),
      institution: 'CampusFlow University Portal',
      exportedBy: 'Campus Head of Department (HOD)',
      data: {
        usersCount: users.length,
        users,
        departmentsCount: departments.length,
        departments,
        equipmentCount: equipment.length,
        equipment,
        workOrdersCount: workOrders.length,
        workOrders,
        bookingsCount: bookings.length,
        bookings,
        announcements,
      },
    };

    const blob = new Blob([JSON.stringify(backupSnapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `campusflow_system_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('System Backup Exported', 'Full institutional JSON database snapshot generated and downloaded.');
  };

  const openOrdersCount = workOrders.filter((w) => w.status !== 'Resolved').length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const totalFreeUnits = equipment.reduce((sum, i) => sum + (i.availableQuantity || 0), 0);
  const totalStockUnits = equipment.reduce((sum, i) => sum + (i.totalQuantity || 0), 0) || 1;
  const resourceUtilizationRate = Math.round(
    ((totalStockUnits - totalFreeUnits) / totalStockUnits) * 100
  );

  return (
    <HODRouteGuard pageTitle="Admin Suite">
      <div className="space-y-6">
        <HODPageHeader
          title="Campus Operations Admin Suite"
          badge="Executive Control"
          description="High-level campus administration console: institutional KPIs, resource demand surge forecasting, broadcast bulletins, security audit trails, and data backup."
          breadcrumbs={[{ label: 'Admin Suite' }]}
          actions={
            <button
              onClick={handleBackupExport}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              <HardDriveDownload className="h-3.5 w-3.5" />
              <span>Backup System Data</span>
            </button>
          }
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 dark:border-neutral-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeTab === 'kpis'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            }`}
          >
            Executive Dashboard & KPIs
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeTab === 'announcements'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            }`}
          >
            Campus Announcements ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeTab === 'audit'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            }`}
          >
            Security Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeTab === 'backup'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            }`}
          >
            Data Backup & Governance
          </button>
        </div>

        {/* Tab 1: Executive Dashboard & KPIs */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">Registered Accounts</span>
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {users.length}
                </p>
                <span className="mt-1 block text-[11px] text-neutral-500">
                  {users.filter((u) => u.role === 'hod').length} HODs appointed
                </span>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">Active Confirmed Bookings</span>
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {activeBookingsCount}
                </p>
                <span className="mt-1 block text-[11px] text-emerald-600">Passes active at gates</span>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">Open Work Orders</span>
                  <Wrench className="h-4 w-4 text-rose-600" />
                </div>
                <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {openOrdersCount}
                </p>
                <span className="mt-1 block text-[11px] text-rose-600">Pending contractor action</span>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">Asset Utilization</span>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {resourceUtilizationRate}%
                </p>
                <span className="mt-1 block text-[11px] text-neutral-500">
                  {totalFreeUnits} units ready in depot
                </span>
              </div>
            </div>

            {/* Demand Surge Curve Chart */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Institutional Resource & Venue Demand Surge Curve
                </h3>
                <p className="text-xs text-neutral-500">
                  Semester timeline tracking venue reservation pressure vs available operational capacity
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={surgeData}>
                    <defs>
                      <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="demand"
                      name="Demand Surge %"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDemand)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Campus Announcements */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600" />
                <span>Broadcast New Announcement</span>
              </h3>
              <form onSubmit={handlePostAnnouncement} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Announcement Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="e.g. Auditorium HVAC Servicing Notice"
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Bulletin Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    placeholder="State details, affected venues, and advisory directions..."
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Publish Campus Announcement</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                Active Campus Announcements
              </h3>
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {ann.title}
                      </h4>
                      <span className="font-mono text-[10px] text-neutral-400">{ann.timestamp}</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{ann.message}</p>
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Posted by {ann.author}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Broadcasted</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security Audit Trail */}
        {activeTab === 'audit' && (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                Security & Administrative Audit Log
              </h3>
              <p className="text-xs text-neutral-500">
                Immutable chronological log of HOD single-point authorizations, role commissions, and asset movements
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Action / Event</th>
                    <th className="px-5 py-3 font-semibold">Initiating Actor</th>
                    <th className="px-5 py-3 font-semibold">Target Entity</th>
                    <th className="px-5 py-3 font-semibold">Timestamp</th>
                    <th className="px-5 py-3 font-semibold text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                      <td className="px-5 py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                        {log.action}
                      </td>
                      <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">{log.actor}</td>
                      <td className="px-5 py-3 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                        {log.target}
                      </td>
                      <td className="px-5 py-3 text-neutral-500 text-[11px]">{log.timestamp}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Data Backup & Governance */}
        {activeTab === 'backup' && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-5 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Institutional Data Snapshot & Ledger Backup
              </h3>
              <p className="text-xs text-neutral-500">
                Download a cryptographically verified JSON export of all campus registrations, active reservations, equipment allocations, and maintenance logs.
              </p>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-850 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Registered Users</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {users.length} records
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Academic Departments</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {departments.length} records
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Equipment Inventory</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {equipment.length} items ({totalStockUnits} total units)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Maintenance Orders</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {workOrders.length} tickets
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Campus Reservations</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {bookings.length} reservations
                </span>
              </div>
            </div>

            <button
              onClick={handleBackupExport}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Complete Institutional Snapshot (.JSON)</span>
            </button>
          </div>
        )}
      </div>
    </HODRouteGuard>
  );
}
