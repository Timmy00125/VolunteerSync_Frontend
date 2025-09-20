import { User } from './user.model';
import { UserSkill, SkillProficiency } from './skill.model';
import { Interest, InterestCategory } from './interest.model';

// Forward declaration to avoid circular imports
export interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  // Add other essential Event fields as needed
}

// Registration interface matching GraphQL schema
export interface Registration {
  id: string;
  user: User;
  event: Event;
  status: RegistrationStatus;
  personalMessage?: string;
  skills: UserSkill[];
  interests: Interest[];
  appliedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  checkedInAt?: Date;
  completedAt?: Date;
  waitlistPosition?: number;
  approvalNotes?: string;
  cancellationReason?: string;
  attendanceStatus: AttendanceStatus;
  canCancel: boolean;
  canCheckIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaitlistEntry {
  id: string;
  registration: Registration;
  position: number;
  estimatedPromotionTime?: Date;
  promotionOfferedAt?: Date;
  promotionExpiresAt?: Date;
  autoPromote: boolean;
}

export interface RegistrationConflict {
  conflictingEvent: Event;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  suggestions: Event[];
}

export interface AttendanceRecord {
  registration: Registration;
  checkedInAt?: Date;
  checkedInBy?: User;
  notes?: string;
}

export interface RegistrationStats {
  totalRegistrations: number;
  confirmedRegistrations: number;
  waitlistCount: number;
  attendanceRate: number;
  noShowRate: number;
  cancellationRate: number;
}

export interface RegistrationSummary {
  totalRegistrations: number;
  activeRegistrations: number;
  cancelledRegistrations: number;
  attendedEvents: number;
  upcomingEvents: number;
}

export interface RegistrationFilter {
  userId?: string;
  eventId?: string;
  status?: RegistrationStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Input types for registration mutations
export interface RegisterForEventInput {
  eventId: string;
  personalMessage?: string;
  emergencyContact?: EmergencyContactInput;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
}

export interface BulkRegistrationInput {
  eventIds: string[];
  personalMessage?: string;
  skipConflicts?: boolean;
}

export interface ApprovalDecisionInput {
  registrationId: string;
  approved: boolean;
  notes?: string;
  conditions?: string[];
}

export interface AttendanceInput {
  registrationId: string;
  status: AttendanceStatus;
  notes?: string;
  checkedInAt?: Date;
}

export interface RegistrationFilterInput {
  eventId?: string;
  userId?: string;
  status?: RegistrationStatus[];
  dateRange?: DateRangeInput;
  attendanceStatus?: AttendanceStatus[];
}

export interface EmergencyContactInput {
  name: string;
  phone: string;
}

export interface DateRangeInput {
  start: Date;
  end: Date;
}

// Enums matching GraphQL schema
export enum RegistrationStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  CONFIRMED = 'CONFIRMED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
  DECLINED = 'DECLINED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED',
}

export enum AttendanceStatus {
  REGISTERED = 'REGISTERED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
}

export enum ConflictType {
  TIME_OVERLAP = 'TIME_OVERLAP',
  LOCATION_CONFLICT = 'LOCATION_CONFLICT',
  TRAVEL_TIME_CONFLICT = 'TRAVEL_TIME_CONFLICT',
  SKILL_OVERCOMMITMENT = 'SKILL_OVERCOMMITMENT',
}

export enum ConflictSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface EventRegistrationUpdate {
  eventId: string;
  registeredCount: number;
  registration: Registration;
}
