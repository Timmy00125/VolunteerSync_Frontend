export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  roles: string[];
  // Phase 3 optional fields
  profile?: UserProfile;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  skills: Skill[];
  availability?: Availability;
  preferences?: UserPreferences;
  contactInfo?: ContactInfo;
  emergencyContact?: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  verified: boolean;
}

export interface Availability {
  weekdays: WeekdayAvailability[];
  timeZone: string;
  maxHoursPerWeek?: number;
  unavailableDates: Date[];
}

export interface WeekdayAvailability {
  day: WeekDay;
  available: boolean;
  startTime?: string;
  endTime?: string;
}

export interface UserPreferences {
  eventTypes: string[];
  maxTravelDistance?: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderPreferences: ReminderSettings;
}

export interface ReminderSettings {
  enabled: boolean;
  hours: number[];
  methods: NotificationMethod[];
}

export interface ContactInfo {
  phone?: string;
  alternateEmail?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Enums
export enum UserRole {
  VOLUNTEER = 'VOLUNTEER',
  COORDINATOR = 'ORGANIZER',
  ADMIN = 'ADMIN',
}

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  COMMUNICATION = 'COMMUNICATION',
  LEADERSHIP = 'LEADERSHIP',
  PHYSICAL = 'PHYSICAL',
  CREATIVE = 'CREATIVE',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum WeekDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum NotificationMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  UNAVAILABLE = 'UNAVAILABLE',
}

// Input types for mutations
export interface UpdateProfileInput {
  bio?: string;
  timeZone?: string;
  maxHoursPerWeek?: number;
}

export interface SkillInput {
  id?: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}

export interface AvailabilityInput {
  weekdays: WeekdayAvailabilityInput[];
  timeZone: string;
  maxHoursPerWeek?: number;
  unavailableDates: Date[];
}

export interface WeekdayAvailabilityInput {
  day: WeekDay;
  available: boolean;
  startTime?: string;
  endTime?: string;
}

export interface PreferencesInput {
  eventTypes: string[];
  maxTravelDistance?: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderPreferences: ReminderSettingsInput;
}

export interface ReminderSettingsInput {
  enabled: boolean;
  hours: number[];
  methods: NotificationMethod[];
}

export interface ContactInfoInput {
  phone?: string;
  alternateEmail?: string;
  address?: AddressInput;
}

export interface AddressInput {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
