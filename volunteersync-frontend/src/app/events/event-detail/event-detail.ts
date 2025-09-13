import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Services
import { EventService } from '../services/event';
import { EventUiService } from '../services/event-ui';
import { AuthService } from '../../auth/services/auth';
import { EventErrorHandler } from '../services/event-error-handler';
import { Breakpoint } from '../../shared/services/breakpoint';

// Models
import { Event, EventStatus } from '../../shared/models/event.model';
import { User } from '../../shared/models/user.model';
import { Registration } from '../../shared/models/registration.model';

@Component({
  selector: 'app-event-detail',
  imports: [CommonModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  private eventUiService = inject(EventUiService);
  private authService = inject(AuthService);
  private eventErrorHandler = inject(EventErrorHandler);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private breakpointService = inject(Breakpoint);

  // Reactive state signals
  event = signal<Event | null>(null);
  loading = signal(true);
  currentUser = signal<User | null>(null);
  userRegistration = signal<Registration | null>(null);

  // Computed values
  canEdit = computed(() => {
    const event = this.event();
    const user = this.currentUser();
    return event && user ? this.eventUiService.canUserEditEvent(event, user) : false;
  });

  canRegister = computed(() => {
    const event = this.event();
    const user = this.currentUser();
    return event && user ? this.eventUiService.canUserRegister(event, user) : false;
  });

  isRegistered = computed(() => {
    return this.userRegistration() !== null;
  });

  // Responsive design computed properties
  isMobile = computed(() => this.breakpointService.isMobile());
  isTablet = computed(() => this.breakpointService.isTablet());
  isDesktop = computed(() => this.breakpointService.isDesktop());

  showSidebar = computed(() => !this.isMobile());

  // Subscription for real-time updates
  private eventSubscription?: Subscription;
  private userSubscription?: Subscription;

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(eventId);
      this.subscribeToEventUpdates(eventId);
      this.loadCurrentUser(eventId);
    }
  }

  ngOnDestroy(): void {
    this.eventSubscription?.unsubscribe();
  }

  private loadCurrentUser(eventId: string): void {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser.set(user);
      if (user) {
        this.loadUserRegistration(eventId, user.id);
      }
    });
  }

  private loadEvent(eventId: string): void {
    this.loading.set(true);
    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        this.event.set(event);
        this.loading.set(false);
      },
      error: (err) => {
        this.eventErrorHandler.handleEventOperationError(err, {
          operation: 'view',
          eventId,
        });
        this.loading.set(false);
      },
    });
  }

  private subscribeToEventUpdates(eventId: string): void {
    this.eventSubscription = this.eventService.subscribeToEventUpdates(eventId).subscribe({
      next: (updatedEvent: Event) => {
        this.event.set(updatedEvent);
      },
      error: (err: any) => {
        console.error('Error subscribing to event updates:', err);
      },
    });
  }

  private loadUserRegistration(eventId: string, userId: string): void {
    this.eventService.getMyRegistrations({ eventId }).subscribe({
      next: (registrations: Registration[]) => {
        const userRegistration = registrations.find((r) => r.event.id === eventId);
        this.userRegistration.set(userRegistration || null);
      },
      error: (err: any) => {
        // User might not be registered, which is fine
        this.userRegistration.set(null);
      },
    });
  }

  onRegister(): void {
    const event = this.event();
    if (!event || !this.canRegister()) return;

    this.eventService.registerForEvent({ eventId: event.id }).subscribe({
      next: (registration) => {
        this.userRegistration.set(registration);
        this.eventUiService.setSuccess('Successfully registered for the event!');
        // Refresh event to get updated registration count
        this.loadEvent(event.id);
      },
      error: (err) => {
        this.eventErrorHandler.handleEventOperationError(err, {
          operation: 'register',
          eventId: event.id,
        });
      },
    });
  }

  onCancelRegistration(): void {
    const registration = this.userRegistration();
    if (!registration) return;

    this.eventService.cancelRegistration(registration.id).subscribe({
      next: () => {
        this.userRegistration.set(null);
        this.eventUiService.setSuccess('Registration cancelled successfully.');
        // Refresh event to get updated registration count
        const event = this.event();
        if (event) {
          this.loadEvent(event.id);
        }
      },
      error: (err) => {
        this.eventErrorHandler.handleEventOperationError(err, {
          operation: 'cancel',
          eventId: registration.event.id,
        });
      },
    });
  }

  onEdit(): void {
    const event = this.event();
    if (event && this.canEdit()) {
      this.router.navigate(['/events', event.id, 'edit']);
    }
  }

  onDelete(): void {
    const event = this.event();
    if (!event || !this.canEdit()) return;

    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      this.eventService.deleteEvent(event.id).subscribe({
        next: () => {
          this.eventUiService.setSuccess('Event deleted successfully.');
          this.router.navigate(['/events']);
        },
        error: (err) => {
          this.eventErrorHandler.handleEventOperationError(err, {
            operation: 'delete',
            eventId: event.id,
          });
        },
      });
    }
  }

  onShare(): void {
    const event = this.event();
    if (!event) return;

    const shareUrl = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.eventUiService.setSuccess('Event link copied to clipboard!');
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/events']);
  }

  formatEventDate(startTime: Date, endTime: Date): string {
    return this.eventUiService.formatEventDate(startTime, endTime);
  }

  getStatusColor(status: EventStatus): string {
    return this.eventUiService.getEventStatusColor(status);
  }

  getStatusText(status: EventStatus): string {
    return this.eventUiService.getEventStatusText(status);
  }
}
