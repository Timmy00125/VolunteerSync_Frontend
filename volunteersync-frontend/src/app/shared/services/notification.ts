import { Injectable, signal, computed } from '@angular/core';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: string;
  duration?: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSignal = signal<NotificationItem[]>([]);
  private autoIncrement = 0;

  // Public readonly computed signals
  readonly notifications = computed(() => this.notificationsSignal());
  readonly hasNotifications = computed(() => this.notificationsSignal().length > 0);

  private readonly defaultDurations = {
    success: 4000,
    info: 6000,
    warning: 8000,
    error: 10000,
  };

  /**
   * Show success notification
   */
  showSuccess(message: string, action?: string): string {
    return this.addNotification('success', message, action);
  }

  /**
   * Show error notification
   */
  showError(message: string, action?: string): string {
    return this.addNotification('error', message, action);
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, action?: string): string {
    return this.addNotification('warning', message, action);
  }

  /**
   * Show info notification
   */
  showInfo(message: string, action?: string): string {
    return this.addNotification('info', message, action);
  }

  /**
   * Remove notification by ID
   */
  remove(id: string): void {
    const notifications = this.notificationsSignal();
    const filtered = notifications.filter((n) => n.id !== id);
    this.notificationsSignal.set(filtered);
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notificationsSignal.set([]);
  }

  /**
   * Add notification to the queue
   */
  private addNotification(
    type: NotificationItem['type'],
    message: string,
    action?: string,
    duration?: number
  ): string {
    const id = `notification-${++this.autoIncrement}-${Date.now()}`;
    const finalDuration = duration ?? this.defaultDurations[type];

    const notification: NotificationItem = {
      id,
      type,
      message,
      action,
      duration: finalDuration,
      timestamp: Date.now(),
    };

    // Add to notifications array
    const currentNotifications = this.notificationsSignal();
    this.notificationsSignal.set([...currentNotifications, notification]);

    // Auto-remove after duration
    if (finalDuration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, finalDuration);
    }

    return id;
  }

  /**
   * Get notification by ID
   */
  getById(id: string): NotificationItem | undefined {
    return this.notificationsSignal().find((n) => n.id === id);
  }

  /**
   * Get notifications by type
   */
  getByType(type: NotificationItem['type']): NotificationItem[] {
    return this.notificationsSignal().filter((n) => n.type === type);
  }

  /**
   * Update notification message
   */
  updateMessage(id: string, message: string): void {
    const notifications = this.notificationsSignal();
    const updated = notifications.map((n) => (n.id === id ? { ...n, message } : n));
    this.notificationsSignal.set(updated);
  }
}
