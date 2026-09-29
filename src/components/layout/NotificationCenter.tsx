import { useNavigate } from "@tanstack/react-router";
import { useAppState } from "@/context/AppStateContext";
import { StatusBadge } from "@/components/common/primitives";
import { cn } from "@/lib/utils";

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const { notifications, markRead, markAllRead } = useAppState();
  const navigate = useNavigate();

  return (
    <>
      <button
        aria-label="Close notifications"
        className="fixed inset-0 z-40 cursor-default"
        onClick={onClose}
      />
      <div className="absolute top-12 right-0 z-50 w-[22rem] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button
            onClick={markAllRead}
            className="text-[11px] text-primary hover:underline"
          >
            Mark all read
          </button>
        </div>
        <div className="max-h-[22rem] overflow-y-auto">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                markRead(n.id);
                onClose();
                navigate({ to: n.route });
              }}
              className={cn(
                "flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent/10",
                !n.read && "bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">{n.title}</span>
                <StatusBadge
                  tone={
                    n.severity === "warning"
                      ? "warning"
                      : n.severity === "success"
                        ? "success"
                        : "info"
                  }
                >
                  {n.severity}
                </StatusBadge>
              </div>
              <span className="text-[11px] text-muted-foreground">{n.body}</span>
              <span className="text-[10px] text-muted-foreground">{n.time}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
