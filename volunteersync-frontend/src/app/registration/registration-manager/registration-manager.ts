import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Services
import { RegistrationService } from '../services/registration';
import { EventService } from '../../events/services/event';
import { AuthService } from '../../auth/services/auth';

// Models
import { Registration, RegistrationStatus } from '../../shared/models/registration.model';
import { Event } from '../../shared/models/event.model';
import { User } from '../../shared/models/user.model';

export interface RegistrationStats {
  total: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  pending: number;
  waitlisted: number;
}

@Component({
  selector: 'app-registration-manager',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registration-manager.html',
  styleUrl: './registration-manager.css',
})
export class RegistrationManagerComponent implements OnInit, OnDestroy {
  private registrationService = inject(RegistrationService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // State signals
  events = signal<Event[]>([]);
  registrations = signal<Registration[]>([]);
  selectedEvent = signal<Event | null>(null);
  selectedRegistrations = signal<Registration[]>([]);
  currentUser = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  bulkUpdateLoading = signal(false);

  // Filter and search form
  filterForm!: FormGroup;

  // Filter signals
  statusFilter = signal<RegistrationStatus | null>(null);
  searchTerm = signal<string>('');
  dateRange = signal<{ start: Date; end: Date } | null>(null);

  // Available status options
  readonly statusOptions = [
    { value: null, label: 'All Statuses' },
    { value: RegistrationStatus.CONFIRMED, label: 'Confirmed' },
    { value: RegistrationStatus.PENDING_APPROVAL, label: 'Pending Approval' },
    { value: RegistrationStatus.WAITLISTED, label: 'Waitlisted' },
    { value: RegistrationStatus.CANCELLED, label: 'Cancelled' },
    { value: RegistrationStatus.COMPLETED, label: 'Completed' },
    { value: RegistrationStatus.NO_SHOW, label: 'No Show' },
    { value: RegistrationStatus.DECLINED, label: 'Declined' },
  ];

  // Computed values
  filteredRegistrations = computed(() => {
    const registrations = this.registrations();
    const status = this.statusFilter();
    const search = this.searchTerm().toLowerCase();
    const event = this.selectedEvent();

    return registrations.filter((reg) => {
      // Filter by selected event
      const matchesEvent = !event || reg.event.id === event.id;

      // Filter by status
      const matchesStatus = !status || reg.status === status;

      // Filter by search term
      const matchesSearch =
        !search ||
        (reg.user.firstName?.toLowerCase() || '').includes(search) ||
        (reg.user.lastName?.toLowerCase() || '').includes(search) ||
        reg.user.email.toLowerCase().includes(search) ||
        reg.event.title.toLowerCase().includes(search);

      return matchesEvent && matchesStatus && matchesSearch;
    });
  });

  registrationStats = computed(() => {
    const registrations = this.filteredRegistrations();
    return {
      total: registrations.length,
      confirmed: registrations.filter((r) => r.status === RegistrationStatus.CONFIRMED).length,
      cancelled: registrations.filter((r) => r.status === RegistrationStatus.CANCELLED).length,
      completed: registrations.filter((r) => r.status === RegistrationStatus.COMPLETED).length,
      pending: registrations.filter((r) => r.status === RegistrationStatus.PENDING_APPROVAL).length,
      waitlisted: registrations.filter((r) => r.status === RegistrationStatus.WAITLISTED).length,
    };
  });

  allSelected = computed(() => {
    const filtered = this.filteredRegistrations();
    const selected = this.selectedRegistrations();
    return (
      filtered.length > 0 && filtered.every((reg) => selected.some((sel) => sel.id === reg.id))
    );
  });

  someSelected = computed(() => {
    const filtered = this.filteredRegistrations();
    const selected = this.selectedRegistrations();
    return selected.length > 0 && selected.length < filtered.length;
  });

  ngOnInit(): void {
    this.createFilterForm();
    this.loadOrganizerData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      status: [null],
      eventId: [null],
    });
  }

  private setupFormSubscriptions(): void {
    // Search term subscription with debounce
    this.filterForm
      .get('search')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.searchTerm.set(value || '');
      });

    // Status filter subscription
    this.filterForm
      .get('status')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.statusFilter.set(value);
      });

    // Event filter subscription
    this.filterForm
      .get('eventId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const event = this.events().find((e) => e.id === value) || null;
        this.selectedEvent.set(event);
        this.selectedRegistrations.set([]); // Clear selections when changing event
      });
  }

  private loadOrganizerData(): void {
    this.loading.set(true);
    this.error.set(null);

    const user = this.authService.currentUser();
    if (!user) {
      this.error.set('User not authenticated');
      this.loading.set(false);
      return;
    }

    this.currentUser.set(user);

    // Load organizer's events
    this.eventService
      .getOrganizerEvents(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events: Event[]) => {
          this.events.set(events);
          this.loadRegistrationsForEvents(events);
        },
        error: (error: any) => {
          console.error('Error loading organizer events:', error);
          this.error.set('Failed to load events. Please try again.');
          this.loading.set(false);
        },
      });
  }

  private loadRegistrationsForEvents(events: Event[]): void {
    if (events.length === 0) {
      this.registrations.set([]);
      this.loading.set(false);
      return;
    }

    // Load registrations for all organizer events
    const allRegistrations: Registration[] = [];
    let completedRequests = 0;

    events.forEach((event) => {
      this.registrationService
        .getEventRegistrations(event.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (eventRegistrations) => {
            allRegistrations.push(...eventRegistrations);
            completedRequests++;

            if (completedRequests === events.length) {
              this.registrations.set(allRegistrations);
              this.loading.set(false);
            }
          },
          error: (error) => {
            console.error(`Error loading registrations for event ${event.id}:`, error);
            completedRequests++;

            if (completedRequests === events.length) {
              this.registrations.set(allRegistrations);
              this.loading.set(false);
            }
          },
        });
    });
  }

  onEventSelect(eventId: string | null): void {
    this.filterForm.patchValue({ eventId });
  }

  onStatusFilter(status: RegistrationStatus | null): void {
    this.filterForm.patchValue({ status });
  }

  onSearch(term: string): void {
    this.filterForm.patchValue({ search: term });
  }

  onToggleRegistrationSelection(registration: Registration): void {
    const selected = this.selectedRegistrations();
    const isSelected = selected.some((sel) => sel.id === registration.id);

    if (isSelected) {
      this.selectedRegistrations.set(selected.filter((sel) => sel.id !== registration.id));
    } else {
      this.selectedRegistrations.set([...selected, registration]);
    }
  }

  onSelectAllRegistrations(): void {
    const filtered = this.filteredRegistrations();
    const allSelected = this.allSelected();

    if (allSelected) {
      // Deselect all
      this.selectedRegistrations.set([]);
    } else {
      // Select all filtered
      this.selectedRegistrations.set([...filtered]);
    }
  }

  onBulkUpdateStatus(status: RegistrationStatus): void {
    const selected = this.selectedRegistrations();
    if (selected.length === 0) return;

    this.bulkUpdateLoading.set(true);

    const registrationIds = selected.map((reg) => reg.id);

    this.registrationService
      .bulkUpdateRegistrations(registrationIds, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          // Update local state
          const updated = this.registrations().map((reg) => {
            if (registrationIds.includes(reg.id)) {
              return { ...reg, status };
            }
            return reg;
          });

          this.registrations.set(updated);
          this.selectedRegistrations.set([]); // Clear selections
          this.bulkUpdateLoading.set(false);

          // Show success message
          console.log(`Updated ${result.successCount} registrations successfully`);
        },
        error: (error) => {
          console.error('Error updating registrations:', error);
          this.bulkUpdateLoading.set(false);
        },
      });
  }

  onExportRegistrations(): void {
    const registrations = this.filteredRegistrations();
    const csvContent = this.generateCSV(registrations);

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(registrations: Registration[]): string {
    const headers = [
      'Event Title',
      'Volunteer Name',
      'Email',
      'Status',
      'Registration Date',
      'Personal Message',
      'Emergency Contact',
      'Phone Number',
    ];

    const rows = registrations.map((reg) => [
      reg.event.title,
      `${reg.user.firstName || ''} ${reg.user.lastName || ''}`,
      reg.user.email,
      reg.status,
      new Date(reg.appliedAt).toLocaleDateString(),
      reg.personalMessage || '',
      reg.user.profile?.emergencyContact
        ? `${reg.user.profile.emergencyContact.name} (${reg.user.profile.emergencyContact.phone})`
        : '',
      reg.user.profile?.contactInfo?.phone || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Helper methods for template
  getStatusDisplay(status: RegistrationStatus): { label: string; color: string } {
    const option = this.statusOptions.find((opt) => opt.value === status);
    const colors = {
      [RegistrationStatus.CONFIRMED]: 'text-green-700 bg-green-100',
      [RegistrationStatus.PENDING_APPROVAL]: 'text-yellow-700 bg-yellow-100',
      [RegistrationStatus.WAITLISTED]: 'text-purple-700 bg-purple-100',
      [RegistrationStatus.CANCELLED]: 'text-red-700 bg-red-100',
      [RegistrationStatus.COMPLETED]: 'text-blue-700 bg-blue-100',
      [RegistrationStatus.NO_SHOW]: 'text-orange-700 bg-orange-100',
      [RegistrationStatus.DECLINED]: 'text-gray-700 bg-gray-100',
    };

    return {
      label: option?.label || status,
      color: colors[status] || 'text-gray-700 bg-gray-100',
    };
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  isRegistrationSelected(registration: Registration): boolean {
    return this.selectedRegistrations().some((sel) => sel.id === registration.id);
  }
}
