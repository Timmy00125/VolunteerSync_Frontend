import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

// Models
import { UserProfile, SkillCategory } from '../../shared/models/user.model';

// Services
import { ProfileService } from '../services/profile';
import { AuthService } from '../../auth/services/auth';

@Component({
  selector: 'app-profile-view',
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.css',
})
export class ProfileViewComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Component state
  profile = signal<UserProfile | null>(null);
  loading = signal(false);
  userId = signal<string | null>(null);
  currentUser = signal<any>(null);

  // Computed properties
  isLoading = computed(() => this.profileService.isLoading() || this.loading());
  error = computed(() => this.profileService.error());

  isOwnProfile = computed(() => {
    const currentUser = this.currentUser();
    const targetUserId = this.userId();
    return !targetUserId || currentUser?.id === targetUserId;
  });

  displayName = computed(() => {
    const user = this.currentUser();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || user?.email || 'User';
  });

  userEmail = computed(() => {
    const user = this.currentUser();
    return user?.email || '';
  });

  ngOnInit(): void {
    // Check authentication first
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.warn('No authenticated user found, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.currentUser.set(currentUser);

    // Get user ID from route params (optional - if not provided, shows own profile)
    this.route.params.subscribe((params) => {
      this.userId.set(params['id'] || null);
      this.loadProfile();
    });
  }

  loadProfile(): void {
    // Ensure we have authentication before loading profile
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loading.set(true);
    const targetUserId = this.userId() || undefined;

    this.profileService.getProfile(targetUserId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading.set(false);

        // Handle authentication errors specifically
        if (
          error?.networkError?.status === 401 ||
          error?.graphQLErrors?.some((e: any) => e.extensions?.['code'] === 'UNAUTHENTICATED')
        ) {
          console.warn('Authentication failed, redirecting to login');
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
      },
    });
  }

  formatSkillCategory(category: SkillCategory): string {
    return category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
