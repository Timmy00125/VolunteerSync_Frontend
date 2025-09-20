import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';

// Models
import { Availability, WeekdayAvailability, WeekDay } from '../../shared/models/user.model';

@Component({
  selector: 'app-availability-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
  ],
  templateUrl: './availability-editor.html',
  styleUrls: [],
})
export class AvailabilityEditor implements OnInit {
  private fb = inject(FormBuilder);

  // Input/Output
  initialAvailability = input<Availability | null>(null);
  availabilityChanged = output<Availability>();

  // Form
  availabilityForm: FormGroup;
  selectedDate: Date | null = null;
  minDate = new Date();

  // State
  unavailableDates = signal<Date[]>([]);

  // Constants
  weekDays = Object.values(WeekDay);
  timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  ];

  // Computed
  totalWeeklyHours = computed(() => {
    let total = 0;
    for (const day of this.weekDays) {
      total += this.calculateDayHours(day);
    }
    return total;
  });

  hasChanges = computed(() => {
    const initial = this.initialAvailability();
    if (!initial) return true;

    const current = this.buildAvailabilityFromForm();
    return JSON.stringify(initial) !== JSON.stringify(current);
  });

  constructor() {
    this.availabilityForm = this.createForm();
  }

  ngOnInit(): void {
    const initial = this.initialAvailability();
    if (initial) {
      this.populateForm(initial);
      this.unavailableDates.set([...initial.unavailableDates]);
    }
  }

  private createForm(): FormGroup {
    const formConfig: any = {
      timeZone: ['', Validators.required],
      maxHoursPerWeek: [null, [Validators.min(1), Validators.max(168)]],
    };

    // Add controls for each day
    for (const day of this.weekDays) {
      formConfig[`day_${day}_available`] = [false];
      formConfig[`day_${day}_start`] = ['09:00'];
      formConfig[`day_${day}_end`] = ['17:00'];
    }

    return this.fb.group(formConfig);
  }

  private populateForm(availability: Availability): void {
    this.availabilityForm.patchValue({
      timeZone: availability.timeZone,
      maxHoursPerWeek: availability.maxHoursPerWeek,
    });

    // Populate weekday availability
    for (const dayAvail of availability.weekdays) {
      this.availabilityForm.patchValue({
        [`day_${dayAvail.day}_available`]: dayAvail.available,
        [`day_${dayAvail.day}_start`]: dayAvail.startTime || '09:00',
        [`day_${dayAvail.day}_end`]: dayAvail.endTime || '17:00',
      });
    }
  }

  private buildAvailabilityFromForm(): Availability {
    const formValue = this.availabilityForm.value;

    const weekdays: WeekdayAvailability[] = this.weekDays.map((day) => ({
      day,
      available: formValue[`day_${day}_available`] || false,
      startTime: formValue[`day_${day}_start`] || undefined,
      endTime: formValue[`day_${day}_end`] || undefined,
    }));

    return {
      weekdays,
      timeZone: formValue.timeZone,
      maxHoursPerWeek: formValue.maxHoursPerWeek || undefined,
      unavailableDates: [...this.unavailableDates()],
    };
  }

  isDayAvailable(day: WeekDay): boolean {
    return this.availabilityForm.get(`day_${day}_available`)?.value || false;
  }

  onDayToggle(day: WeekDay, available: boolean): void {
    if (!available) {
      this.availabilityForm.patchValue({
        [`day_${day}_start`]: '09:00',
        [`day_${day}_end`]: '17:00',
      });
    }
  }

  calculateDayHours(day: WeekDay): number {
    if (!this.isDayAvailable(day)) return 0;

    const startTime = this.availabilityForm.get(`day_${day}_start`)?.value;
    const endTime = this.availabilityForm.get(`day_${day}_end`)?.value;

    if (!startTime || !endTime) return 0;

    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);

    if (end <= start) return 0;

    return (end - start) / (1000 * 60 * 60);
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  }

  addUnavailableDate(): void {
    if (this.selectedDate) {
      const dateExists = this.unavailableDates().some(
        (date) => date.toDateString() === this.selectedDate!.toDateString()
      );

      if (!dateExists) {
        this.unavailableDates.update((dates) => [...dates, new Date(this.selectedDate!)]);
      }

      this.selectedDate = null;
    }
  }

  removeUnavailableDate(dateToRemove: Date): void {
    this.unavailableDates.update((dates) =>
      dates.filter((date) => date.toDateString() !== dateToRemove.toDateString())
    );
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatWeekDay(day: WeekDay): string {
    const dayNames: Record<WeekDay, string> = {
      [WeekDay.MONDAY]: 'Monday',
      [WeekDay.TUESDAY]: 'Tuesday',
      [WeekDay.WEDNESDAY]: 'Wednesday',
      [WeekDay.THURSDAY]: 'Thursday',
      [WeekDay.FRIDAY]: 'Friday',
      [WeekDay.SATURDAY]: 'Saturday',
      [WeekDay.SUNDAY]: 'Sunday',
    };
    return dayNames[day];
  }

  // Quick Actions
  setWeekdaysOnly(): void {
    this.clearAll();
    const weekdays = [
      WeekDay.MONDAY,
      WeekDay.TUESDAY,
      WeekDay.WEDNESDAY,
      WeekDay.THURSDAY,
      WeekDay.FRIDAY,
    ];

    for (const day of weekdays) {
      this.availabilityForm.patchValue({
        [`day_${day}_available`]: true,
        [`day_${day}_start`]: '09:00',
        [`day_${day}_end`]: '17:00',
      });
    }
  }

  setWeekendsOnly(): void {
    this.clearAll();
    const weekends = [WeekDay.SATURDAY, WeekDay.SUNDAY];

    for (const day of weekends) {
      this.availabilityForm.patchValue({
        [`day_${day}_available`]: true,
        [`day_${day}_start`]: '09:00',
        [`day_${day}_end`]: '17:00',
      });
    }
  }

  setFullWeek(): void {
    for (const day of this.weekDays) {
      this.availabilityForm.patchValue({
        [`day_${day}_available`]: true,
        [`day_${day}_start`]: '09:00',
        [`day_${day}_end`]: '17:00',
      });
    }
  }

  clearAll(): void {
    for (const day of this.weekDays) {
      this.availabilityForm.patchValue({
        [`day_${day}_available`]: false,
      });
    }
  }

  onSave(): void {
    if (this.availabilityForm.valid && this.hasChanges()) {
      const availability = this.buildAvailabilityFromForm();
      this.availabilityChanged.emit(availability);
    }
  }
}
