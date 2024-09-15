export enum VIEWS {
  WEEK = 'WEEK',
  SMART = 'SMART'
}

export interface ListItem {
  id: string
  name: string
}

export interface GenericEvent {
  id?: string | number
  start: Date
  end: Date
  name: string
  allDay?: boolean
  cssClass?: string
  draggable?: boolean
  positionStartAt?: number
  positionEndAt?: number
}

export interface Filters {
  name: string
  activityIds: string[]
  placeIds: string[]
}

export interface CalendarEvent<MetaType = any> {
  id?: string | number
  start: Date
  end?: Date
  title: string
  color?: EventColor
  allDay?: boolean
  cssClass?: string
  draggable?: boolean
  meta?: MetaType
  positionStartAt?: number
  positionEndAt?: number
}

export interface EventColor {
  primary: string
  secondary: string
}

export interface ConvertedCalendarEvent {
  [key: string]: CalendarEvent[];
}
