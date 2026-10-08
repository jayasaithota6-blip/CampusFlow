import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Lock,
  User,
  Shield,
  Sliders,
  Check,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { success } = useToast();

  const [activeSection, setActiveSection] = useState<'Appearance' | 'Notifications' | 'Security' | 'Preferences'>('Appearance');

  // Preferences State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoReleaseExpired, setAutoReleaseExpired] = useState(true);

  const handleSave = () => {
    success('Settings Saved', 'Your system preferences have been updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Preferences & System Settings
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Configure notifications, theme aesthetics, and automated campus scheduling rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Tabs Column */}
        <div className="md:col-span-4 space-y-1">
          {[
            { id: 'Appearance', icon: Sun, label: 'Appearance & Theme' },
            { id: 'Notifications', icon: Bell, label: 'Notifications & Alerts' },
            { id: 'Security', icon: Lock, label: 'Security & Access' },
            { id: 'Preferences', icon: Sliders, label: 'Booking Automation' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`w-full flex items-center gap-3 rounded-xl p-3 text-xs font-semibold text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Column */}
        <div className="md:col-span-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-6 text-xs">
          {/* Appearance Section */}
          {activeSection === 'Appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Theme Appearance
                </h3>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Select your preferred desktop visual presentation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setTheme('light')}
                  className={`rounded-xl border p-4 cursor-pointer text-center space-y-3 transition-all ${
                    theme === 'light'
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-neutral-50 dark:bg-neutral-800'
                      : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800'
                  }`}
                >
                  <Sun className="mx-auto h-6 w-6 text-amber-500" />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      Light Mode
                    </span>
                    <span className="text-[11px] text-neutral-400">Crisp daytime readability</span>
                  </div>
                </div>

                <div
                  onClick={() => setTheme('dark')}
                  className={`rounded-xl border p-4 cursor-pointer text-center space-y-3 transition-all ${
                    theme === 'dark'
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-neutral-50 dark:bg-neutral-800'
                      : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800'
                  }`}
                >
                  <Moon className="mx-auto h-6 w-6 text-indigo-400" />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      Dark Mode
                    </span>
                    <span className="text-[11px] text-neutral-400">Low-glare night ambiance</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'Notifications' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Notification Dispatch Rules
                </h3>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Specify which events trigger immediate notifications.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      College Email Notifications
                    </span>
                    <span className="text-neutral-500 text-[11px]">
                      Send booking confirmations and PDF passes to your registered university address.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      Event Start Reminders
                    </span>
                    <span className="text-neutral-500 text-[11px]">
                      Receive automated alerts 2 hours prior to reservation start time.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={bookingReminders}
                    onChange={(e) => setBookingReminders(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      Approval & Review Status Shifts
                    </span>
                    <span className="text-neutral-500 text-[11px]">
                      Get notified whenever Coordinator or HOD issues a verdict.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={approvalAlerts}
                    onChange={(e) => setApprovalAlerts(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'Security' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Password & Security Policy
                </h3>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  University Single Sign-On (SSO) and authentication standards.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => success('Password Reset', 'SSO reset link dispatched to your student inbox.')}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Change SSO Password
                </button>
              </div>
            </div>
          )}

          {/* Booking Preferences */}
          {activeSection === 'Preferences' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Facility Scheduling Automation
                </h3>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Platform operational automation parameters.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                    Auto-Release Unconfirmed Slots
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    Automatically reclaim facilities if organizer does not check-in within 30 minutes of start.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoReleaseExpired}
                  onChange={(e) => setAutoReleaseExpired(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <button
              onClick={handleSave}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
