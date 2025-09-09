import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NotificationService, NotificationItem } from './notification';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have no notifications initially', () => {
    expect(service.notifications().length).toBe(0);
    expect(service.hasNotifications()).toBe(false);
  });

  it('should add a success notification with showSuccess', () => {
    service.showSuccess('Success message');
    expect(service.notifications().length).toBe(1);
    expect(service.hasNotifications()).toBe(true);
    const notification = service.notifications()[0];
    expect(notification.message).toBe('Success message');
    expect(notification.type).toBe('success');
  });

  it('should add an error notification with showError', () => {
    service.showError('Error message');
    expect(service.notifications().length).toBe(1);
    const notification = service.notifications()[0];
    expect(notification.message).toBe('Error message');
    expect(notification.type).toBe('error');
  });

  it('should remove a notification by id', () => {
    const id = service.showInfo('Info message');
    expect(service.notifications().length).toBe(1);
    service.remove(id);
    expect(service.notifications().length).toBe(0);
  });

  it('should clear all notifications', () => {
    service.showSuccess('one');
    service.showError('two');
    expect(service.notifications().length).toBe(2);
    service.clear();
    expect(service.notifications().length).toBe(0);
  });

  it('should auto-remove a notification after its duration', () => {
    const id = service.showSuccess('Will disappear');
    expect(service.getById(id)).toBeDefined();
    
    // Fast-forward time
    jasmine.clock().tick(4001); // default success duration is 4000
    
    expect(service.getById(id)).toBeUndefined();
  });

  it('should update a notification message', () => {
    const id = service.showInfo('Original message');
    service.updateMessage(id, 'Updated message');
    const notification = service.getById(id);
    expect(notification?.message).toBe('Updated message');
  });
});