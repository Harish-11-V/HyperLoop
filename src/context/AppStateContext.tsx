import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cloudProviders as seedProviders,
  notifications as seedNotifications,
  recommendations as seedRecommendations,
  storageSnapshot,
  type AppNotification,
  type CloudProvider,
  type Recommendation,
  type RecommendationStatus,
} from "@/data/demoData";

export interface Settings {
  criticalThreshold: number;
  warningThreshold: number;
  autoAnalysis: boolean;
  approveMigration: boolean;
  approveDeletion: boolean;
  aggressiveness: number;
  emailAlerts: boolean;
  inAppAlerts: boolean;
  autonomousMode: boolean;
  demoMode: boolean;
}

interface AppState {
  snapshot: typeof storageSnapshot;
  recommendations: Recommendation[];
  decideRecommendation: (id: string, status: RecommendationStatus) => void;
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  providers: CloudProvider[];
  toggleProvider: (id: string) => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  reclaimedGb: number;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [recs, setRecs] = useState<Recommendation[]>(seedRecommendations);
  const [notifs, setNotifs] = useState<AppNotification[]>(seedNotifications);
  const [providers, setProviders] = useState<CloudProvider[]>(seedProviders);
  const [settings, setSettings] = useState<Settings>({
    criticalThreshold: 90,
    warningThreshold: 80,
    autoAnalysis: true,
    approveMigration: true,
    approveDeletion: true,
    aggressiveness: 40,
    emailAlerts: false,
    inAppAlerts: true,
    autonomousMode: false,
    demoMode: true,
  });

  const decideRecommendation = useCallback(
    (id: string, status: RecommendationStatus) => {
      setRecs((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    },
    [],
  );

  const markRead = useCallback((id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const toggleProvider = useCallback((id: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id && p.status !== "coming-soon"
          ? { ...p, status: p.status === "connected" ? "available" : "connected" }
          : p,
      ),
    );
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const reclaimedGb = useMemo(
    () =>
      recs
        .filter((r) => r.status === "approved")
        .reduce((sum, r) => sum + r.recoveryGb, 0),
    [recs],
  );

  const value = useMemo<AppState>(
    () => ({
      snapshot: {
        ...storageSnapshot,
        usedGb: Math.max(0, storageSnapshot.usedGb - reclaimedGb),
      },
      recommendations: recs,
      decideRecommendation,
      notifications: notifs,
      unreadCount: notifs.filter((n) => !n.read).length,
      markRead,
      markAllRead,
      providers,
      toggleProvider,
      settings,
      updateSettings,
      reclaimedGb,
    }),
    [
      recs,
      notifs,
      providers,
      settings,
      reclaimedGb,
      decideRecommendation,
      markRead,
      markAllRead,
      toggleProvider,
      updateSettings,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
