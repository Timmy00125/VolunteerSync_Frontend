import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationItem } from '../../services/notification';

type NotificationType = NotificationItem['type'];

@Component({
  selector: 'app-notification-container',
  imports: [CommonModule],
  templateUrl: './notification-container.html',
  styleUrl: './notification-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationContainerComponent {
  private notificationService = inject(NotificationService);

  readonly notifications = computed(() => this.notificationService.notifications());

  private readonly icons: Record<NotificationType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  private readonly notificationTypeClasses: Record<NotificationType, string> = {
    success: 'border-l-4 border-green-500',
    error: 'border-l-4 border-red-500',
    warning: 'border-l-4 border-yellow-500',
    info: 'border-l-4 border-blue-500',
  };

  private readonly iconTypeClasses: Record<NotificationType, string> = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  /**
   * Close notification
   */
  closeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  /**
   * Get icon for notification type
   */
  getIcon(type: NotificationType): string {
    return this.icons[type] || this.icons['info'];
  }

  /**
   * Get CSS classes for notification type
   */
  getNotificationClasses(type: NotificationType): string {
    const baseClasses =
      'mb-3 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out';
    return `${baseClasses} ${this.notificationTypeClasses[type] || 'border-l-4 border-gray-500'}`;
  }

  /**
   * Get icon color classes
   */
  getIconClasses(type: NotificationType): string {
    return this.iconTypeClasses[type] || 'text-gray-400';
  }
}