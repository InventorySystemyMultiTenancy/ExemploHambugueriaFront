import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth.js";

// Derive socket URL from VITE_API_URL (strip /api suffix)
const SOCKET_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3001/api"
).replace(/\/api\/?$/, "");

export default function RealtimeBridge() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[HB] Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("[HB] Socket disconnected");
    });

    socket.on("order:created", (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["motoboy-orders"] });
      window.dispatchEvent(
        new CustomEvent("hb:order_created", { detail: data }),
      );
    });

    socket.on("order:status_updated", (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["motoboy-orders"] });
      if (data?.order?.id) {
        queryClient.invalidateQueries({
          queryKey: ["order-detail", data.order.id],
        });
      }
      window.dispatchEvent(
        new CustomEvent("hb:order_status_updated", { detail: data }),
      );
    });

    socket.on("order:payment_updated", (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      if (data?.orderId) {
        queryClient.invalidateQueries({
          queryKey: ["order-detail", data.orderId],
        });
      }
      window.dispatchEvent(
        new CustomEvent("hb:payment_updated", { detail: data }),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, queryClient]);

  return null;
}
