export interface AppInfo {
  packageName: string;      // e.g., "com.spotify.music"
  label: string;            // e.g., "Spotify"
  icon?: string;            // Base64 or URI
}

export interface WeightedApp extends AppInfo {
  weight: number;           // 1-10
}

export interface UserPreferences {
  isFirstLaunch: boolean;
  selectedApps: WeightedApp[];
  lastModified: string;     // ISO timestamp
}
