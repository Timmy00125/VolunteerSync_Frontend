import { User } from './user.model';
import { SkillProficiency } from './skill.model';


// Core Event interface matching GraphQL schema
export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  organizer: User;
  organizerId: string;
  status: EventStatus;
  startTime: Date;
  endTime: Date;
  location: EventLocation;
  capacity: EventCapacity;
  requirements: EventRequirements;
  category: EventCategory;
  timeCommitment: TimeCommitmentType;
  tags: string[];
  slug?: string;
  shareURL?: string;
  recurrenceRule?: RecurrenceRule;
  registrationSettings: RegistrationSettings;
  images: EventImage[];
  announcements: EventAnnouncement[];
  createdAt: Date;
  updatedAt: Date;

  // Computed fields
  currentRegistrations: number;
  availableSpots: number;
  isAtCapacity: boolean;
  canRegister: boolean;
}

export interface EventLocation {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  coordinates?: Coordinates;
  instructions?: string;
  isRemote: boolean;
}

export interface EventCapacity {
  minimum: number;
  maximum: number;
  current: number;
  waitlistEnabled: boolean;
}

export interface EventRequirements {
  minimumAge?: number;
  backgroundCheck: boolean;
  physicalRequirements?: string;
  skills: SkillRequirement[];
  training: TrainingRequirement[];
  interests: string[];
}

export interface SkillRequirement {
  id: string;
  skill: string;
  proficiency: SkillProficiency;
  required: boolean;
}

export interface TrainingRequirement {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  providedByOrganizer: boolean;
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  endDate?: Date;
  occurrenceCount?: number;
}

export interface RegistrationSettings {
  opensAt?: Date;
  closesAt: Date;
  requiresApproval: boolean;
  allowWaitlist: boolean;
  confirmationRequired: boolean;
  cancellationDeadline?: Date;
}

export interface EventImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface EventAnnouncement {
  id: string;
  title: string;
  content: string;
  isUrgent: boolean;
  createdAt: Date;
}

export interface EventUpdate {
  id: string;
  updatedBy: User;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  updateType: UpdateType;
  createdAt: Date;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// Connection types for pagination
export interface EventConnection {
  edges: EventEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface EventEdge {
  node: Event;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

// Input types for mutations
export interface CreateEventInput {
  title: string;
  description: string;
  shortDescription?: string;
  startTime: Date;
  endTime: Date;
  location: EventLocationInput;
  capacity: EventCapacityInput;
  requirements?: EventRequirementsInput;
  tags?: string[];
  category: EventCategory;
  timeCommitment: TimeCommitmentType;
  recurrenceRule?: RecurrenceRuleInput;
  registrationSettings: RegistrationSettingsInput;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  shortDescription?: string;
  location?: EventLocationInput;
  requirements?: EventRequirementsInput;
  tags?: string[];
  category?: EventCategory;
}

export interface EventLocationInput {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  coordinates?: CoordinatesInput;
  instructions?: string;
  isRemote: boolean;
}

export interface CoordinatesInput {
  lat: number;
  lng: number;
}

export interface EventCapacityInput {
  minimum: number;
  maximum: number;
  waitlistEnabled: boolean;
}

export interface EventRequirementsInput {
  minimumAge?: number;
  backgroundCheck: boolean;
  physicalRequirements?: string;
  skills?: SkillRequirementInput[];
  training?: TrainingRequirementInput[];
  interests?: string[];
}

export interface SkillRequirementInput {
  skill: string;
  proficiency: SkillProficiency;
  required: boolean;
}

export interface TrainingRequirementInput {
  name: string;
  description?: string;
  required: boolean;
  providedByOrganizer: boolean;
}

export interface RecurrenceRuleInput {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  endDate?: Date;
  occurrenceCount?: number;
}

export interface RegistrationSettingsInput {
  opensAt?: Date;
  closesAt: Date;
  requiresApproval: boolean;
  allowWaitlist: boolean;
  confirmationRequired: boolean;
  cancellationDeadline?: Date;
}

export interface EventSearchFilter {
  query?: string;
  status?: EventStatus[];
  category?: EventCategory[];
  timeCommitment?: TimeCommitmentType[];
  organizerId?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  location?: LocationSearchInput;
  skills?: string[];
  interests?: string[];
  requiresBackgroundCheck?: boolean;
  minimumAge?: number;
}

export interface LocationSearchInput {
  city?: string;
  state?: string;
  country?: string;
  radius?: number;
  coordinates?: CoordinatesInput;
}

export interface EventSortInput {
  field: EventSortField;
  direction: SortDirection;
}

// Enums matching GraphQL schema
export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum EventCategory {
  COMMUNITY_SERVICE = 'COMMUNITY_SERVICE',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  EDUCATION = 'EDUCATION',
  HEALTH_WELLNESS = 'HEALTH_WELLNESS',
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  ANIMAL_WELFARE = 'ANIMAL_WELFARE',
  ARTS_CULTURE = 'ARTS_CULTURE',
  TECHNOLOGY = 'TECHNOLOGY',
  SPORTS_RECREATION = 'SPORTS_RECREATION',
  FOOD_HUNGER = 'FOOD_HUNGER',
  YOUTH_DEVELOPMENT = 'YOUTH_DEVELOPMENT',
  SENIOR_CARE = 'SENIOR_CARE',
  HOMELESS_SERVICES = 'HOMELESS_SERVICES',
  FUNDRAISING = 'FUNDRAISING',
  ADVOCACY = 'ADVOCACY',
  OTHER = 'OTHER',
}

export enum TimeCommitmentType {
  ONE_TIME = 'ONE_TIME',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  SEASONAL = 'SEASONAL',
  ONGOING = 'ONGOING',
}

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

export enum UpdateType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum EventSortField {
  CREATED_AT = 'CREATED_AT',
  START_TIME = 'START_TIME',
  TITLE = 'TITLE',
  CAPACITY = 'CAPACITY',
  REGISTRATION_COUNT = 'REGISTRATION_COUNT',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}


