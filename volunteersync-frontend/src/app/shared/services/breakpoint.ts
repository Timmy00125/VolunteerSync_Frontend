import { Injectable, signal, computed, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export type BreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ViewportInfo {
  width: number;
  height: number;
  currentBreakpoint: BreakpointName;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isHandset: boolean;
  isWeb: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Breakpoint implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  // Tailwind CSS breakpoints (matching the default configuration)
  private readonly breakpoints: BreakpointConfig = {
    xs: '(max-width: 639px)',
    sm: '(min-width: 640px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 1023px)',
    lg: '(min-width: 1024px) and (max-width: 1279px)',
    xl: '(min-width: 1280px) and (max-width: 1535px)',
    '2xl': '(min-width: 1536px)',
  };

  // Signal-based state
  private currentBreakpointSignal = signal<BreakpointName>('md');
  private viewportSizeSignal = signal<{ width: number; height: number }>({
    width: 1024,
    height: 768,
  });

  // Computed properties
  readonly currentBreakpoint = computed(() => this.currentBreakpointSignal());
  readonly viewportSize = computed(() => this.viewportSizeSignal());

  readonly isMobile = computed(() => {
    const bp = this.currentBreakpoint();
    return bp === 'xs' || bp === 'sm';
  });

  readonly isTablet = computed(() => {
    const bp = this.currentBreakpoint();
    return bp === 'md';
  });

  readonly isDesktop = computed(() => {
    const bp = this.currentBreakpoint();
    return bp === 'lg' || bp === 'xl' || bp === '2xl';
  });

  readonly isHandset = computed(() => {
    return this.currentBreakpoint() === 'xs';
  });

  readonly isWeb = computed(() => {
    return this.currentBreakpoint() === '2xl';
  });

  readonly viewportInfo = computed((): ViewportInfo => {
    const size = this.viewportSize();
    const currentBreakpoint = this.currentBreakpoint();

    return {
      width: size.width,
      height: size.height,
      currentBreakpoint,
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      isDesktop: this.isDesktop(),
      isHandset: this.isHandset(),
      isWeb: this.isWeb(),
    };
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeBreakpointTracking();
      this.initializeViewportTracking();
    }
  }

  /**
   * Check if current viewport matches a specific breakpoint
   */
  matches(breakpoint: BreakpointName): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const query = this.breakpoints[breakpoint];
    return window.matchMedia(query).matches;
  }

  /**
   * Check if current viewport is at least the specified breakpoint
   */
  isAtLeast(breakpoint: BreakpointName): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const breakpointOrder: BreakpointName[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint());
    const targetIndex = breakpointOrder.indexOf(breakpoint);

    return currentIndex >= targetIndex;
  }

  /**
   * Check if current viewport is at most the specified breakpoint
   */
  isAtMost(breakpoint: BreakpointName): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const breakpointOrder: BreakpointName[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint());
    const targetIndex = breakpointOrder.indexOf(breakpoint);

    return currentIndex <= targetIndex;
  }

  /**
   * Get CSS classes for responsive design
   */
  getResponsiveClasses(config: Partial<Record<BreakpointName, string>>): string {
    const classes: string[] = [];

    Object.entries(config).forEach(([breakpoint, className]) => {
      if (className && this.matches(breakpoint as BreakpointName)) {
        classes.push(className);
      }
    });

    return classes.join(' ');
  }

  /**
   * Get columns count based on current breakpoint
   */
  getResponsiveColumns(columnConfig: Partial<Record<BreakpointName, number>>): number {
    const current = this.currentBreakpoint();

    // Try to find exact match first
    if (columnConfig[current] !== undefined) {
      return columnConfig[current]!;
    }

    // Fallback to smaller breakpoints
    const breakpointOrder: BreakpointName[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = breakpointOrder.indexOf(current);

    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (columnConfig[bp] !== undefined) {
        return columnConfig[bp]!;
      }
    }

    return 1; // Default to 1 column
  }

  /**
   * Get spacing value based on current breakpoint
   */
  getResponsiveSpacing(spacingConfig: Partial<Record<BreakpointName, number>>): number {
    const current = this.currentBreakpoint();

    if (spacingConfig[current] !== undefined) {
      return spacingConfig[current]!;
    }

    // Default spacing based on breakpoint
    const defaultSpacing = {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
      '2xl': 32,
    };

    return defaultSpacing[current];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeBreakpointTracking(): void {
    // Use Angular CDK BreakpointObserver for more reliable breakpoint detection
    const breakpointQueries = [
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ];

    this.breakpointObserver
      .observe(breakpointQueries)
      .pipe(
        map(() => this.getCurrentBreakpoint()),
        takeUntil(this.destroy$)
      )
      .subscribe((breakpoint) => {
        this.currentBreakpointSignal.set(breakpoint);
      });
  }

  private initializeViewportTracking(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Initial viewport size
    this.updateViewportSize();

    // Listen for resize events
    const resizeObserver = new ResizeObserver(() => {
      this.updateViewportSize();
    });

    resizeObserver.observe(document.documentElement);

    // Cleanup on destroy
    this.destroy$.subscribe(() => {
      resizeObserver.disconnect();
    });
  }

  private updateViewportSize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.viewportSizeSignal.set({ width, height });
  }

  private getCurrentBreakpoint(): BreakpointName {
    if (!isPlatformBrowser(this.platformId)) {
      return 'md';
    }

    const width = window.innerWidth;

    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  }
}
