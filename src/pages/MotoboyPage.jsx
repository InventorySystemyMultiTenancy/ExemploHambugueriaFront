import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../lib/api.js";

const fmt = (v) =>
  Number(v ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function DeliveryCard({ order, onConfirm, confirming }) {
  const [code, setCode] = useState("");
  const items = order.items ?? [];

  return (
    <div
      className="card"
      style={{
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontWeight: 800,
              fontSize: "1rem",
              color: "var(--color-chalk)",
            }}
          >
            #{order.id.slice(-6).toUpperCase()}
          </p>
          <p
            style={{
              margin: "0 0 2px",
              fontSize: "0.78rem",
              color: "var(--color-amber)",
            }}
          >
            {order.user?.name ?? "—"}
          </p>
          {order.user?.phone && (
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                color: "var(--color-ash)",
              }}
            >
              {order.user.phone}
            </p>
          )}
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--color-amber)",
            border: "1px solid rgba(245,166,35,0.4)",
            borderRadius: "4px",
            padding: "2px 8px",
          }}
        >
          {fmt(order.total)}
        </span>
      </div>

      {order.deliveryAddress && (
        <div
          style={{
            background: "var(--color-steel)",
            borderRadius: "0.625rem",
            padding: "0.75rem",
          }}
        >
          <p
            style={{
              margin: "0 0 2px",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "var(--color-ash)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Endereço
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              color: "var(--color-chalk)",
            }}
          >
            {order.deliveryAddress}
          </p>
        </div>
      )}

      {/* Items summary */}
      <ul
        style={{
          margin: 0,
          padding: "0 0 0 1rem",
          fontSize: "0.78rem",
          color: "var(--color-ash)",
          lineHeight: 1.6,
        }}
      >
        {items.map((item) => (
          <li key={item.id}>
            {item.quantity}× {item.product?.name ?? item.combo?.name ?? "Item"}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p
          style={{
            margin: 0,
            fontSize: "0.72rem",
            fontStyle: "italic",
            color: "var(--color-ash)",
          }}
        >
          Obs: {order.notes}
        </p>
      )}

      {/* Confirm delivery */}
      <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.25rem" }}>
        <input
          className="input-dark"
          placeholder="Código de confirmação"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => {
            if (!code.trim()) {
              toast.error("Informe o código de confirmação");
              return;
            }
            onConfirm(order.id, code.trim());
          }}
          disabled={confirming}
          className="btn-amber"
          style={{
            padding: "0.75rem 1rem",
            whiteSpace: "nowrap",
            fontSize: "0.8rem",
          }}
        >
          {confirming ? "..." : "✓ Entregue"}
        </button>
      </div>
    </div>
  );
}

export default function MotoboyPage() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["motoboy-orders"],
    queryFn: async () => {
      const res = await api.get("/motoboy/orders");
      return res.data?.data ?? [];
    },
    refetchInterval: 15_000,
  });

  const confirmMutation = useMutation({
    mutationFn: async ({ orderId, code }) => {
      const res = await api.post(`/motoboy/orders/${orderId}/deliver`, {
        confirmationCode: code,
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoboy-orders"] });
      toast.success("Entrega confirmada! 🚀", {
        style: { background: "#222", color: "#F5A623" },
      });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.error?.message ?? "Erro ao confirmar entrega",
      );
    },
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-pitch)" }}>
      {/* Top bar */}
      <div
        style={{
          background: "var(--color-forge)",
          borderBottom: "1px solid var(--color-smoke)",
          padding: "0 1.5rem",
          height: "60px",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <h1
          className="font-display"
          style={{
            margin: 0,
            fontSize: "1.75rem",
            color: "var(--color-amber)",
          }}
        >
          🛵 ENTREGAS
        </h1>
        <span style={{ fontSize: "0.8rem", color: "var(--color-ash)" }}>
          {isLoading ? "..." : `${orders.length} pedido(s) aguardando`}
        </span>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1.5rem" }}>
        {isLoading ? (
          <p
            style={{
              color: "var(--color-ash)",
              textAlign: "center",
              paddingTop: "3rem",
            }}
          >
            Carregando...
          </p>
        ) : orders.length === 0 ? (
          <div
            className="card"
            style={{ padding: "3rem", textAlign: "center" }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛵</p>
            <p
              style={{
                color: "var(--color-chalk)",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              Nenhuma entrega no momento
            </p>
            <p style={{ color: "var(--color-ash)", fontSize: "0.875rem" }}>
              Pedidos prontos para entrega aparecerão aqui.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            {orders.map((order) => (
              <DeliveryCard
                key={order.id}
                order={order}
                onConfirm={(orderId, code) =>
                  confirmMutation.mutate({ orderId, code })
                }
                confirming={
                  confirmMutation.isPending &&
                  confirmMutation.variables?.orderId === order.id
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
