export type UserRole =
  | 'student'
  | 'faculty'
  | 'club'
  | 'coordinator'
  | 'hod'
  | 'admin'
  | 'facility_manager';

export type FacilityType =
  | 'Auditorium'
  | 'Seminar Hall'
  | 'Classroom'
  | 'Computer Lab'
  | 'Laboratory'
  | 'Sports Ground'
  | 'Meeting Room';

export type FacilityStatus = 'Available' | 'Booked' | 'Under Maintenance' | 'Restricted';

export type BookingStatus =
  | 'Draft'
  | 'Pending'
  | 'Under Review'
  | 'Coordinator Approved'
  | 'HOD Approved'
  | 'Admin Approved'
  | 'Confirmed'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed';

export type EventType =
  | 'Workshop'
  | 'Seminar'
  | 'Meeting'
  | 'Cultural Event'
  | 'Sports Event'
  | 'Examination'
  | 'Club Activity'
  | 'Other';

export interface User {
  id: string;
  collegeId?: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone?: string;
  avatar?: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  password?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  building: string;
  floor: string;
  capacity: number;
  status: FacilityStatus;
  rating: number;
  reviewCount: number;
  hourlyRate?: number;
  imageUrl: string;
  description: string;
  amenities: string[];
  accessibility: string[];
  maintenanceNotice?: string;
}

export interface Resource {
  id: string;
  name: string;
  category: 'Audio/Visual' | 'Computing' | 'Furniture' | 'Electrical' | 'Accessories';
  totalQuantity: number;
  availableQuantity: number;
  bookedQuantity: number;
  maintenanceQuantity: number;
  status: 'Available' | 'Low Stock' | 'Unavailable' | 'Maintenance';
  location: string;
}

export interface BookingResourceItem {
  resourceId: string;
  name: string;
  quantity: number;
}

export interface ApprovalStep {
  role: 'student' | 'coordinator' | 'hod' | 'admin' | 'facility_manager';
  label: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  updatedAt?: string;
  actorName?: string;
  comments?: string;
}

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityType: FacilityType;
  building: string;
  eventName: string;
  eventType: EventType;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h or 12h)
  endTime: string;
  participants: number;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  department: string;
  status: BookingStatus;
  resources: BookingResourceItem[];
  approvalHierarchy: ApprovalStep[];
  rejectionReason?: string;
  reviewerNotes?: string;
  qrCodeToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTicket {
  id: string;
  itemType: 'Facility' | 'Resource';
  itemId: string;
  itemName: string;
  location: string;
  reason: string;
  startDate: string;
  expectedCompletionDate: string;
  status: 'In Progress' | 'Scheduled' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTechnician?: string;
  notes?: string;
  reportedBy: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  coordinatorName: string;
  coordinatorEmail: string;
  hodName: string;
  totalBookings: number;
  upcomingEvents: number;
  usagePercentage: number;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  category: 'Booking' | 'Approval' | 'Facility' | 'Maintenance' | 'System';
  title: string;
  message: string;
  timeAgo: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  conflictReason?: string;
  suggestedAlternativeTimes?: { startTime: string; endTime: string }[];
  unavailableResources?: { name: string; requested: number; available: number }[];
}

export interface SmartRecommendationQuery {
  eventType: EventType;
  participants: number;
  requiredEquipment: string[];
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime: string;
}

export interface RecommendationResult {
  facility: Facility;
  matchScore: number;
  reasons: string[];
  isAvailable: boolean;
}
