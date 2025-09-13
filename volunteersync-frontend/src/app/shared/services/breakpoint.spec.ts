import { TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { Breakpoint } from './breakpoint';
import { PLATFORM_ID, provideZonelessChangeDetection } from '@angular/core';

describe('Breakpoint', () => {
  let service: Breakpoint;
  let breakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(() => {
    const breakpointSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        Breakpoint,
        { provide: BreakpointObserver, useValue: breakpointSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(Breakpoint);
    breakpointObserver = TestBed.inject(BreakpointObserver) as jasmine.SpyObj<BreakpointObserver>;

    // Mock the observe method
    breakpointObserver.observe.and.returnValue(of({ matches: true, breakpoints: {} }));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('computed properties', () => {
    it('should correctly identify mobile breakpoints', () => {
      // Mock current breakpoint as xs
      (service as any).currentBreakpointSignal.set('xs');

      expect(service.isMobile()).toBe(true);
      expect(service.isTablet()).toBe(false);
      expect(service.isDesktop()).toBe(false);
    });

    it('should correctly identify tablet breakpoints', () => {
      (service as any).currentBreakpointSignal.set('md');

      expect(service.isMobile()).toBe(false);
      expect(service.isTablet()).toBe(true);
      expect(service.isDesktop()).toBe(false);
    });

    it('should correctly identify desktop breakpoints', () => {
      (service as any).currentBreakpointSignal.set('xl');

      expect(service.isMobile()).toBe(false);
      expect(service.isTablet()).toBe(false);
      expect(service.isDesktop()).toBe(true);
    });
  });

  describe('isAtLeast', () => {
    it('should return true when current breakpoint is at least target', () => {
      (service as any).currentBreakpointSignal.set('lg');

      expect(service.isAtLeast('md')).toBe(true);
      expect(service.isAtLeast('lg')).toBe(true);
      expect(service.isAtLeast('xl')).toBe(false);
    });
  });

  describe('getResponsiveColumns', () => {
    it('should return correct column count based on breakpoint', () => {
      (service as any).currentBreakpointSignal.set('md');

      const columnConfig = {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
      };

      expect(service.getResponsiveColumns(columnConfig)).toBe(3);
    });

    it('should fallback to smaller breakpoint if current not defined', () => {
      (service as any).currentBreakpointSignal.set('lg');

      const columnConfig = {
        xs: 1,
        sm: 2,
        md: 3,
      };

      expect(service.getResponsiveColumns(columnConfig)).toBe(3);
    });

    it('should return 1 as default when no config matches', () => {
      (service as any).currentBreakpointSignal.set('xl');

      const columnConfig = {
        xs: 2,
      };

      expect(service.getResponsiveColumns(columnConfig)).toBe(1);
    });
  });

  describe('isAtMost', () => {
    it('should return true when current breakpoint is at most target', () => {
      (service as any).currentBreakpointSignal.set('md');

      expect(service.isAtMost('md')).toBe(true);
      expect(service.isAtMost('lg')).toBe(true);
      expect(service.isAtMost('sm')).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      (service as any).currentBreakpointSignal.set('xs');

      expect(service.isAtMost('xs')).toBe(true);
      expect(service.isAtMost('2xl')).toBe(true);
    });
  });

  describe('matches', () => {
    it('should check if current breakpoint matches target', () => {
      (service as any).currentBreakpointSignal.set('lg');

      expect(service.matches('lg')).toBe(true);
      expect(service.matches('md')).toBe(false);
      expect(service.matches('xl')).toBe(false);
    });
  });

  describe('getResponsiveSpacing', () => {
    it('should return spacing for current breakpoint', () => {
      (service as any).currentBreakpointSignal.set('md');

      const spacingConfig = {
        xs: 8,
        sm: 12,
        md: 16,
        lg: 20,
      };

      expect(service.getResponsiveSpacing(spacingConfig)).toBe(16);
    });

    it('should fallback to default spacing when not configured', () => {
      (service as any).currentBreakpointSignal.set('lg');

      const spacingConfig = {
        xs: 8,
        sm: 12,
      };

      // Should return default spacing for lg
      expect(service.getResponsiveSpacing(spacingConfig)).toBe(20);
    });
  });

  describe('getResponsiveClasses', () => {
    it('should return classes for current breakpoint', () => {
      (service as any).currentBreakpointSignal.set('md');

      const classConfig = {
        xs: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      };

      expect(service.getResponsiveClasses(classConfig)).toBe('text-base');
    });

    it('should return empty string when no class matches', () => {
      (service as any).currentBreakpointSignal.set('xl');

      const classConfig = {
        xs: 'text-sm',
        md: 'text-base',
      };

      expect(service.getResponsiveClasses(classConfig)).toBe('');
    });
  });

  describe('viewportInfo', () => {
    it('should provide comprehensive viewport information', () => {
      (service as any).currentBreakpointSignal.set('lg');
      (service as any).viewportSizeSignal.set({ width: 1200, height: 800 });

      const info = service.viewportInfo();

      expect(info.currentBreakpoint).toBe('lg');
      expect(info.width).toBe(1200);
      expect(info.height).toBe(800);
      expect(info.isMobile).toBe(false);
      expect(info.isTablet).toBe(false);
      expect(info.isDesktop).toBe(true);
      expect(info.isHandset).toBe(false);
      expect(info.isWeb).toBe(false);
    });

    it('should identify handset correctly', () => {
      (service as any).currentBreakpointSignal.set('xs');

      const info = service.viewportInfo();

      expect(info.isHandset).toBe(true);
      expect(info.isMobile).toBe(true);
    });

    it('should identify web correctly', () => {
      (service as any).currentBreakpointSignal.set('2xl');

      const info = service.viewportInfo();

      expect(info.isWeb).toBe(true);
      expect(info.isDesktop).toBe(true);
    });
  });

  describe('breakpoint order', () => {
    it('should have correct breakpoint ordering', () => {
      const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

      breakpoints.forEach((bp, index) => {
        (service as any).currentBreakpointSignal.set(bp);

        // Test that smaller breakpoints return false for isAtLeast
        for (let i = index + 1; i < breakpoints.length; i++) {
          expect(service.isAtLeast(breakpoints[i])).toBe(false);
        }

        // Test that larger breakpoints return false for isAtMost
        for (let i = 0; i < index; i++) {
          expect(service.isAtMost(breakpoints[i])).toBe(false);
        }
      });
    });
  });

  describe('edge cases', () => {
    it('should handle server-side rendering', () => {
      // Simulate SSR environment
      TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
      const serverService = TestBed.inject(Breakpoint);

      // Should not throw errors in SSR
      expect(() => {
        serverService.currentBreakpoint();
        serverService.isMobile();
        serverService.viewportInfo();
      }).not.toThrow();
    });

    it('should handle empty responsive configurations', () => {
      (service as any).currentBreakpointSignal.set('md');

      expect(service.getResponsiveColumns({})).toBe(1);
      expect(service.getResponsiveSpacing({})).toBe(16); // Default for md
      expect(service.getResponsiveClasses({})).toBe('');
    });
  });
});
