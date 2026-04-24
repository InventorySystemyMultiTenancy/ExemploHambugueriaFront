// OrderTracker.jsx
// Inspirado no rastreamento iFood — timeline vertical com animação

const STATUS_STEPS = [
  {
    key: "RECEBIDO",
    label: "Pedido Recebido",
    icon: "📋",
    desc: "Seu pedido entrou na fila",
  },
  {
    key: "EM_PREPARO",
    label: "Em Preparo",
    icon: "👨‍🍳",
    desc: "A cozinha está no fogo!",
  },
  {
    key: "PRONTO",
    label: "Pronto",
    icon: "✅",
    desc: "Seu pedido está pronto",
  },
  {
    key: "SAIU_PARA_ENTREGA",
    label: "Saiu para Entrega",
    icon: "🛵",
    desc: "A caminho de você",
  },
  { key: "ENTREGUE", label: "Entregue", icon: "🎉", desc: "Bom apetite!" },
];

const STATUS_PICKUP = [
  {
    key: "RECEBIDO",
    label: "Pedido Recebido",
    icon: "📋",
    desc: "Seu pedido entrou na fila",
  },
  { key: "EM_PREPARO", label: "Em Preparo", icon: "👨‍🍳", desc: "Quase pronto!" },
  {
    key: "PRONTO",
    label: "Pronto para Retirada",
    icon: "✅",
    desc: "Pode vir buscar!",
  },
  { key: "ENTREGUE", label: "Retirado", icon: "🎉", desc: "Bom apetite!" },
];

function OrderTracker({
  status = "RECEBIDO",
  isPickup = false,
  estimatedMinutes = null,
}) {
  const steps = isPickup ? STATUS_PICKUP : STATUS_STEPS;
  const activeIndex = steps.findIndex((s) => s.key === status);
  const isCancelled = status === "CANCELADO";
  const isDone = status === "ENTREGUE";

  return (
    <div
      style={{
        background: "var(--color-iron)",
        border: "1px solid var(--color-smoke)",
        borderRadius: "1rem",
        padding: "1.5rem",
      }}
    >
      {/* Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          className="font-display"
          style={{ margin: 0, fontSize: "1.4rem", color: "var(--color-amber)" }}
        >
          ACOMPANHE SEU PEDIDO
        </h3>
        {estimatedMinutes && !isDone && !isCancelled && (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#000",
              background: "var(--color-amber)",
              borderRadius: "2rem",
              padding: "0.25rem 0.625rem",
            }}
          >
            ≈ {estimatedMinutes} min
          </span>
        )}
      </div>

      {/* Cancelled state */}
      {isCancelled ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem",
            borderRadius: "0.75rem",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>❌</span>
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                color: "var(--color-danger)",
              }}
            >
              Pedido Cancelado
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "0.78rem",
                color: "var(--color-ash)",
              }}
            >
              Entre em contato caso tenha dúvidas.
            </p>
          </div>
        </div>
      ) : (
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {steps.map((step, idx) => {
            const done = idx < activeIndex;
            const active = idx === activeIndex;
            const future = idx > activeIndex;

            return (
              <li
                key={step.key}
                style={{ display: "flex", gap: "1rem", position: "relative" }}
              >
                {/* Line */}
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "32px",
                      width: "2px",
                      height: "calc(100% - 4px)",
                      background: done
                        ? "var(--color-amber)"
                        : "var(--color-smoke)",
                      transition: "background 0.5s",
                    }}
                  />
                )}

                {/* Dot */}
                <div style={{ flexShrink: 0, paddingTop: "2px" }}>
                  <div
                    className={active ? "status-pulse" : ""}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      background: done
                        ? "var(--color-amber)"
                        : active
                          ? "var(--color-amber)"
                          : "var(--color-steel)",
                      border: `2px solid ${active ? "var(--color-amber)" : done ? "var(--color-amber-dark)" : "var(--color-smoke)"}`,
                      opacity: future ? 0.4 : 1,
                      transition: "all 0.4s",
                    }}
                  >
                    {done ? "✓" : step.icon}
                  </div>
                </div>

                {/* Text */}
                <div style={{ flex: 1, paddingBottom: "1.25rem" }}>
                  <p
                    style={{
                      margin: "5px 0 2px",
                      fontWeight: active ? 700 : done ? 600 : 400,
                      fontSize: "0.9rem",
                      color: active
                        ? "var(--color-amber)"
                        : done
                          ? "var(--color-chalk)"
                          : "var(--color-ash)",
                      transition: "color 0.3s",
                    }}
                  >
                    {step.label}
                    {active && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          color: "#000",
                          background: "var(--color-amber)",
                          padding: "1px 6px",
                          borderRadius: "10px",
                        }}
                      >
                        AGORA
                      </span>
                    )}
                  </p>
                  {(active || done) && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "var(--color-ash)",
                      }}
                    >
                      {step.desc}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Done celebration */}
      {isDone && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.875rem",
            borderRadius: "0.75rem",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.3)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              color: "var(--color-ok)",
              fontSize: "1rem",
            }}
          >
            🎉 Pedido entregue! Bom apetite!
          </p>
        </div>
      )}
    </div>
  );
}

export default OrderTracker;
