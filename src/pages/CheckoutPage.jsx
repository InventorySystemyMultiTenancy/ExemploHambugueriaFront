import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { useCart, fmt } from "../context/CartContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

const CEP_RE = /^\d{5}-?\d{3}$/;
const POLL_MS = 4000;

function formatCep(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [deliveryType, setDeliveryType] = useState("entrega"); // "entrega" | "retirada"
  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [complemento, setComplemento] = useState("");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const [freight, setFreight] = useState(null);
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightError, setFreightError] = useState("");

  const [paymentMode, setPaymentMode] = useState("online"); // "online" | "cash" | "card_machine"
  const [waitingOrderId, setWaitingOrderId] = useState(null);
  const [pollStatus, setPollStatus] = useState("PENDENTE");
  const pollRef = useRef(null);

  // ─── Redirect if no items ───────────────────────────────────────────────────
  useEffect(() => {
    if (!items.length) navigate("/cardapio");
  }, [items, navigate]);

  // ─── Payment polling ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!waitingOrderId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${waitingOrderId}`);
        const order = res.data?.data;
        const status = order?.paymentStatus;
        setPollStatus(status);
        if (status === "APROVADO") {
          clearInterval(pollRef.current);
          clearCart();
          toast.success("Pagamento aprovado! 🍔");
          navigate("/dashboard");
        } else if (status === "RECUSADO") {
          clearInterval(pollRef.current);
          toast.error("Pagamento recusado. Tente novamente.");
          setWaitingOrderId(null);
        }
      } catch {
        /* ignore */
      }
    }, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [waitingOrderId, clearCart, navigate]);

  // ─── Fetch freight ──────────────────────────────────────────────────────────
  const fetchFreight = useCallback(async () => {
    if (!CEP_RE.test(cep) || !numero) return;
    setFreightLoading(true);
    setFreightError("");
    try {
      const res = await api.post("/delivery/calculate", {
        cep,
        numero,
        cidade: cidade || "São Paulo",
      });
      setFreight(res.data?.data);
    } catch {
      setFreightError("Não foi possível calcular o frete para este CEP.");
      setFreight(null);
    } finally {
      setFreightLoading(false);
    }
  }, [cep, numero, cidade]);

  // Auto-fetch freight when CEP + numero are complete
  useEffect(() => {
    if (deliveryType === "entrega" && CEP_RE.test(cep) && numero) {
      fetchFreight();
    }
  }, [cep, numero, deliveryType, fetchFreight]);

  // ─── Coupon validation ──────────────────────────────────────────────────────
  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    try {
      const res = await api.get(
        `/coupons/validate/${couponCode.trim().toUpperCase()}`,
      );
      const c = res.data?.data;
      if (c.minOrderValue && subtotal < c.minOrderValue) {
        setCouponError(
          `Pedido mínimo de ${fmt(c.minOrderValue)} para este cupom.`,
        );
        setCoupon(null);
        return;
      }
      setCoupon(c);
      toast.success(`Cupom "${c.code}" aplicado!`, {
        style: { background: "#222", color: "#F5A623" },
      });
    } catch {
      setCouponError("Cupom inválido ou expirado.");
      setCoupon(null);
    }
  };

  // ─── Discount calculation ───────────────────────────────────────────────────
  const discount = coupon
    ? coupon.type === "PERCENTUAL"
      ? subtotal * (coupon.value / 100)
      : Math.min(coupon.value, subtotal)
    : 0;

  const deliveryFee =
    deliveryType === "retirada" ? 0 : (freight?.valorFrete ?? 0);
  const total = subtotal - discount + deliveryFee;

  // ─── Map cart items to API format ───────────────────────────────────────────
  const buildOrderItems = () =>
    items.map((item) => ({
      productId: item.productId,
      comboId: item.comboId,
      quantity: item.quantity,
      notes: item.notes || undefined,
      meatDoneness: item.meatDoneness || undefined,
      removedIngredients: item.removedIngredients?.length
        ? item.removedIngredients
        : undefined,
      addons: item.addons?.length
        ? item.addons.map((a) => ({
            addonId: a.addonId,
            quantity: a.quantity ?? 1,
          }))
        : undefined,
    }));

  // ─── Create order mutation ──────────────────────────────────────────────────
  const createOrder = useMutation({
    mutationFn: async () => {
      const payload = {
        isPickup: deliveryType === "retirada",
        notes: notes || undefined,
        couponCode: coupon?.code || undefined,
        items: buildOrderItems(),
        paymentMethod: paymentMode,
      };

      if (deliveryType === "entrega") {
        payload.deliveryAddress =
          `${rua || ""} ${numero}, ${bairro || ""}, ${cidade || ""} - CEP ${cep}`.trim();
        payload.deliveryFee = deliveryFee;
        if (freight?.lat) payload.deliveryLat = freight.lat;
        if (freight?.lon) payload.deliveryLon = freight.lon;
      }

      const res = await api.post("/orders", payload);
      return res.data?.data;
    },
    onSuccess: async (order) => {
      if (paymentMode === "online") {
        // Open Mercado Pago preference
        try {
          const prefRes = await api.post("/payments/preference", {
            orderId: order.id,
          });
          const url = prefRes.data?.data?.init_point;
          if (url) {
            clearCart();
            window.location.href = url;
            return;
          }
        } catch {
          toast.error("Erro ao iniciar pagamento. Redirecionando...");
        }
      }
      // For cash/card_machine, just navigate to dashboard
      clearCart();
      toast.success("Pedido realizado! Acompanhe abaixo 🍔");
      navigate("/dashboard");
    },
    onError: (err) => {
      const msg = err.response?.data?.error?.message || "Erro ao criar pedido.";
      toast.error(msg, { style: { background: "#222", color: "#fff" } });
    },
  });

  if (waitingOrderId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-pitch)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "3rem" }}>⏳</div>
        <p
          className="font-display"
          style={{ fontSize: "1.75rem", color: "var(--color-amber)" }}
        >
          AGUARDANDO PAGAMENTO
        </p>
        <p style={{ color: "var(--color-ash)" }}>Status: {pollStatus}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-pitch)" }}>
      <Navbar />

      <div
        style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}
      >
        <h1
          className="font-display"
          style={{
            fontSize: "2.5rem",
            color: "var(--color-amber)",
            marginBottom: "2rem",
          }}
        >
          FINALIZAR PEDIDO
        </h1>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}
        >
          {/* Left column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Delivery type */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3
                style={{
                  margin: "0 0 1rem",
                  fontWeight: 700,
                  color: "var(--color-chalk)",
                }}
              >
                Como quer receber?
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.625rem",
                }}
              >
                {[
                  {
                    key: "entrega",
                    label: "🛵 Entrega",
                    desc: "Receba em casa",
                  },
                  {
                    key: "retirada",
                    label: "🏪 Retirada",
                    desc: "Retire no balcão",
                  },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setDeliveryType(opt.key)}
                    style={{
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor:
                        deliveryType === opt.key
                          ? "var(--color-amber)"
                          : "var(--color-smoke)",
                      background:
                        deliveryType === opt.key
                          ? "rgba(245,166,35,0.08)"
                          : "var(--color-steel)",
                      textAlign: "center",
                      transition: "all 0.2s",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 3px",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color:
                          deliveryType === opt.key
                            ? "var(--color-amber)"
                            : "var(--color-chalk)",
                      }}
                    >
                      {opt.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.72rem",
                        color: "var(--color-ash)",
                      }}
                    >
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Address (only for delivery) */}
            {deliveryType === "entrega" && (
              <div className="card" style={{ padding: "1.25rem" }}>
                <h3
                  style={{
                    margin: "0 0 1rem",
                    fontWeight: 700,
                    color: "var(--color-chalk)",
                  }}
                >
                  Endereço de entrega
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "0.625rem",
                    }}
                  >
                    <input
                      className="input-dark"
                      placeholder="CEP (00000-000)"
                      value={cep}
                      onChange={(e) => setCep(formatCep(e.target.value))}
                    />
                    <button
                      type="button"
                      onClick={fetchFreight}
                      className="btn-ghost"
                      style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}
                      disabled={freightLoading}
                    >
                      {freightLoading ? "..." : "Calcular"}
                    </button>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr",
                      gap: "0.625rem",
                    }}
                  >
                    <input
                      className="input-dark"
                      placeholder="Rua / Av."
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                    />
                    <input
                      className="input-dark"
                      placeholder="Número"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.625rem",
                    }}
                  >
                    <input
                      className="input-dark"
                      placeholder="Bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                    />
                    <input
                      className="input-dark"
                      placeholder="Cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                    />
                  </div>
                  <input
                    className="input-dark"
                    placeholder="Complemento (opcional)"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                  />

                  {freightError && (
                    <p
                      style={{
                        color: "var(--color-danger)",
                        fontSize: "0.8rem",
                        margin: 0,
                      }}
                    >
                      {freightError}
                    </p>
                  )}
                  {freight && (
                    <div
                      style={{
                        background: "rgba(245,166,35,0.08)",
                        border: "1px solid rgba(245,166,35,0.3)",
                        borderRadius: "0.625rem",
                        padding: "0.75rem",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 2px",
                          fontSize: "0.8rem",
                          color: "var(--color-chalk)",
                        }}
                      >
                        Distância: {freight.distanciaKm} km — Tempo estimado:{" "}
                        {freight.tempoEstimado}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          color: "var(--color-amber)",
                        }}
                      >
                        Frete: {freight.valorFreteFormatado}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Coupon */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3
                style={{
                  margin: "0 0 1rem",
                  fontWeight: 700,
                  color: "var(--color-chalk)",
                }}
              >
                Cupom de desconto
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "0.625rem",
                }}
              >
                <input
                  className="input-dark"
                  placeholder="Código do cupom"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCoupon(null);
                    setCouponError("");
                  }}
                  disabled={!!coupon}
                />
                <button
                  type="button"
                  onClick={validateCoupon}
                  className={coupon ? "btn-ghost" : "btn-amber"}
                  style={{ padding: "0.75rem 1rem" }}
                  disabled={!!coupon}
                >
                  {coupon ? "✓" : "Aplicar"}
                </button>
              </div>
              {couponError && (
                <p
                  style={{
                    color: "var(--color-danger)",
                    fontSize: "0.8rem",
                    margin: "0.5rem 0 0",
                  }}
                >
                  {couponError}
                </p>
              )}
              {coupon && (
                <p
                  style={{
                    color: "var(--color-ok)",
                    fontSize: "0.8rem",
                    margin: "0.5rem 0 0",
                  }}
                >
                  ✓ Desconto de{" "}
                  {coupon.type === "PERCENTUAL"
                    ? `${coupon.value}%`
                    : fmt(coupon.value)}{" "}
                  aplicado
                </p>
              )}
            </div>

            {/* Payment method */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3
                style={{
                  margin: "0 0 1rem",
                  fontWeight: 700,
                  color: "var(--color-chalk)",
                }}
              >
                Forma de pagamento
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {[
                  {
                    key: "online",
                    label: "💳 Online (Mercado Pago)",
                    desc: "Pix, cartão, débito",
                  },
                  { key: "cash", label: "💵 Dinheiro na entrega", desc: "" },
                  {
                    key: "card_machine",
                    label: "📲 Maquininha na entrega",
                    desc: "",
                  },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.875rem 1rem",
                      borderRadius: "0.75rem",
                      cursor: "pointer",
                      border: `2px solid ${paymentMode === opt.key ? "var(--color-amber)" : "var(--color-smoke)"}`,
                      background:
                        paymentMode === opt.key
                          ? "rgba(245,166,35,0.08)"
                          : "var(--color-steel)",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.key}
                      checked={paymentMode === opt.key}
                      onChange={() => setPaymentMode(opt.key)}
                      style={{ accentColor: "var(--color-amber)" }}
                    />
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color:
                            paymentMode === opt.key
                              ? "var(--color-amber)"
                              : "var(--color-chalk)",
                        }}
                      >
                        {opt.label}
                      </p>
                      {opt.desc && (
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: "0.72rem",
                            color: "var(--color-ash)",
                          }}
                        >
                          {opt.desc}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3
                style={{
                  margin: "0 0 0.75rem",
                  fontWeight: 700,
                  color: "var(--color-chalk)",
                }}
              >
                Observações gerais
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações para o pedido (ex: interfone 123)..."
                maxLength={1000}
                style={{
                  width: "100%",
                  background: "var(--color-steel)",
                  border: "1px solid var(--color-smoke)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                  color: "var(--color-chalk)",
                  fontSize: "0.875rem",
                  resize: "none",
                  height: "80px",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                  boxSizing: "border-box",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-amber)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-smoke)")
                }
              />
            </div>
          </div>

          {/* Order summary (sticky on desktop) */}
          <div>
            <div
              className="card"
              style={{ padding: "1.25rem", position: "sticky", top: "80px" }}
            >
              <h3
                style={{
                  margin: "0 0 1rem",
                  fontWeight: 700,
                  color: "var(--color-chalk)",
                }}
              >
                Resumo do Pedido
              </h3>

              {/* Items */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {items.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span style={{ color: "var(--color-ash)" }}>
                      {item.quantity}× {item.name}
                      {item.meatDoneness && (
                        <span
                          style={{
                            color: "var(--color-amber)",
                            marginLeft: "4px",
                          }}
                        >
                          ({item.meatDoneness.replace("_", " ")})
                        </span>
                      )}
                    </span>
                    <span
                      style={{ color: "var(--color-chalk)", fontWeight: 600 }}
                    >
                      {fmt(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--color-smoke)",
                  paddingTop: "0.875rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "var(--color-ash)" }}>Subtotal</span>
                  <span style={{ color: "var(--color-chalk)" }}>
                    {fmt(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "var(--color-ok)" }}>Desconto</span>
                    <span style={{ color: "var(--color-ok)" }}>
                      − {fmt(discount)}
                    </span>
                  </div>
                )}
                {deliveryType === "entrega" && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "var(--color-ash)" }}>Frete</span>
                    <span
                      style={{
                        color:
                          deliveryFee === 0
                            ? "var(--color-ok)"
                            : "var(--color-chalk)",
                      }}
                    >
                      {deliveryFee === 0 && !freight
                        ? "a calcular"
                        : fmt(deliveryFee)}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    marginTop: "0.5rem",
                    borderTop: "1px solid var(--color-smoke)",
                    paddingTop: "0.75rem",
                  }}
                >
                  <span style={{ color: "var(--color-chalk)" }}>Total</span>
                  <span style={{ color: "var(--color-amber)" }}>
                    {fmt(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => createOrder.mutate()}
                className="btn-amber"
                disabled={
                  createOrder.isPending || (deliveryType === "entrega" && !cep)
                }
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1rem",
                  marginTop: "1rem",
                }}
              >
                {createOrder.isPending
                  ? "Processando..."
                  : `Confirmar Pedido • ${fmt(total)}`}
              </button>

              {deliveryType === "entrega" && !cep && (
                <p
                  style={{
                    color: "var(--color-ash)",
                    fontSize: "0.75rem",
                    textAlign: "center",
                    marginTop: "0.5rem",
                  }}
                >
                  Informe o CEP para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
