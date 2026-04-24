import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../lib/api.js";

const STATUSES = [
  "RECEBIDO",
  "EM_PREPARO",
  "PRONTO",
  "SAIU_PARA_ENTREGA",
  "ENTREGUE",
  "CANCELADO",
];
const STATUS_NEXT = {
  RECEBIDO: "EM_PREPARO",
  EM_PREPARO: "PRONTO",
  PRONTO: "SAIU_PARA_ENTREGA",
  SAIU_PARA_ENTREGA: "ENTREGUE",
};
const STATUS_COLOR = {
  RECEBIDO: "#3B82F6",
  EM_PREPARO: "#F59E0B",
  PRONTO: "#22C55E",
  SAIU_PARA_ENTREGA: "#A78BFA",
  ENTREGUE: "#6B7280",
  CANCELADO: "#EF4444",
};
const STATUS_LABEL = {
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em Preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu p/ Entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function KitchenCard({ order, onAdvance, advancing }) {
  const items = order.items ?? [];
  const next = STATUS_NEXT[order.status];

  return (
    <div
      style={{
        background: "var(--color-iron)",
        border: `2px solid ${STATUS_COLOR[order.status] ?? "var(--color-smoke)"}`,
        borderRadius: "1rem",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: "1rem",
            color: "var(--color-chalk)",
          }}
        >
          #{order.id.slice(-6).toUpperCase()}
        </p>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            borderRadius: "0.25rem",
            padding: "2px 8px",
            background: STATUS_COLOR[order.status] + "33",
            color: STATUS_COLOR[order.status],
            border: `1px solid ${STATUS_COLOR[order.status]}50`,
          }}
        >
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--color-ash)" }}>
        {order.isPickup ? "🏪 Retirada" : "🛵 Entrega"}
        {" — "}
        {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      {/* Items */}
      <ul
        style={{
          margin: "0.25rem 0 0",
          padding: "0 0 0 1rem",
          fontSize: "0.8rem",
          color: "var(--color-chalk)",
          lineHeight: 1.6,
        }}
      >
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.quantity}×</strong>{" "}
            {item.product?.name ?? item.combo?.name ?? "Item"}
            {item.meatDoneness && (
              <span
                style={{
                  marginLeft: "4px",
                  color: "var(--color-amber)",
                  fontSize: "0.7rem",
                }}
              >
                [{item.meatDoneness.replace("_", " ")}]
              </span>
            )}
            {item.removedIngredients?.length > 0 && (
              <span
                style={{
                  marginLeft: "4px",
                  color: "var(--color-danger)",
                  fontSize: "0.7rem",
                }}
              >
                sem {item.removedIngredients.join(", ")}
              </span>
            )}
            {item.addons?.length > 0 && (
              <span
                style={{
                  marginLeft: "4px",
                  color: "var(--color-ash)",
                  fontSize: "0.7rem",
                }}
              >
                + {item.addons.map((a) => a.addon?.name).join(", ")}
              </span>
            )}
            {item.notes && (
              <span
                style={{
                  marginLeft: "4px",
                  color: "var(--color-ash)",
                  fontStyle: "italic",
                  fontSize: "0.7rem",
                }}
              >
                "{item.notes}"
              </span>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p
          style={{
            margin: 0,
            fontSize: "0.72rem",
            color: "var(--color-ash)",
            fontStyle: "italic",
          }}
        >
          Obs: {order.notes}
        </p>
      )}

      {next && (
        <button
          type="button"
          onClick={() => onAdvance(order.id, next)}
          disabled={advancing}
          className="btn-amber"
          style={{
            marginTop: "0.5rem",
            padding: "0.625rem",
            fontSize: "0.8rem",
          }}
        >
          {advancing ? "..." : `→ ${STATUS_LABEL[next]}`}
        </button>
      )}
    </div>
  );
}

export default function KitchenPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("active");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["kitchen-orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data?.data ?? [];
    },
    refetchInterval: 8_000,
  });

  const advanceMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
      toast.success("Status atualizado!", {
        style: { background: "#222", color: "#F5A623" },
      });
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const SHOW_STATUSES =
    filterStatus === "active"
      ? ["RECEBIDO", "EM_PREPARO", "PRONTO"]
      : ["SAIU_PARA_ENTREGA", "ENTREGUE"];

  const filtered = orders.filter((o) => SHOW_STATUSES.includes(o.status));

  // Group by status
  const grouped = {};
  for (const s of SHOW_STATUSES) grouped[s] = [];
  for (const o of filtered) {
    if (grouped[o.status]) grouped[o.status].push(o);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-pitch)" }}>
      {/* Top bar */}
      <div
        style={{
          background: "var(--color-forge)",
          borderBottom: "1px solid var(--color-smoke)",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
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
          🍳 COZINHA
        </h1>
        <div style={{ display: "flex", gap: "0.375rem" }}>
          {[
            { key: "active", label: "Ativos" },
            { key: "done", label: "Saídos" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilterStatus(f.key)}
              className={filterStatus === f.key ? "btn-amber" : "btn-ghost"}
              style={{ padding: "0.4rem 0.875rem", fontSize: "0.8rem" }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--color-ash)",
          }}
        >
          Carregando pedidos...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${SHOW_STATUSES.length}, 1fr)`,
            gap: "1px",
            background: "var(--color-smoke)",
            height: "calc(100vh - 60px)",
            overflow: "hidden",
          }}
        >
          {SHOW_STATUSES.map((status) => (
            <div
              key={status}
              style={{
                background: "var(--color-pitch)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Column header */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "var(--color-forge)",
                  borderBottom: "1px solid var(--color-smoke)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: STATUS_COLOR[status],
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "var(--color-chalk)",
                  }}
                >
                  {STATUS_LABEL[status]}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.72rem",
                    color: "var(--color-ash)",
                  }}
                >
                  {grouped[status]?.length ?? 0}
                </span>
              </div>

              {/* Cards */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                }}
              >
                {(grouped[status] ?? []).length === 0 ? (
                  <p
                    style={{
                      color: "var(--color-ash)",
                      fontSize: "0.75rem",
                      textAlign: "center",
                      paddingTop: "2rem",
                    }}
                  >
                    Sem pedidos
                  </p>
                ) : (
                  (grouped[status] ?? []).map((order) => (
                    <KitchenCard
                      key={order.id}
                      order={order}
                      onAdvance={(id, next) =>
                        advanceMutation.mutate({ orderId: id, status: next })
                      }
                      advancing={
                        advanceMutation.isPending &&
                        advanceMutation.variables?.orderId === order.id
                      }
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
