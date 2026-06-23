"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
}

interface NotificationContextValue {
  notify: (
    type: NotificationType,
    title: string,
    message?: string
  ) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: "border-green-200 bg-green-50 text-green-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

const iconStyles = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
  warning: "text-amber-500",
};

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (type: NotificationType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove]
  );

  const success = useCallback(
    (title: string, message?: string) => notify("success", title, message),
    [notify]
  );
  const error = useCallback(
    (title: string, message?: string) => notify("error", title, message),
    [notify]
  );
  const info = useCallback(
    (title: string, message?: string) => notify("info", title, message),
    [notify]
  );
  const warning = useCallback(
    (title: string, message?: string) => notify("warning", title, message),
    [notify]
  );

  const value: NotificationContextValue = {
    notify,
    success,
    error,
    info,
    warning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => {
          const Icon = icons[n.type];
          return (
            <div
              key={n.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right ${styles[n.type]}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconStyles[n.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{n.title}</p>
                {n.message && (
                  <p className="text-xs mt-0.5 opacity-80">{n.message}</p>
                )}
              </div>
              <button
                onClick={() => remove(n.id)}
                className="shrink-0 opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
}
