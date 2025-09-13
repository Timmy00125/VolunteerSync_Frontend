export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  roles: string[];
  // Phase 3 optional fields
  profile?: UserProfile;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  bio?: string;
  skills?: string[];
  availability?: AvailabilityStatus;
  phone?: string;
  location?: string;
  emergencyContact?: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export enum UserRole {
  VOLUNTEER = 'VOLUNTEER',
  COORDINATOR = 'ORGANIZER',
  ADMIN = 'ADMIN',
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  UNAVAILABLE = 'UNAVAILABLE',
}
