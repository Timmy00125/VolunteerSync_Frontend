import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  imports: [CommonModule],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  color = input<'primary' | 'white' | 'gray'>('primary');
  text = input<string>('');

  get sizeClasses(): string {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };
    return sizes[this.size()];
  }

  get colorClasses(): string {
    const colors = {
      primary: 'text-blue-600',
      white: 'text-white',
      gray: 'text-gray-600',
    };
    return colors[this.color()];
  }
}
