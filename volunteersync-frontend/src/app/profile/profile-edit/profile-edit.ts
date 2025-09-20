import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Models
import {
  UserProfile,
  UpdateProfileInput,
  PreferencesInput,
  ContactInfoInput,
  NotificationMethod,
  Skill,
  Availability,
  SkillInput,
  AvailabilityInput,
} from '../../shared/models/user.model';

// Services
import { ProfileService } from '../services/profile';
import { AuthService } from '../../auth/services/auth';

// Child Components
import { SkillSelector } from '../skill-selector/skill-selector';
import { AvailabilityEditor } from '../availability-editor/availability-editor';

@Component({
  selector: 'app-profile-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    SkillSelector,
    AvailabilityEditor,
  ],
  templateUrl: './profile-edit.html',
  styleUrls: [],
})
export class ProfileEditComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Component state
  profile = signal<UserProfile | null>(null);
  isSaving = signal(false);
  activeTab = signal(0);

  // Forms
  profileForm: FormGroup;

  // Computed properties
  isLoading = computed(() => this.profileService.isLoading());
  error = computed(() => this.profileService.error());

  constructor() {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      bio: ['', [Validators.maxLength(500)]],
      // Contact Info
      phone: [''],
      alternateEmail: ['', [Validators.email]],
      street: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: [''],
      // Preferences
      emailNotifications: [true],
      smsNotifications: [false],
      maxTravelDistance: [null, [Validators.min(1)]],
      eventReminders: [true],
      deadlineReminders: [true],
      weeklyDigest: [false],
    });
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.populateForm(profile);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      },
    });
  }

  private populateForm(profile: UserProfile): void {
    this.profileForm.patchValue({
      bio: profile.bio || '',
      phone: profile.contactInfo?.phone || '',
      alternateEmail: profile.contactInfo?.alternateEmail || '',
      street: profile.contactInfo?.address?.street || '',
      city: profile.contactInfo?.address?.city || '',
      state: profile.contactInfo?.address?.state || '',
      zipCode: profile.contactInfo?.address?.zipCode || '',
      country: profile.contactInfo?.address?.country || '',
      emailNotifications: profile.preferences?.emailNotifications ?? true,
      smsNotifications: profile.preferences?.smsNotifications ?? false,
      maxTravelDistance: profile.preferences?.maxTravelDistance || null,
      eventReminders: profile.preferences?.reminderPreferences?.enabled ?? true,
      deadlineReminders: profile.preferences?.reminderPreferences?.enabled ?? true,
      weeklyDigest: profile.preferences?.reminderPreferences?.enabled ?? false,
    });
  }

  onSkillsChanged(skills: Skill[]): void {
    // Update the profile with new skills
    const currentProfile = this.profile();
    if (currentProfile) {
      this.profile.set({
        ...currentProfile,
        skills,
      });
    }
  }

  onAvailabilityChanged(availability: Availability): void {
    // Update the profile with new availability
    const currentProfile = this.profile();
    if (currentProfile) {
      this.profile.set({
        ...currentProfile,
        availability,
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSaving.set(true);

      const formValue = this.profileForm.value;
      const currentProfile = this.profile();
      if (!currentProfile) {
        this.isSaving.set(false);
        return;
      }

      const updateObservables = [];

      // 1. Profile Update
      const profileInput: UpdateProfileInput = {
        bio: formValue.bio,
      };
      updateObservables.push(this.profileService.updateProfile(profileInput));

      // 2. Contact Info Update
      const contactInput: ContactInfoInput = {
        phone: formValue.phone,
        alternateEmail: formValue.alternateEmail,
        address: {
          street: formValue.street,
          city: formValue.city,
          state: formValue.state,
          zipCode: formValue.zipCode,
          country: formValue.country,
        },
      };
      updateObservables.push(this.profileService.updateContactInfo(contactInput));

      // 3. Preferences Update
      const preferencesInput: PreferencesInput = {
        emailNotifications: formValue.emailNotifications,
        smsNotifications: formValue.smsNotifications,
        maxTravelDistance: formValue.maxTravelDistance,
        eventTypes: currentProfile.preferences.eventTypes, // Assuming these are not editable in this form
        reminderPreferences: {
          enabled: formValue.eventReminders || formValue.deadlineReminders || formValue.weeklyDigest,
          hours: [24, 48], // Example, make this configurable if needed
          methods: [NotificationMethod.EMAIL], // Example
        },
      };
      updateObservables.push(this.profileService.updatePreferences(preferencesInput));

      // 4. Skills Update
      const skillsInput: SkillInput[] = currentProfile.skills.map((s) => ({
        name: s.name,
        category: s.category,
        level: s.level,
      }));
      updateObservables.push(this.profileService.updateSkills(skillsInput));

      // 5. Availability Update
      if (currentProfile.availability) {
        const availabilityInput: AvailabilityInput = {
          ...currentProfile.availability,
        };
        updateObservables.push(this.profileService.updateAvailability(availabilityInput));
      }

      forkJoin(updateObservables)
        .pipe(
          catchError((error) => {
            console.error('Error updating profile:', error);
            this.snackBar.open('Error updating profile. Please try again.', 'Close', {
              duration: 5000,
            });
            return of(null);
          })
        )
        .subscribe((results) => {
          this.isSaving.set(false);
          if (results) {
            this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
            this.router.navigate(['/profile']);
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }
}
