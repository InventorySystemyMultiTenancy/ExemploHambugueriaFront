import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../lib/api.js";

const STATUS_LABEL = {
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em Preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu p/ Entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};
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
const fmt = (v) =>
  Number(v ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <p
        style={{
          margin: "0 0 4px",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--color-ash)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </p>
      <p
        className="font-display"
        style={{
          margin: "0 0 2px",
          fontSize: "2rem",
          color: color ?? "var(--color-amber)",
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{ margin: 0, fontSize: "0.72rem", color: "var(--color-ash)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminPanelPage() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data?.data ?? [];
    },
    refetchInterval: 12_000,
  });

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics");
      return res.data?.data;
    },
    staleTime: 60_000,
  });

  const advanceMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Status atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId) => {
      await api.patch(`/orders/${orderId}/status`, { status: "CANCELADO" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Pedido cancelado.");
    },
  });

  const activeOrders = orders.filter(
    (o) => !["ENTREGUE", "CANCELADO"].includes(o.status),
  );
  const todayRevenue = analytics?.todayRevenue ?? 0;
  const monthRevenue = analytics?.monthRevenue ?? 0;

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
          justifyContent: "space-between",
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
          ⚙️ PAINEL ADMIN
        </h1>
        <nav style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            to="/admin/produtos"
            className="btn-ghost"
            style={{
              padding: "0.4rem 0.875rem",
              fontSize: "0.8rem",
              textDecoration: "none",
            }}
          >
            Produtos
          </Link>
          <Link
            to="/admin/historico"
            className="btn-ghost"
            style={{
              padding: "0.4rem 0.875rem",
              fontSize: "0.8rem",
              textDecoration: "none",
            }}
          >
            Histórico
          </Link>
          <Link
            to="/cozinha"
            className="btn-ghost"
            style={{
              padding: "0.4rem 0.875rem",
              fontSize: "0.8rem",
              textDecoration: "none",
            }}
          >
            Cozinha
          </Link>
        </nav>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "1.75rem",
          }}
        >
          <StatCard label="Hoje" value={fmt(todayRevenue)} />
          <StatCard
            label="Este Mês"
            value={fmt(monthRevenue)}
            color="var(--color-ok)"
          />
          <StatCard
            label="Pedidos Ativos"
            value={activeOrders.length}
            sub="em andamento"
            color="var(--color-chalk)"
          />
          <StatCard
            label="Total de Pedidos"
            value={orders.length}
            color="var(--color-ash)"
          />
        </div>

        {/* Active orders */}
        <h2
          style={{
            margin: "0 0 1rem",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--color-chalk)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          ● Pedidos Ativos
        </h2>

        {isLoading ? (
          <p style={{ color: "var(--color-ash)" }}>Carregando...</p>
        ) : activeOrders.length === 0 ? (
          <div
            className="card"
            style={{ padding: "2rem", textAlign: "center" }}
          >
            <p style={{ color: "var(--color-ash)", margin: 0 }}>
              Nenhum pedido ativo no momento.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {activeOrders.map((order) => {
              const next = STATUS_NEXT[order.status];
              return (
                <div
                  key={order.id}
                  className="card"
                  style={{
                    padding: "1rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                  }}
                >
                  {/* ID + status */}
                  <div style={{ minWidth: "120px" }}>
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontWeight: 800,
                        fontSize: "0.875rem",
                        color: "var(--color-chalk)",
                      }}
                    >
                      #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        borderRadius: "0.25rem",
                        padding: "2px 6px",
                        color: STATUS_COLOR[order.status],
                        border: `1px solid ${STATUS_COLOR[order.status]}50`,
                        background: STATUS_COLOR[order.status] + "20",
                      }}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.7rem",
                        color: "var(--color-ash)",
                      }}
                    >
                      {order.isPickup ? "🏪 Retirada" : "🛵 Entrega"}
                    </p>
                  </div>

                  {/* Items summary */}
                  <div
                    style={{
                      flex: 1,
                      fontSize: "0.78rem",
                      color: "var(--color-ash)",
                    }}
                  >
                    {(order.items ?? []).map((item) => (
                      <p key={item.id} style={{ margin: "0 0 2px" }}>
                        {item.quantity}×{" "}
                        {item.product?.name ?? item.combo?.name}
                        {item.meatDoneness && (
                          <span style={{ color: "var(--color-amber)" }}>
                            {" "}
                            [{item.meatDoneness.replace("_", " ")}]
                          </span>
                        )}
                      </p>
                    ))}
                    {order.notes && (
                      <p style={{ margin: "4px 0 0", fontStyle: "italic" }}>
                        "{order.notes}"
                      </p>
                    )}
                  </div>

                  {/* Total */}
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

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.375rem",
                      minWidth: "130px",
                    }}
                  >
                    {next && (
                      <button
                        type="button"
                        onClick={() =>
                          advanceMutation.mutate({
                            orderId: order.id,
                            status: next,
                          })
                        }
                        className="btn-amber"
                        disabled={advanceMutation.isPending}
                        style={{
                          padding: "0.4rem 0.75rem",
                          fontSize: "0.75rem",
                        }}
                      >
                        → {STATUS_LABEL[next]}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Cancelar este pedido?"))
                          cancelMutation.mutate(order.id);
                      }}
                      className="btn-ghost"
                      style={{
                        padding: "0.4rem 0.75rem",
                        fontSize: "0.75rem",
                        color: "var(--color-danger)",
                      }}
                      disabled={cancelMutation.isPending}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
