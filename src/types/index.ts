export type Status = "HOME" | "BASE" | "TRANSIT" | "UNKNOWN";

export interface Member {
  id: string;
  name: string;
}

export interface Config {
  startDate: string;
  endDate: string;
  members: Member[];
  minBasePresence: number;
}

export interface DailyStatus {
  status: Status;
  arrivalTime?: string;
  departureTime?: string;
}

export interface RootState {
  config: Config;
  schedules: Record<string, Record<string, DailyStatus>>;
}
