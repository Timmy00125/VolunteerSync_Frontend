import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header';
import { NotificationContainerComponent } from './shared/components/notification-container/notification-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NotificationContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  protected readonly title = signal('volunteersync-frontend');
}
