import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VIEWS } from './interfaces/calendar.model';
import { SmartComponent } from './components/smart/smart.component';
import { WeekComponent } from './components/week/week.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  imports: [SmartComponent, WeekComponent],
})
export class CalendarComponent {
  VIEWS = VIEWS;
  view: VIEWS = VIEWS.WEEK;

  selectedDay = new Date();
  events = this.generateRandomEvents(10)

  selectDate($event: Date) {
    this.selectedDay = new Date($event);
  }

  generateRandomDateInWeek(): Date {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Start of the current week (Sunday)
    const randomDay = Math.floor(Math.random() * 7); // Random day of the week (0-6)
    const randomHour = Math.floor(Math.random() * 24); // Random hour (0-23)
    const randomMinute = Math.floor(Math.random() * 60); // Random minute (0-59)
    const randomDate = new Date(startOfWeek);
    randomDate.setDate(startOfWeek.getDate() + randomDay);
    randomDate.setHours(randomHour, randomMinute, 0, 0);
    return randomDate;
  }

  generateRandomEventColor(): string {
    const colors = ['#1abc9c', '#3498db', '#e74c3c', '#e67e22', '#c0392b', '#f1c40f'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  generateRandomTitle(): string {
    const titles = [
      'Meeting',
      'Workshop',
      'Team Lunch',
      'Conference Call',
      'Project Review',
      'Deadline',
      'Presentation',
      'Training',
      'Webinar',
      'Networking Event',
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  generateRandomEvents(count: number): any[] {
    const events: any[] = [];
    for (let i = 0; i < count; i++) {
      const start = this.generateRandomDateInWeek();
      const duration = Math.floor(Math.random() * 4) + 1; // Event lasts 1 to 4 hours
      const end = new Date(start);
      end.setHours(start.getHours() + duration);

      events.push({
        id: i + 1,
        start,
        end,
        color: {primary: this.generateRandomEventColor()},
        title: this.generateRandomTitle(),
        allDay: Math.random() < 0.1, // 10% chance to be an all-day event
        draggable: true,
        meta: {
          description: `Details for event ${i + 1}`,
        },
      });
    }
    return events;
  }
}
