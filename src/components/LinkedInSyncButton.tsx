"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LinkedInSyncButton({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setSyncing(true);
    setMessage("");

    try {
      const res = await fetch(`/api/contacts/${contactId}/linkedin`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Sync failed");
      } else {
        setMessage("Synced successfully");
        router.refresh();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="w-full mt-3 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        {syncing ? "Syncing..." : "Sync LinkedIn Data"}
      </button>
      {message && (
        <p className="text-xs text-muted mt-2 text-center">{message}</p>
      )}
    </div>
  );
}
