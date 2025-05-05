import { useEffect } from "react";
import { ablyClient } from "@/utils/ablyClient";
import { useGetIdentity } from "@refinedev/core";
import { toast } from "react-toastify";

interface NotificationMessage {
  id: number;
  expert_id: number;
  data: {
    Title: string;
    Body: string;
  };
  is_read: boolean;
  created_date: string;
}

interface IIdentity {
  id: number;
  name: string;
  avatar?: string;
}

export const useNotificationSystem = () => {
  const { data: user } = useGetIdentity<IIdentity>();

  useEffect(() => {
    if (!user?.id) return;

    const channel = ablyClient.channels.get(`inspector-${user.id}`);

    const handleNotification = (message: { data: NotificationMessage }) => {
      const notification = message.data;

      const event = new CustomEvent(`new-notification-inspector-${user.id}-received`);
      window.dispatchEvent(event);

      toast(notification?.data?.Body || "Bạn có thông báo mới", {
        toastId: `ably-${notification.id}`,
        type: "success",
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    };

    channel.subscribe("Notification", handleNotification);

    return () => {
      channel.unsubscribe("Notification", handleNotification);
    };
  }, [user?.id]);

  return null;
};
