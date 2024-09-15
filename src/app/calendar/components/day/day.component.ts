import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-day',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
  templateUrl: './day.component.html',
  styleUrl: './day.component.scss',
})
export class DayComponent {
  @Input() dailyEvents: any[] = []; // TODO type

  ngOnInit() {
    console.log(this.dailyEvents);
  }
}
