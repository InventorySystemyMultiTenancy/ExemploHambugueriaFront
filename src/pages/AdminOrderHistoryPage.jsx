import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";

const STATUS_LABEL = {
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em Preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu p/ Entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};
const STATUS_COLOR = {
  RECEBIDO: "#3B82F6",
  EM_PREPARO: "#F59E0B",
  PRONTO: "#22C55E",
  SAIU_PARA_ENTREGA: "#A78BFA",
  ENTREGUE: "#6B7280",
  CANCELADO: "#EF4444",
};
const PAYMENT_COLOR = {
  APROVADO: "#22C55E",
  PENDENTE: "#F59E0B",
  RECUSADO: "#EF4444",
  ESTORNADO: "#9CA3AF",
};
const fmt = (v) =>
  Number(v ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "580px",
          padding: "1.5rem",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{ margin: 0, fontWeight: 800, color: "var(--color-chalk)" }}
          >
            Pedido #{order.id.slice(-6).toUpperCase()}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: "0.375rem 0.75rem" }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: STATUS_COLOR[order.status],
              border: `1px solid ${STATUS_COLOR[order.status]}50`,
              borderRadius: "4px",
              padding: "2px 8px",
            }}
          >
            {STATUS_LABEL[order.status]}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: PAYMENT_COLOR[order.paymentStatus] ?? "#9CA3AF",
              border: `1px solid ${PAYMENT_COLOR[order.paymentStatus] ?? "#9CA3AF"}50`,
              borderRadius: "4px",
              padding: "2px 8px",
            }}
          >
            Pagamento: {order.paymentStatus}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--color-ash)" }}>
            {order.isPickup ? "🏪 Retirada" : "🛵 Entrega"}
          </span>
        </div>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: "0.78rem",
            color: "var(--color-ash)",
          }}
        >
          Cliente: {order.user?.name ?? "—"} — {order.user?.phone ?? ""}
        </p>
        {order.deliveryAddress && (
          <p
            style={{
              margin: "0 0 1rem",
              fontSize: "0.78rem",
              color: "var(--color-ash)",
            }}
          >
            Endereço: {order.deliveryAddress}
          </p>
        )}
        {order.notes && (
          <p
            style={{
              margin: "0 0 1rem",
              fontSize: "0.78rem",
              fontStyle: "italic",
              color: "var(--color-ash)",
            }}
          >
            Obs: {order.notes}
          </p>
        )}

        <div
          style={{
            borderTop: "1px solid var(--color-smoke)",
            paddingTop: "0.875rem",
          }}
        >
          {(order.items ?? []).map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.375rem 0",
                fontSize: "0.8rem",
                borderBottom: "1px solid var(--color-steel)",
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: "var(--color-chalk)" }}>
                  {item.quantity}× {item.product?.name ?? item.combo?.name}
                </span>
                {item.meatDoneness && (
                  <span
                    style={{
                      marginLeft: "6px",
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
                      marginLeft: "6px",
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
                      marginLeft: "6px",
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
                      marginLeft: "6px",
                      fontStyle: "italic",
                      color: "var(--color-ash)",
                      fontSize: "0.7rem",
                    }}
                  >
                    "{item.notes}"
                  </span>
                )}
              </div>
              <span style={{ color: "var(--color-amber)", fontWeight: 700 }}>
                {fmt(item.totalPrice)}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 800,
            marginTop: "0.875rem",
            fontSize: "1rem",
          }}
        >
          <span style={{ color: "var(--color-chalk)" }}>Total</span>
          <span style={{ color: "var(--color-amber)" }}>
            {fmt(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderHistoryPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchId, setSearchId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const LIMIT = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order-history", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (statusFilter !== "todos") params.set("status", statusFilter);
      const res = await api.get(`/admin/orders/history?${params}`);
      return res.data?.data ?? { orders: [], total: 0 };
    },
    staleTime: 60_000,
  });

  const orders = data?.orders ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / LIMIT));

  const filtered = searchId
    ? orders.filter((o) => o.id.toLowerCase().includes(searchId.toLowerCase()))
    : orders;

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
            flex: 1,
          }}
        >
          📋 HISTÓRICO DE PEDIDOS
        </h1>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem" }}>
        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <input
            className="input-dark"
            placeholder="Buscar por ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ width: "200px" }}
          />
          {[
            "todos",
            "RECEBIDO",
            "EM_PREPARO",
            "PRONTO",
            "SAIU_PARA_ENTREGA",
            "ENTREGUE",
            "CANCELADO",
          ].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={statusFilter === s ? "btn-amber" : "btn-ghost"}
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
            >
              {s === "todos" ? "Todos" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p style={{ color: "var(--color-ash)" }}>Carregando...</p>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {filtered.length === 0 ? (
                <p
                  style={{
                    color: "var(--color-ash)",
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  Nenhum pedido encontrado.
                </p>
              ) : (
                filtered.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="card"
                    style={{
                      padding: "0.875rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "var(--color-amber)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "var(--color-smoke)")
                    }
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: "0 0 2px",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          color: "var(--color-chalk)",
                        }}
                      >
                        #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.72rem",
                          color: "var(--color-ash)",
                        }}
                      >
                        {order.user?.name ?? "—"} —{" "}
                        {new Date(order.createdAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: STATUS_COLOR[order.status],
                        border: `1px solid ${STATUS_COLOR[order.status]}50`,
                        borderRadius: "4px",
                        padding: "2px 8px",
                      }}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 800,
                        color: "var(--color-amber)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmt(order.total)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.375rem",
                  marginTop: "1.25rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost"
                  style={{ padding: "0.375rem 0.75rem" }}
                >
                  ←
                </button>
                <span
                  style={{
                    color: "var(--color-ash)",
                    fontSize: "0.875rem",
                    padding: "0.375rem 0.625rem",
                  }}
                >
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost"
                  style={{ padding: "0.375rem 0.75rem" }}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
