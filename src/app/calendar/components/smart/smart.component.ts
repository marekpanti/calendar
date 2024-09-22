import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  ConvertedCalendarEvent,
  GenericEvent,
} from '../../interfaces/calendar.model';
import { CalendarService } from '../../calendar-service.service';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { DayComponent } from '../day/day.component';
import { AngularDateTimePickerComponent } from '../date-picker/angular-date-time-picker.component';
import { AngularDateTimePickerDirective } from '../date-picker/angular-date-time-picker.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { animate, style, transition, trigger } from '@angular/animations';
import { eventsDemo } from '../../../events';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { TooltipService } from '../tooltip/tooltip.service';

@Component({
  selector: 'app-smart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    JsonPipe,
    DatePipe,
    DayComponent,
    AngularDateTimePickerComponent,
    AngularDateTimePickerDirective,
    TooltipComponent,
    TooltipDirective,
  ],
  providers: [TooltipService],
  animations: [
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
  templateUrl: './smart.component.html',
  styleUrl: './smart.component.scss',
})
export class SmartComponent implements OnInit {
  @Input() events: any[] = []; // TODO type
  @Input() set selectedDate(date: Date) {
    this.date = new Date(new Date(date).setDate(1))
    this.selectDay(date.getDate() - 1);
  };
  @Output() onChangeDate: EventEmitter<Date> = new EventEmitter();

  calendarViewExpanded = signal(true);
  calendarDayExpanded = true;
  convertedEvents: ConvertedCalendarEvent = {};
  timeView = 'time';
  ROW_HEIGHT_PX = 50;

  currentEventSizes: any[] = [];

  date = new Date(new Date().setDate(1));
  currentDay = new Date();
  currentYear = this.date.getFullYear();
  lastDay = new Date(
    this.date.getFullYear(),
    this.date.getMonth() + 1,
    0
  ).getDate();
  prevLastDay = new Date(
    this.date.getFullYear(),
    this.date.getMonth(),
    0
  ).getDate();
  firstDayIndex = this.date.getDay();
  lastDayIndex = new Date(
    this.date.getFullYear(),
    this.date.getMonth() + 1,
    0
  ).getDay();
  nextDays = 7 - this.lastDayIndex - 1;
  prevDays: number[] = [];
  currentDaysHashTable: any = {};
  currentDaysArray: any[] = [];
  lastDays: number[] = [];
  isSetHoursOpen = false;
  clickedDate: Date;
  currentClickedIndex: number;
  innerWidth: number = window.innerWidth;

  months = [
    'Január',
    'Február',
    'Marec',
    'Apríl',
    'Máj',
    'Jún',
    'Júl',
    'August',
    'September',
    'Oktober',
    'November',
    'December',
  ];
  viewEvents: any[];

  private counter$ = this.calendarService.updateTimeEverySecond();
  public counter = toSignal(this.counter$);

  constructor(public calendarService: CalendarService) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
  }

  tempMethod() {
    this.events = eventsDemo.results.map((item) => {
      if (item.type === 'event') {
        const { event } = item
        return {
          id: event.id,
          start: new Date(event.start),
          end: new Date(event.end),
          title: event?.name || '',
          allDay: event.allDay,
          color: { primary: event?.color || '', secondary: event?.color || '' + '33' },
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
        }
      }
      return null
    })
  }

  ngOnInit() {
    this.tempMethod();
    this.calcDays();
    // this.calendarViewExpanded.set(true);
    this.calendarDayExpanded = true;

    if (this.events.length > 0) {
      this.convertedEvents = {};
      this.events.forEach((event: any) => {
        // filter if current month and year
        if (new Date(event.start).getMonth() === this.date.getMonth()) {
          if (this.convertedEvents[new Date(event.start).getDate()]) {
            this.convertedEvents[new Date(event.start).getDate()] = [
              ...this.convertedEvents[new Date(event.start).getDate()],
              event,
            ];
          } else {
            this.convertedEvents[new Date(event.start).getDate()] = [event];
          }
        }
      });
    }
  }

  selectDate(e: any) {
    this.clickedDate = e;
    this.date = new Date(new Date(e).setDate(1))
    this.selectDay(e.getDate() - 1)
  }

  // ngOnChanges() {
  //   if (this.events.length > 0) {
  //     this.convertedEvents = {};
  //     this.events.forEach((event: any) => {
  //       // filter if current month and year
  //       if (event.start.getMonth() === this.date.getMonth()) {
  //         if (this.convertedEvents[event.start.getDate()]) {
  //           this.convertedEvents[event.start.getDate()] = [
  //             ...this.convertedEvents[event.start.getDate()],
  //             event,
  //           ];
  //         } else {
  //           this.convertedEvents[event.start.getDate()] = [event];
  //         }
  //       }
  //     });
  //   }
  //   console.log(this.convertedEvents)
  // }

  toggleCalendarView() {
    this.calendarDayExpanded = true;
    this.calendarViewExpanded.set(!this.calendarViewExpanded());
  }

  toggleDayView() {
    this.calendarViewExpanded.set(true);
    this.calendarDayExpanded = !this.calendarDayExpanded;
  }

  calcDays() {
    this.lastDay = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDate();
    this.prevLastDay = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      0
    ).getDate();
    this.firstDayIndex = this.date.getDay() === 0 ? 7 : this.date.getDay();
    this.lastDayIndex = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDay();
    this.nextDays = 7 - this.lastDayIndex - 1;
    this.prevDays = [];
    this.lastDays = [];
    this.currentDaysHashTable = {};

    if (this.date.getFullYear() !== this.currentYear) {
      this.currentYear = this.date.getFullYear();
    }

    // get the previous days in current view of calendar
    for (let x = this.firstDayIndex; x > 1; x--) {
      this.prevDays.push(this.prevLastDay - x + 2); // + 2 because we are starting from monday, which is index 1
    }

    // create hash table of current days in a current month
    // so we can pair it with the data
    for (let i = 1; i <= this.lastDay; i++) {
      this.currentDaysHashTable[i] = {
        day: i,
        data: [],
        total: {
          hours: 0,
          minutes: 0,
        },
      };
    }

    //finally we are converting hash table into readable array
    this.currentDaysArray = Object.keys(this.currentDaysHashTable).map(
      (key) => this.currentDaysHashTable[key]
    );

    for (let j = 1; j <= this.nextDays; j++) {
      this.lastDays.push(j);
    }
  }

  calcEventOffsetTop(event: any) {
    const start =
      new Date(event.start).getHours() +
      new Date(event.start).getMinutes() / 60;
    const percentage = start / 24;
    const totalHeight = 23 * 52;
    const offset = this.round(percentage * totalHeight, 1);
    return offset - 40 + 'px';
  }

  round(value: number, precision: number) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  calcEventHeight(event: any) {
    const start =
      new Date(event.start).getHours() +
      new Date(event.start).getMinutes() / 60;
    const end =
      new Date(event.end).getHours() + new Date(event.end).getMinutes() / 60;
    const percentage = (end - start) / 24;
    const totalHeight = 23 * 52;
    const height = this.round(percentage * totalHeight, 0);
    return height + 'px';
  }

  selectDay(selectedDayIndex: number) {
    this.isSetHoursOpen = true;
    const currentYear = this.date.getFullYear();
    const currentMonth = this.date.getMonth();
    this.clickedDate = new Date(
      currentYear,
      currentMonth,
      selectedDayIndex + 1
    );
    this.currentClickedIndex = selectedDayIndex;
    this.viewEvents = this.calendarService.calcSize(
      this.convertedEvents[selectedDayIndex + 1],
      this.ROW_HEIGHT_PX
    );
    this.onChangeDate.emit(this.clickedDate);
  }

  close() {
    // emit output of removing data
    this.currentDaysArray[this.clickedDate.getDate() - 1].data = null;
    this.isSetHoursOpen = false;
  }

  prev() {
    this.date.setMonth(this.date.getMonth() - 1);
    this.calcDays();
    this.onChangeDate.emit(this.date);
  }

  next() {
    this.date.setMonth(this.date.getMonth() + 1);
    this.calcDays();
    this.onChangeDate.emit(this.date);
  }
}
