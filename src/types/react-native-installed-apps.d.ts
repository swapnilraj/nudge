declare module 'react-native-installed-apps' {
  export interface InstalledApp {
    packageName: string;
    label?: string;
    icon?: string;
    [key: string]: any;
  }

  const InstalledApps: {
    getAll(): Promise<InstalledApp[]>;
  };

  export default InstalledApps;
}


