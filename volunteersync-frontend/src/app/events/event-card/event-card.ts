import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Services
import { EventUiService } from '../services/event-ui';

// Models
import { Event } from '../../shared/models/event.model';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-event-card',
  imports: [CommonModule],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
})
export class EventCard {
  private router = inject(Router);
  public eventUiService = inject(EventUiService);

  // Inputs
  event = input.required<Event>();
  currentUser = input<User | null>(null);
  showActions = input<boolean>(true);

  // Outputs
  eventClicked = output<Event>();
  registerClicked = output<Event>();

  onEventClick(): void {
    this.eventClicked.emit(this.event());
  }

  onRegisterClick($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.registerClicked.emit(this.event());
  }

  onViewDetails($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.router.navigate(['/events', this.event().id]);
  }
}
