// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
// import echo from "@/echo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const NotificationContext = createContext();


export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

// ✅ API helper
const apiRequest = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem("token");

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const API_BASE = "http://travel-server.test/api";
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const fastPollingRef = useRef(null);

  // ✅ Add notification manually
  const addNotification = useCallback(
    (notification, showToast = true) => {
      const enhancedNotification = {
        ...notification,
        text: notification.message || notification.text,
        is_read: notification.is_read ?? false,
      };

      setNotifications((prev) => [enhancedNotification, ...prev]);

      if (showToast && !enhancedNotification.is_read) {
        toast({
          title: t("notificationReceived") || "New Notification",
          description: enhancedNotification.text,
        });

        if (audioRef.current) {
          audioRef.current.play().catch((err) => console.error("Audio play failed:", err));
        }
      }
    },
    [t]
  );

  // ✅ WebSockets (Reverb) integration (أولوية للنسخة الأولى)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    echo
      .channel("notifications.all")
      .listen(".notification.sent", (e) => {
        console.log("Global Notification:", e);
        addNotification(e.notification);
      });

    echo
      .channel(`notifications.role.${user.role_id}`)
      .listen(".notification.sent", (e) => {
        console.log("Role Notification:", e);
        addNotification(e.notification);
      });

    echo
      .private(`notifications.user.${user.id}`)
      .listen(".notification.sent", (e) => {
        console.log("User Notification:", e);
        addNotification(e.notification);
      })
      .listen(".notification.read", (e) => {
        console.log("Notification Read:", e);
      });

    return () => {
      echo.leaveChannel("notifications.all");
      echo.leaveChannel(`notifications.role.${user.role_id}`);
      echo.leaveChannel(`private-notifications.user.${user.id}`);
    };
  }, [isAuthenticated, user, addNotification]);

  // ✅ Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      setIsLoading(true);
      const response = await apiRequest("/notifications/user");

      if (response.status) {
        const enhanced = response.data.map((n) => ({
          ...n,
          text: n.message || n.text,
        }));

        // detect new ones
        const newOnes = enhanced.filter(
          (n) => !notifications.some((x) => x.id === n.id)
        );

        newOnes.forEach((n) => {
          if (!n.is_read) addNotification(n);
        });

        setNotifications(enhanced);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      if (notifications.length > 0) {
        toast({
          title: t("error") || "Error",
          description:
            t("failedToFetchNotifications") ||
            "Failed to fetch notifications",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, notifications, addNotification, t]);

  // ✅ Polling (smart polling from second code)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const startNormalPolling = () => {
      if (pollingIntervalRef.current) return;
      pollingIntervalRef.current = setInterval(fetchNotifications, 15000);
    };

    const startFastPolling = () => {
      if (fastPollingRef.current) return;
      fastPollingRef.current = setInterval(fetchNotifications, 5000);
      setTimeout(() => {
        if (fastPollingRef.current) {
          clearInterval(fastPollingRef.current);
          fastPollingRef.current = null;
        }
      }, 60000);
    };

    const stopNormalPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    const handleFocus = () => {
      fetchNotifications();
      startFastPolling();
      startNormalPolling();
    };

    const handleBlur = () => {
      stopNormalPolling();
    };

    startNormalPolling();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleFocus();
      else handleBlur();
    });

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (fastPollingRef.current) clearInterval(fastPollingRef.current);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isAuthenticated, user, fetchNotifications]);

  // ✅ Mark as read
  const markAsRead = useCallback(
    async (id) => {
      const n = notifications.find((x) => x.id === id);
      if (!n || n.is_read) return;

      setNotifications((prev) =>
        prev.map((x) => (x.id === id ? { ...x, is_read: true } : x))
      );

      try {
        await apiRequest(`/notifications/${id}/mark-read`, { method: "POST" });
      } catch (err) {
        console.error("Error marking read:", err);
        setNotifications((prev) =>
          prev.map((x) => (x.id === id ? { ...x, is_read: false } : x))
        );
        toast({
          title: t("error") || "Error",
          description:
            t("failedToMarkAsRead") || "Failed to mark notification as read",
          variant: "destructive",
        });
      }
    },
    [notifications, t]
  );

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await apiRequest("/notifications/mark-all-read", { method: "POST" });
      toast({
        title: t("success") || "Success",
        description:
          t("allNotificationsMarkedAsRead") ||
          "All notifications marked as read",
      });
    } catch (err) {
      console.error("Error mark all read:", err);
      fetchNotifications();
      toast({
        title: t("error") || "Error",
        description:
          t("failedToMarkAllAsRead") || "Failed to mark all notifications",
        variant: "destructive",
      });
    }
  }, [notifications, fetchNotifications, t]);

  // ✅ Create new notification
  const createNotification = useCallback(
    async (data) => {
      try {
        const payload = {
          title: data.title || "",
          message: data.message || data.text || "",
          role_id: data.sendTo === "specific" ? data.role_id : null,
          sendTo: data.sendTo === "specific" ? "role" : "all",
          deliveryMethod: data.deliveryMethod || "inApp",
        };

        const res = await apiRequest("/notifications", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (res.status) {
          toast({
            title: t("success") || "Success",
            description:
              t("notificationSent") || "Notification sent successfully",
          });
          if (res.data) addNotification(res.data, false);
          setTimeout(() => fetchNotifications(), 1000);
          return res.data;
        }
      } catch (err) {
        console.error("Error creating notification:", err);
        toast({
          title: t("error") || "Error",
          description: "Failed to send notification",
          variant: "destructive",
        });
        throw err;
      }
    },
    [fetchNotifications, addNotification, t]
  );

  const getUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) return 0;
    try {
      const res = await apiRequest("/notifications/unread-count");
      return res.data?.unread_count || 0;
    } catch (err) {
      console.error("Error get unread count:", err);
      return 0;
    }
  }, [isAuthenticated, user]);

  const getRoles = useCallback(async () => {
    try {
      const res = await apiRequest("/roles-notifications");
      return res.data || [];
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast({
        title: t("error") || "Error",
        description: t("failedToFetchRoles") || "Failed to fetch roles",
        variant: "destructive",
      });
      return [];
    }
  }, [t]);

  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isLoading,
        addNotification,
        markAsRead,
        markAllAsRead,
        createNotification,
        getRoles,
        getUnreadCount,
        refreshNotifications,
        unreadCount: notifications.filter((n) => !n.is_read).length,
      }}
    >
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      {children}
    </NotificationContext.Provider>
  );
};
