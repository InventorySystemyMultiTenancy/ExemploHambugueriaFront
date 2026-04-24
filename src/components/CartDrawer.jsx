import { useNavigate } from "react-router-dom";
import { useCart, fmt } from "../context/CartContext.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    clearCart,
  } = useCart();

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.7)",
          transition: "opacity 0.3s",
          opacity: isCartOpen ? 1 : 0,
          pointerEvents: isCartOpen ? "auto" : "none",
        }}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          zIndex: 50,
          height: "100%",
          width: "100%",
          maxWidth: "420px",
          background: "var(--color-forge)",
          borderLeft: "1px solid var(--color-smoke)",
          display: "flex",
          flexDirection: "column",
          transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-smoke)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            className="font-display"
            style={{
              fontSize: "1.5rem",
              color: "var(--color-amber)",
              margin: 0,
            }}
          >
            SEU PEDIDO
          </h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="btn-ghost"
                style={{ padding: "0.4rem 0.625rem", fontSize: "0.72rem" }}
              >
                Limpar
              </button>
            )}
            <button
              onClick={closeCart}
              className="btn-ghost"
              style={{ padding: "0.4rem 0.75rem", fontSize: "0.875rem" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {!items.length ? (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <p style={{ fontSize: "3rem" }}>🍔</p>
              <p style={{ color: "var(--color-ash)", fontSize: "0.875rem" }}>
                Seu carrinho está vazio.
                <br />
                Monte seu burger!
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {items.map((item) => (
                <article
                  key={item.key}
                  style={{
                    background: "var(--color-iron)",
                    border: "1px solid var(--color-smoke)",
                    borderRadius: "1rem",
                    padding: "0.875rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Thumbnail */}
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: "52px",
                          height: "52px",
                          objectFit: "cover",
                          borderRadius: "0.5rem",
                          flexShrink: 0,
                        }}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : (
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "0.5rem",
                          flexShrink: 0,
                          background: "var(--color-steel)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                        }}
                      >
                        🍔
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: "0 0 2px",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          color: "var(--color-chalk)",
                        }}
                      >
                        {item.name}
                      </p>

                      {/* Meat doneness */}
                      {item.meatDoneness && (
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontSize: "0.7rem",
                            color: "var(--color-amber)",
                          }}
                        >
                          🥩 {item.meatDoneness.replace("_", " ")}
                        </p>
                      )}

                      {/* Addons */}
                      {item.addons?.length > 0 && (
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontSize: "0.7rem",
                            color: "var(--color-ash)",
                          }}
                        >
                          + {item.addons.map((a) => a.name).join(", ")}
                        </p>
                      )}

                      {/* Removed */}
                      {item.removedIngredients?.length > 0 && (
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontSize: "0.7rem",
                            color: "var(--color-danger)",
                          }}
                        >
                          sem {item.removedIngredients.join(", ")}
                        </p>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontSize: "0.7rem",
                            color: "var(--color-ash)",
                            fontStyle: "italic",
                          }}
                        >
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.key)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-ash)",
                        fontSize: "1rem",
                        padding: "0",
                        lineHeight: 1,
                      }}
                      title="Remover"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Qty + price */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "0.625rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() =>
                          updateQuantity(item.key, item.quantity - 1)
                        }
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "var(--color-steel)",
                          border: "1px solid var(--color-smoke)",
                          color: "var(--color-chalk)",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          minWidth: "20px",
                          textAlign: "center",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.key, item.quantity + 1)
                        }
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "var(--color-steel)",
                          border: "1px solid var(--color-smoke)",
                          color: "var(--color-chalk)",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        +
                      </button>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 800,
                        color: "var(--color-amber)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {fmt(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--color-smoke)",
              background: "var(--color-forge)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.875rem",
              }}
            >
              <span style={{ color: "var(--color-ash)", fontSize: "0.875rem" }}>
                Subtotal
              </span>
              <span
                style={{
                  fontWeight: 800,
                  color: "var(--color-chalk)",
                  fontSize: "1rem",
                }}
              >
                {fmt(subtotal)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="btn-amber"
              style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
            >
              Finalizar Pedido →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
