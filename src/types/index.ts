export type TCalendarView = "day" | "week" | "month" | "year" | "agenda";
export type TEventColor = "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "gray";
export type TBadgeVariant = "dot" | "colored" | "mixed";
export type TWorkingHours = { [key: number]: { from: number; to: number } };
export type TVisibleHours = { from: number; to: number };



export interface IEvent {
  id: number;
  start_date: string;
  end_date: string;
  title: string;
  color: TEventColor;
  description: string;
}

export type IEventFormData  = Omit<IEvent, "id"> 


export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}


export interface EventResponse {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface EventResponse {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    color: string;
    created_at: string;
    updated_at: string;
  }

export interface ShortcutItem {
  id: string;
  name: string;
  path: string;
  type: 'application' | 'file' | 'folder';
  icon?: string; // base64 图标数据
  created_at: string;
  updated_at: string;
}

export interface CreateShortcutRequest {
  name: string;
  path: string;
  type: 'application' | 'file' | 'folder';
}

export interface UpdateShortcutRequest {
  id: string;
  name?: string;
  path?: string;
  type?: 'application' | 'file' | 'folder';
}