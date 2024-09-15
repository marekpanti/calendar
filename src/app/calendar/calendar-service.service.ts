import { Injectable } from '@angular/core';
import { CalendarEvent } from './interfaces/calendar.model';
import { Observable, interval, mergeMap, of } from 'rxjs';

export const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  public meetings: CalendarEvent<any>[] = [];
  public rowHeight = 50;

  meetingRows: CalendarEvent<any>[][] = [];

  toFixedNumber(num: number, digits: number, base: number): number {
    const pow = Math.pow(base || 10, digits);
    return Math.round(num * pow) / pow;
  }

  createRows(): void {
    if (this.meetings) {
      this.meetings = this.meetings?.map(
        (consultation: CalendarEvent<any>) => ({
          ...consultation,
          positionStartAt:
            new Date(consultation.start).getHours() +
            this.toFixedNumber(
              new Date(consultation.start).getMinutes() / 60,
              2,
              10
            ),
          positionEndAt:
            new Date(consultation?.end || new Date()).getHours() +
            this.toFixedNumber(
              new Date(consultation.end || new Date()).getMinutes() / 60,
              2,
              10
            ),
        })
      );
      this.meetings.sort((a: CalendarEvent, b: CalendarEvent) => {
        if (a.start > b.start) return 1;
        return -1;
      });
      this.meetingRows = [];
      this.meetings.forEach((meeting: CalendarEvent) => {
        const lastRow: CalendarEvent[] =
          this.meetingRows[this.meetingRows.length - 1];
        if (!lastRow) {
          this.meetingRows.push([meeting]);
        } else {
          const maxEnd = Math.max(...lastRow.map((m) => m.positionEndAt || 0));
          if (maxEnd > (meeting.positionStartAt || 0)) {
            lastRow.push(meeting);
          } else {
            this.meetingRows.push([meeting]);
          }
        }
      });
    }
  }

  packRow(row: CalendarEvent[]): any[][] {
    const columns: any[][] = [];
    row.forEach((meeting) => {
      const convertedMeeting: any = {
        ...meeting,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
      if (columns.length === 0) {
        columns.push([convertedMeeting]);
      } else {
        const columnForTheMeeting = columns.findIndex((column) => {
          const lastInColumn = column[column.length - 1];
          return lastInColumn.positionEndAt <= convertedMeeting.positionStartAt;
        });
        if (columnForTheMeeting === -1) {
          columns.push([convertedMeeting]);
        } else {
          columns[columnForTheMeeting].push(convertedMeeting);
        }
      }
    });
    return columns;
  }

  calcSize(events: CalendarEvent[], rowHeightPx: number): any[] {
    this.rowHeight = rowHeightPx;
    this.meetings = events;
    this.createRows();
    // I don't know how to type this correctly
    const grid: any[] = this.meetingRows.map((row) => this.packRow(row));

    const boxes: any[] = grid.reduce((acc, row) => {
      row.forEach((col: any, j: number) => {
        col.forEach((meeting: any) => {
          const width = 100 / row.length;
          acc.push({
            ...meeting,
            y: meeting.positionStartAt * this.rowHeight,
            x: j * width,
            width,
            height:
              (meeting.positionEndAt - meeting.positionStartAt) *
              this.rowHeight,
          });
        });
      });
      return acc;
    }, []);
    return boxes;
  }

  getCurrentHourOffsetTop(date: Date): number {
    return (
      (date.getHours() + this.toFixedNumber(date.getMinutes() / 60, 2, 10)) *
      this.rowHeight
    );
  }

  public updateTimeEverySecond(): Observable<{ time: Date; hourOffset: number }> {
    return interval(1000).pipe(
      mergeMap(() =>
        of({
          time: new Date(),
          hourOffset: this.getCurrentHourOffsetTop(new Date()),
        })
      )
    );
  }

  getDaysInPeriod(date: Date): Date[] {
    console.log(date);
    const daysInPeriod = [];
    const currentDate = new Date(this.getMondayOfWeek(date));
    console.log(currentDate.getTime())
    const lastDay = new Date(currentDate.getTime() + DAY_IN_MILLISECONDS * 6);
    console.log(currentDate, lastDay);
    while (currentDate <= lastDay) {
      daysInPeriod.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log(daysInPeriod);
    return daysInPeriod;
  }

  private getMondayOfWeek(date: Date): Date {
    // find the day of the week for the given date (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = date.getDay();

    // calculate the number of days between the given date and the Monday of the same week
    const daysToMonday = (dayOfWeek + 6) % 7;

    // calculate the date of the Monday in the same week
    return new Date(date.getTime() - daysToMonday * 24 * 60 * 60 * 1000);
  }

  // this will create an array of a week of a current selected day
  // createWeekDatesArray(date: Date): AppointmentInWeek[] {
  //   return Array.from(Array(7).keys()).map(idx => {
  //     const d = new Date(date);
  //     d.setDate(d.getDate() - (d.getDay() + 6) + idx);
  //     return { date: d, events: [] };
  //   });
  // }
}
