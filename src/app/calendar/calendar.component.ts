import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VIEWS } from './interfaces/calendar.model';
import { SmartComponent } from './components/smart/smart.component';
import { WeekComponent } from "./components/week/week.component";

@Component({
  selector: 'app-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  imports: [SmartComponent, WeekComponent]
})
export class CalendarComponent {
  VIEWS = VIEWS;
  view: VIEWS = VIEWS.WEEK;

  selectedDay = new Date();

  selectDate($event: Date) {
    this.selectedDay = new Date($event);
  }
}
