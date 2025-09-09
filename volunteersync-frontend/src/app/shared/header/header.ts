import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';

interface NavigationItem {
  label: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // State signals
  private mobileMenuOpenSignal = signal<boolean>(false);
  private userMenuOpenSignal = signal<boolean>(false);

  // Computed signals from auth service
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  // Local computed signals
  readonly mobileMenuOpen = computed(() => this.mobileMenuOpenSignal());
  readonly userMenuOpen = computed(() => this.userMenuOpenSignal());

  // Navigation items based on user role
  readonly navigationItems = computed((): NavigationItem[] => {
    const user = this.currentUser();
    const items: NavigationItem[] = [
      { label: 'Events', route: '/events', roles: [] },
      { label: 'Dashboard', route: '/dashboard', roles: [] },
      { label: 'Profile', route: '/profile', roles: [] },
    ];

    // Add organizer-only items
    if (user && this.hasRole(user, ['COORDINATOR', 'ADMIN'])) {
      items.push(
        { label: 'Create Event', route: '/events/create', roles: ['COORDINATOR', 'ADMIN'] },
        { label: 'Manage Events', route: '/events/manage', roles: ['COORDINATOR', 'ADMIN'] }
      );
    }

    // Add admin-only items
    if (user && this.hasRole(user, ['ADMIN'])) {
      items.push({ label: 'Admin', route: '/admin', roles: ['ADMIN'] });
    }

    return items;
  });

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpenSignal.update((open) => !open);
    // Close user menu when opening mobile menu
    if (this.mobileMenuOpenSignal()) {
      this.userMenuOpenSignal.set(false);
    }
  }

  /**
   * Toggle user menu
   */
  toggleUserMenu(): void {
    this.userMenuOpenSignal.update((open) => !open);
    // Close mobile menu when opening user menu
    if (this.userMenuOpenSignal()) {
      this.mobileMenuOpenSignal.set(false);
    }
  }

  /**
   * Close all menus
   */
  closeMenus(): void {
    this.mobileMenuOpenSignal.set(false);
    this.userMenuOpenSignal.set(false);
  }

  /**
   * Handle logout
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.closeMenus();
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Still navigate to login even if logout fails
        this.closeMenus();
        this.router.navigate(['/auth/login']);
      },
    });
  }

  /**
   * Navigate to profile
   */
  navigateToProfile(): void {
    this.closeMenus();
    this.router.navigate(['/profile']);
  }

  /**
   * Navigate to settings
   */
  navigateToSettings(): void {
    this.closeMenus();
    this.router.navigate(['/settings']);
  }

  /**
   * Check if user has required roles
   */
  private hasRole(user: User, roles: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    return roles.some((role) => user.roles?.includes(role));
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    const user = this.currentUser();
    return user?.name || user?.email || 'User';
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';

    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }

    return user.email.substring(0, 2).toUpperCase();
  }

  /**
   * Handle clicking outside menus (for closing)
   */
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.mobile-menu') && !target.closest('.user-menu')) {
      this.closeMenus();
    }
  }
}
