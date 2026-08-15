export interface NotificationSettings {
  weeklySummary: boolean
}

export interface AppSettings {
  minValue: number
  maxValue: number
  notifications: NotificationSettings
}

export const DEFAULT_SETTINGS: AppSettings = {
  minValue: 70,
  maxValue: 140,
  notifications: {
    weeklySummary: true,
  },
}
