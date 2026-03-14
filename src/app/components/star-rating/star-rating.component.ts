import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" [class.interactive]="interactive">
      <span
        *ngFor="let star of stars"
        class="star"
        [class.filled]="star <= displayValue"
        [class.hovered]="interactive && star <= hoverValue"
        (mouseenter)="interactive && onHover(star)"
        (mouseleave)="interactive && onHoverLeave()"
        (click)="interactive && onSelect(star)"
      >★</span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      gap: 2px;
    }

    .star {
      font-size: 1.4rem;
      color: #d1d5db;
      line-height: 1;
      transition: color 0.15s ease, transform 0.15s ease;
    }

    .star.filled {
      color: #f59e0b;
    }

    .interactive .star {
      cursor: pointer;
      font-size: 2rem;
    }

    .interactive .star:hover,
    .interactive .star.hovered {
      color: #fbbf24;
      transform: scale(1.15);
    }
  `]
})
export class StarRatingComponent {
  @Input() value: number = 0;
  @Input() interactive: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5];
  hoverValue = 0;

  get displayValue(): number {
    return this.hoverValue || this.value;
  }

  onHover(star: number): void {
    this.hoverValue = star;
  }

  onHoverLeave(): void {
    this.hoverValue = 0;
  }

  onSelect(star: number): void {
    this.ratingChange.emit(star);
  }
}