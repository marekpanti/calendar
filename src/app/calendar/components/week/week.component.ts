import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CalendarService } from '../../calendar-service.service';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { DayComponent } from '../day/day.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { toSignal } from '@angular/core/rxjs-interop';
import { eventsDemo } from '../../../events';

@Component({
  selector: 'app-week',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [JsonPipe, DayComponent, DatePipe, CommonModule],
  templateUrl: './week.component.html',
  styleUrl: './week.component.scss',
  animations: [
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class WeekComponent {
  @Input() events: any = [];
  @Input() selectedDate = new Date();
  @Output() onChangeDate: EventEmitter<Date> = new EventEmitter();
  private counter$ = this.calendarService.updateTimeEverySecond();

  today = new Date();
  days = ['Po', 'Ut', 'St', 'Št', 'Pia', 'So', 'Ne'];
  week = this.calendarService.getDaysInPeriod(this.selectedDate);
  counter = toSignal(this.counter$);
  convertedEvents: any = [];
  ROW_HEIGHT_PX = 50;

  constructor(public calendarService: CalendarService) {}

  tempMethod() {
    this.events = eventsDemo.results.map((item) => {
      if (item.type === 'event') {
        const { event } = item;
        return {
          id: event.id,
          start: new Date(event.start),
          end: new Date(event.end),
          title: event?.name || '',
          allDay: event.allDay,
          color: {
            primary: event?.color || '',
            secondary: event?.color || '' + '33',
          },
          resizable: {
            beforeStart: false,
            afterEnd: false,
          },
          draggable: false,
          meta: {
            activity: event?.activity || null,
            place: event?.place || null,
            capacity: event?.capacity,
            // attendance: event?.attendance,
            employees: event.assignedEmployees,
            groups: event.assignedCustomerGroups,
          },
        };
      }
      return null;
    });

    this.week.forEach((date) => {
      this.convertedEvents[date.getDate()] = [];
    });

    this.events.forEach((event: any) => {
      if (this.convertedEvents[event.start.getDate()]) {
        this.convertedEvents[event.start.getDate()].push(event);
      }
    });

    this.convertedEvents = this.convertedEvents.map((events: any) => {
      return this.calendarService.calcSize(events, this.ROW_HEIGHT_PX);
    });
  }

  ngOnInit() {
    this.tempMethod();
    console.log(this.selectedDate);
  }

  ngOnChanges() {
    this.week = this.calendarService.getDaysInPeriod(this.selectedDate);
  }

  changeSelected(n: number) {
    this.selectedDate.setDate(this.selectedDate.getDate() + n);
    this.week = this.calendarService.getDaysInPeriod(this.selectedDate);
    this.onChangeDate.emit(this.selectedDate)
  }
}
