import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import OrderTracker from "../components/OrderTracker.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";
import { fmt } from "../context/CartContext.jsx";

const STATUS_LABEL = {
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em Preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu para Entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const PAYMENT_LABEL = {
  PENDENTE: { label: "Pendente", color: "var(--color-warn)" },
  APROVADO: { label: "Aprovado", color: "var(--color-ok)" },
  RECUSADO: { label: "Recusado", color: "var(--color-danger)" },
  ESTORNADO: { label: "Estornado", color: "var(--color-ash)" },
};

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await api.get("/orders/me");
      return res.data?.data ?? [];
    },
    refetchInterval: 30_000,
  });

  const { data: activeOrder } = useQuery({
    queryKey: ["order-detail", selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) return null;
      const res = await api.get(`/orders/${selectedOrderId}`);
      return res.data?.data;
    },
    enabled: !!selectedOrderId,
    refetchInterval: 10_000,
  });

  // Auto-select the first active order
  useEffect(() => {
    if (!orders.length) return;
    const active = orders.find(
      (o) => !["ENTREGUE", "CANCELADO"].includes(o.status),
    );
    if (active && !selectedOrderId) setSelectedOrderId(active.id);
  }, [orders, selectedOrderId]);

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = (e) => {
      const { orderId } = e.detail ?? {};
      if (orderId && orderId === selectedOrderId) {
        // react-query will auto-refetch via refetchInterval
      }
    };
    window.addEventListener("hb:order_status_updated", handleUpdate);
    return () =>
      window.removeEventListener("hb:order_status_updated", handleUpdate);
  }, [selectedOrderId]);

  const activeOrders = orders.filter(
    (o) => !["ENTREGUE", "CANCELADO"].includes(o.status),
  );
  const pastOrders = orders.filter((o) =>
    ["ENTREGUE", "CANCELADO"].includes(o.status),
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-pitch)" }}>
      <Navbar />
      <CartDrawer />

      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1
              className="font-display"
              style={{
                fontSize: "2.5rem",
                color: "var(--color-amber)",
                margin: "0 0 4px",
              }}
            >
              MEUS PEDIDOS
            </h1>
            <p
              style={{
                color: "var(--color-ash)",
                margin: 0,
                fontSize: "0.875rem",
              }}
            >
              Olá, {user?.name?.split(" ")[0]}! Acompanhe seus pedidos aqui.
            </p>
          </div>
          <Link
            to="/cardapio"
            className="btn-amber"
            style={{
              padding: "0.75rem 1.25rem",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            + Novo Pedido
          </Link>
        </div>

        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--color-ash)",
            }}
          >
            Carregando...
          </div>
        ) : !orders.length ? (
          <div
            className="card"
            style={{ padding: "3rem", textAlign: "center" }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🍔</p>
            <p
              style={{
                color: "var(--color-chalk)",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              Nenhum pedido ainda
            </p>
            <p
              style={{
                color: "var(--color-ash)",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
              }}
            >
              Monte seu primeiro burger!
            </p>
            <Link
              to="/cardapio"
              className="btn-amber"
              style={{ padding: "0.875rem 2rem", textDecoration: "none" }}
            >
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: selectedOrderId ? "1fr 1fr" : "1fr",
              gap: "1.5rem",
            }}
          >
            {/* Order list */}
            <div>
              {/* Active orders */}
              {activeOrders.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h2
                    style={{
                      margin: "0 0 0.875rem",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "var(--color-amber)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    ● Em Andamento
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.625rem",
                    }}
                  >
                    {activeOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isSelected={selectedOrderId === order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past orders */}
              {pastOrders.length > 0 && (
                <div>
                  <h2
                    style={{
                      margin: "0 0 0.875rem",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "var(--color-ash)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Histórico
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.625rem",
                    }}
                  >
                    {pastOrders.slice(0, 10).map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isSelected={selectedOrderId === order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        isPast
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order detail + tracker */}
            {selectedOrderId && activeOrder && (
              <div>
                <OrderTracker
                  status={activeOrder.status}
                  isPickup={activeOrder.isPickup}
                />

                {/* Order items */}
                <div
                  className="card"
                  style={{ padding: "1.25rem", marginTop: "1rem" }}
                >
                  <h3
                    style={{
                      margin: "0 0 1rem",
                      fontWeight: 700,
                      color: "var(--color-chalk)",
                    }}
                  >
                    Itens do Pedido
                  </h3>
                  {activeOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--color-smoke)",
                        fontSize: "0.875rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontWeight: 600,
                            color: "var(--color-chalk)",
                          }}
                        >
                          {item.quantity}×{" "}
                          {item.product?.name ?? item.combo?.name ?? "Item"}
                        </p>
                        {item.meatDoneness && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.72rem",
                              color: "var(--color-amber)",
                            }}
                          >
                            🥩 {item.meatDoneness.replace("_", " ")}
                          </p>
                        )}
                        {item.addons?.length > 0 && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.72rem",
                              color: "var(--color-ash)",
                            }}
                          >
                            + {item.addons.map((a) => a.addon?.name).join(", ")}
                          </p>
                        )}
                        {item.removedIngredients?.length > 0 && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.72rem",
                              color: "var(--color-danger)",
                            }}
                          >
                            sem {item.removedIngredients.join(", ")}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "var(--color-amber)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmt(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "0.875rem",
                      fontWeight: 800,
                    }}
                  >
                    <span style={{ color: "var(--color-chalk)" }}>Total</span>
                    <span style={{ color: "var(--color-amber)" }}>
                      {fmt(activeOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, isSelected, onClick, isPast }) {
  const pay = PAYMENT_LABEL[order.paymentStatus] ?? PAYMENT_LABEL.PENDENTE;
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--color-iron)",
        border: `2px solid ${isSelected ? "var(--color-amber)" : "var(--color-smoke)"}`,
        borderRadius: "0.875rem",
        padding: "1rem",
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.1s",
        opacity: isPast ? 0.8 : 1,
      }}
      onMouseEnter={(e) =>
        !isSelected &&
        (e.currentTarget.style.borderColor = "var(--color-amber)")
      }
      onMouseLeave={(e) =>
        !isSelected &&
        (e.currentTarget.style.borderColor = "var(--color-smoke)")
      }
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
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "var(--color-chalk)",
            }}
          >
            Pedido #{order.id.slice(-6).toUpperCase()}
          </p>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "0.8rem",
              color: isPast ? "var(--color-ash)" : "var(--color-amber)",
              fontWeight: 600,
            }}
          >
            {STATUS_LABEL[order.status] ?? order.status}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "0.72rem",
              color: "var(--color-ash)",
            }}
          >
            {new Date(order.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: "0 0 4px",
              fontWeight: 800,
              color: "var(--color-amber)",
            }}
          >
            {fmt(order.total)}
          </p>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: pay.color,
              border: `1px solid ${pay.color}`,
              borderRadius: "0.25rem",
              padding: "1px 5px",
            }}
          >
            {pay.label}
          </span>
        </div>
      </div>
    </div>
  );
}
