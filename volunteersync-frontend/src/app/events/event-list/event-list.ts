import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

// Services
import { EventService } from '../services/event';
import { EventUiService } from '../services/event-ui';
import { EventErrorHandler } from '../services/event-error-handler';
import { Breakpoint } from '../../shared/services/breakpoint';

// Models
import { Event, EventStatus } from '../../shared/models/event.model';

@Component({
  selector: 'app-event-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventListComponent implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  public eventUiService = inject(EventUiService);
  private eventErrorHandler = inject(EventErrorHandler);
  private router = inject(Router);
  private breakpointService = inject(Breakpoint);
  private destroy$ = new Subject<void>();

  // Make Math available in template
  Math = Math;

  // Reactive state signals
  events = signal<Event[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(12);

  // Filter and search controls
  searchControl = new FormControl('');
  statusFilter = signal<EventStatus | 'ALL'>('ALL');
  sortBy = signal<'date' | 'title' | 'registrations'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // Computed values
  filteredEvents = computed(() => {
    let filtered = this.events();

    // Apply status filter
    if (this.statusFilter() !== 'ALL') {
      filtered = filtered.filter((event) => event.status === this.statusFilter());
    }

    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy()) {
        case 'date':
          comparison = a.startTime.getTime() - b.startTime.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'registrations':
          comparison = a.currentRegistrations - b.currentRegistrations;
          break;
      }

      return this.sortOrder() === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  paginatedEvents = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredEvents().slice(startIndex, endIndex);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredEvents().length / this.pageSize());
  });

  hasNextPage = computed(() => this.currentPage() < this.totalPages());
  hasPreviousPage = computed(() => this.currentPage() > 1);

  // Responsive design computed properties
  gridColumns = computed(() => {
    return this.breakpointService.getResponsiveColumns({
      xs: 1,
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
      '2xl': 5,
    });
  });

  isMobile = computed(() => this.breakpointService.isMobile());
  isTablet = computed(() => this.breakpointService.isTablet());
  isDesktop = computed(() => this.breakpointService.isDesktop());

  ngOnInit(): void {
    this.loadEvents();

    // Set up search debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage.set(1); // Reset to first page on search
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEvents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventService.getEvents(undefined, undefined, 100).subscribe({
      next: (result) => {
        this.events.set(result.edges.map((edge) => edge.node));
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.eventErrorHandler.handleEventOperationError(err, { operation: 'list' });
        this.error.set('Failed to load events. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(): void {
    // Handled by the subscription in ngOnInit
  }

  onStatusFilterChange(status: EventStatus | 'ALL'): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  onSortChange(sortBy: 'date' | 'title' | 'registrations'): void {
    if (this.sortBy() === sortBy) {
      // Toggle sort order if same field
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(sortBy);
      this.sortOrder.set('desc'); // Default to descending for new sort
    }
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onEventClick(event: Event): void {
    this.router.navigate(['/events', event.id]);
  }

  onRegisterClick(event: Event): void {
    // Navigate to registration component or open modal
    this.router.navigate(['/events', event.id, 'register']);
  }

  refreshEvents(): void {
    this.loadEvents();
  }

  getStatusOptions(): { value: EventStatus | 'ALL'; label: string }[] {
    return [
      { value: 'ALL', label: 'All Events' },
      { value: EventStatus.PUBLISHED, label: 'Published' },
      { value: EventStatus.DRAFT, label: 'Draft' },
      { value: EventStatus.CANCELLED, label: 'Cancelled' },
      { value: EventStatus.COMPLETED, label: 'Completed' },
    ];
  }

  getSortOptions(): { value: 'date' | 'title' | 'registrations'; label: string }[] {
    return [
      { value: 'date', label: 'Date' },
      { value: 'title', label: 'Title' },
      { value: 'registrations', label: 'Registrations' },
    ];
  }

  trackByEventId(index: number, event: Event): string {
    return event.id;
  }
}
