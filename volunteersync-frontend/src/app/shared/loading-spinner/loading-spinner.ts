import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  imports: [CommonModule],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.css',
})
export class LoadingSpinnerComponent {
  // Inputs
  size = input<'sm' | 'md' | 'lg'>('md');
  color = input<'blue' | 'gray' | 'white'>('blue');
  message = input<string>('Loading...');
  fullScreen = input<boolean>(false);
}
