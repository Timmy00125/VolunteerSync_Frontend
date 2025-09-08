import { Component, input, output, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppNotificationComponent implements OnInit {
  type = input.required<NotificationType>();
  message = input.required<string>();
  title = input<string>('');
  dismissible = input<boolean>(true);
  autoClose = input<boolean>(true);
  duration = input<number>(5000);

  onDismiss = output<void>();

  get typeClasses(): string {
    const baseClasses = 'rounded-md p-4 border-l-4';

    const typeMap = {
      success: 'bg-green-50 border-green-400 text-green-700',
      error: 'bg-red-50 border-red-400 text-red-700',
      warning: 'bg-yellow-50 border-yellow-400 text-yellow-700',
      info: 'bg-blue-50 border-blue-400 text-blue-700',
    };

    return `${baseClasses} ${typeMap[this.type()]}`;
  }

  get iconClasses(): string {
    const iconMap = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
    };

    return `h-5 w-5 ${iconMap[this.type()]}`;
  }

  get iconPath(): string {
    const iconPaths = {
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning:
        'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };

    return iconPaths[this.type()];
  }

  dismiss(): void {
    this.onDismiss.emit();
  }

  ngOnInit(): void {
    if (this.autoClose() && this.duration() > 0) {
      setTimeout(() => {
        this.dismiss();
      }, this.duration());
    }
  }
}
