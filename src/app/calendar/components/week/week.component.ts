import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CalendarService } from '../../calendar-service.service';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { DayComponent } from '../day/day.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { toSignal } from '@angular/core/rxjs-interop';

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
export class WeekComponent implements OnInit {
  @Input() events: any = [];
  @Input() selectedDate = new Date();
  @Output() onChangeDate: EventEmitter<Date> = new EventEmitter();
  private counter$ = this.calendarService.updateTimeEverySecond();

  today = new Date();
  days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  week = this.calendarService.getDaysInPeriod(this.selectedDate, false, false);
  counter = toSignal(this.counter$);
  convertedEvents: any = [];
  ROW_HEIGHT_PX = 50;
  isResponsive = false;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if (window.innerWidth < 900) {
      this.isResponsive = true;
      this.week = this.calendarService.getDaysInPeriod(
        this.selectedDate,
        this.isResponsive,
        true
      );
    } else {
      this.isResponsive = false;
      this.week = this.calendarService.getDaysInPeriod(
        this.selectedDate,
        this.isResponsive,
        false
      );
    }
  }

  constructor(public calendarService: CalendarService) {}

  ngOnInit() {
    if (window.innerWidth < 900) {
      this.tempMethod();
      this.isResponsive = true;
      this.week = this.calendarService.getDaysInPeriod(
        this.selectedDate,
        this.isResponsive,
        true
      );
    } else {
      this.tempMethod();
    }
  }

  tempMethod() {
    this.week.forEach((date) => {
      this.convertedEvents[date.getDate()] = [];
    });

    this.events.forEach((event: any) => {
      if (this.convertedEvents[event.start.getDate()]) {
        this.convertedEvents[event.start.getDate()].push(event);
      }
    });

    this.convertedEvents = this.convertedEvents.map((events: any) => {
      const sorted = events.sort(
        (a: any, b: any) => a.start - b.start
      );
      return this.calendarService.calcSize(sorted, this.ROW_HEIGHT_PX);
    });
  }

  // ngOnChanges() {
  //   this.week = this.calendarService.getDaysInPeriod(this.selectedDate, this.isResponsive, false);
  // }

  changeSelected(n: number) {
    let number = 7;
    if (this.isResponsive) {
      number = 3;
    }
    this.selectedDate.setDate(this.selectedDate.getDate() + number * n);
    this.week = this.calendarService.getDaysInPeriod(
      this.selectedDate,
      this.isResponsive,
      true
    );
    this.tempMethod();
    this.onChangeDate.emit(this.selectedDate);
  }
}
