import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext.jsx";

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MEAT_OPTIONS = [
  {
    value: "MAL_PASSADO",
    label: "Mal Passado",
    desc: "Centro rosado e suculento",
  },
  {
    value: "AO_PONTO",
    label: "Ao Ponto",
    desc: "Levemente rosado, nossa recomendação",
  },
  {
    value: "BEM_PASSADO",
    label: "Bem Passado",
    desc: "Completamente grelhado",
  },
];

const STEPS = [
  { id: "doneness", label: "Ponto da Carne", icon: "🥩" },
  { id: "extras", label: "Turbine seu Burger", icon: "✨" },
  { id: "remove", label: "Remover Ingredientes", icon: "🚫" },
];

// ─── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ currentStep, isBurger }) {
  const steps = isBurger ? STEPS : STEPS.slice(1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0",
        marginBottom: "1.5rem",
      }}
    >
      {steps.map((step, idx) => {
        const stepIdx = isBurger ? idx : idx + 1;
        const done = currentStep > stepIdx;
        const active = currentStep === stepIdx;
        return (
          <div
            key={step.id}
            style={{ display: "flex", alignItems: "center", flex: 1 }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  background: done
                    ? "var(--color-ok)"
                    : active
                      ? "var(--color-amber)"
                      : "var(--color-steel)",
                  color: done || active ? "#000" : "var(--color-ash)",
                  transition: "all 0.3s",
                  boxShadow: active
                    ? "0 0 0 4px rgba(245,166,35,0.25)"
                    : "none",
                }}
              >
                {done ? "✓" : step.icon}
              </div>
              <span
                style={{
                  fontSize: "0.65rem",
                  marginTop: "4px",
                  color: active
                    ? "var(--color-amber)"
                    : done
                      ? "var(--color-ok)"
                      : "var(--color-ash)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                style={{
                  height: "2px",
                  flex: 0.5,
                  background: done ? "var(--color-ok)" : "var(--color-smoke)",
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 0: Ponto da Carne ───────────────────────────────────────────────────
function StepDoneness({ value, onChange }) {
  return (
    <div>
      <p
        style={{
          color: "var(--color-ash)",
          fontSize: "0.875rem",
          marginBottom: "1rem",
        }}
      >
        Como você prefere o ponto do seu hambúrguer?
      </p>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}
      >
        {MEAT_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              padding: "0.875rem 1rem",
              borderRadius: "0.75rem",
              cursor: "pointer",
              border: `2px solid ${value === opt.value ? "var(--color-amber)" : "var(--color-smoke)"}`,
              background:
                value === opt.value
                  ? "rgba(245,166,35,0.08)"
                  : "var(--color-steel)",
              transition: "all 0.2s",
            }}
          >
            <input
              type="radio"
              name="doneness"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              style={{
                accentColor: "var(--color-amber)",
                width: "18px",
                height: "18px",
              }}
            />
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color:
                    value === opt.value
                      ? "var(--color-amber)"
                      : "var(--color-chalk)",
                }}
              >
                {opt.label}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.75rem",
                  color: "var(--color-ash)",
                }}
              >
                {opt.desc}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: Extras (Addons) ──────────────────────────────────────────────────
function StepExtras({ addons = [], selected, onChange }) {
  const toggle = useCallback(
    (addon) => {
      onChange((prev) => {
        const exists = prev.find((a) => a.addonId === addon.id);
        if (exists) return prev.filter((a) => a.addonId !== addon.id);
        return [
          ...prev,
          {
            addonId: addon.id,
            name: addon.name,
            price: Number(addon.price),
            quantity: 1,
          },
        ];
      });
    },
    [onChange],
  );

  if (!addons.length) {
    return (
      <p
        style={{
          color: "var(--color-ash)",
          textAlign: "center",
          padding: "2rem 0",
        }}
      >
        Nenhum adicional disponível para este produto.
      </p>
    );
  }

  return (
    <div>
      <p
        style={{
          color: "var(--color-ash)",
          fontSize: "0.875rem",
          marginBottom: "1rem",
        }}
      >
        Selecione os extras que deseja adicionar:
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxHeight: "280px",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {addons.map((addon) => {
          const isSelected = selected.some((a) => a.addonId === addon.id);
          return (
            <label
              key={addon.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                cursor: "pointer",
                border: `2px solid ${isSelected ? "var(--color-amber)" : "var(--color-smoke)"}`,
                background: isSelected
                  ? "rgba(245,166,35,0.08)"
                  : "var(--color-steel)",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(addon)}
                  style={{
                    accentColor: "var(--color-amber)",
                    width: "18px",
                    height: "18px",
                  }}
                />
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "var(--color-chalk)",
                    }}
                  >
                    {addon.name}
                  </p>
                  {addon.description && (
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.72rem",
                        color: "var(--color-ash)",
                      }}
                    >
                      {addon.description}
                    </p>
                  )}
                </div>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--color-amber)",
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap",
                }}
              >
                + {fmt(addon.price)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Remover Ingredientes ─────────────────────────────────────────────
function StepRemove({ ingredients = [], selected, onChange }) {
  const toggle = useCallback(
    (name) => {
      onChange((prev) =>
        prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
      );
    },
    [onChange],
  );

  const noteRef = useRef(null);

  if (!ingredients.length) {
    return (
      <div>
        <p
          style={{
            color: "var(--color-ash)",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}
        >
          Lista de ingredientes não disponível. Use o campo de observação
          abaixo.
        </p>
        <textarea
          ref={noteRef}
          placeholder="Ex: sem cebola, sem picles..."
          style={{
            width: "100%",
            background: "var(--color-steel)",
            border: "1px solid var(--color-smoke)",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            color: "var(--color-chalk)",
            fontSize: "0.875rem",
            resize: "vertical",
            minHeight: "80px",
            outline: "none",
            fontFamily: "var(--font-body)",
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <p
        style={{
          color: "var(--color-ash)",
          fontSize: "0.875rem",
          marginBottom: "1rem",
        }}
      >
        Desmarque o que não quer no seu burger:
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          maxHeight: "220px",
          overflowY: "auto",
        }}
      >
        {ingredients.map((ing) => {
          const removed = selected.includes(ing.name ?? ing);
          return (
            <button
              key={ing.name ?? ing}
              type="button"
              onClick={() => toggle(ing.name ?? ing)}
              style={{
                padding: "0.5rem 0.875rem",
                borderRadius: "2rem",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: 500,
                transition: "all 0.2s",
                border: `2px solid ${removed ? "var(--color-danger)" : "var(--color-smoke)"}`,
                background: removed
                  ? "rgba(239,68,68,0.15)"
                  : "var(--color-steel)",
                color: removed ? "var(--color-danger)" : "var(--color-chalk)",
                textDecoration: removed ? "line-through" : "none",
              }}
            >
              {removed ? "✕ " : ""}
              {ing.name ?? ing}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Notes ────────────────────────────────────────────────────────────────────
function NotesField({ value, onChange }) {
  return (
    <div style={{ marginTop: "1rem" }}>
      <label
        style={{
          fontSize: "0.8rem",
          color: "var(--color-ash)",
          display: "block",
          marginBottom: "0.4rem",
        }}
      >
        Observação (opcional)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: capricha no bacon, molho à parte..."
        maxLength={500}
        style={{
          width: "100%",
          background: "var(--color-steel)",
          border: "1px solid var(--color-smoke)",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
          color: "var(--color-chalk)",
          fontSize: "0.8rem",
          resize: "none",
          height: "70px",
          outline: "none",
          fontFamily: "var(--font-body)",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--color-amber)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--color-smoke)")}
      />
    </div>
  );
}

// ─── Main ProductModal ─────────────────────────────────────────────────────────
function ProductModal({ product, onClose }) {
  const { addItem, openCart } = useCart();

  const isBurger = product.isBurger === true;
  const firstStep = isBurger ? 0 : 1; // skip doneness for non-burgers
  const totalSteps = isBurger ? 3 : 2;

  const [step, setStep] = useState(firstStep);
  const [meatDoneness, setMeatDoneness] = useState("AO_PONTO");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addonsPrice = selectedAddons.reduce(
    (acc, a) => acc + a.price * a.quantity,
    0,
  );
  const unitPrice = Number(product.basePrice) + addonsPrice;
  const totalDisplay = unitPrice * qty;

  const stepTitle = isBurger ? STEPS[step] : STEPS[step];

  const handleNext = () => {
    if (step < totalSteps - 1 + firstStep) {
      setStep((s) => s + 1);
    } else {
      handleAdd();
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleAdd = () => {
    const key = `${product.id}-${Date.now()}`;
    addItem({
      key,
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      basePrice: Number(product.basePrice),
      unitPrice,
      quantity: qty,
      meatDoneness: isBurger ? meatDoneness : undefined,
      addons: selectedAddons,
      removedIngredients,
      notes,
    });
    onClose();
  };

  const lastStep = step === (isBurger ? 2 : 2);

  // Ingredients from product (if available)
  const ingredients =
    product.productIngredients?.map((pi) => pi.ingredient) ?? [];
  const addons = product.productAddons?.map((pa) => pa.addon) ?? [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "520px",
          background: "var(--color-iron)",
          border: "1px solid var(--color-smoke)",
          borderRadius: "1.25rem 1.25rem 0 0",
          padding: "1.5rem",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            width: "48px",
            height: "4px",
            background: "var(--color-smoke)",
            borderRadius: "2px",
            margin: "0 auto 1.25rem",
          }}
        />

        {/* Product header */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{
                width: "88px",
                height: "88px",
                objectFit: "cover",
                borderRadius: "0.875rem",
                flexShrink: 0,
              }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "0.875rem",
                flexShrink: 0,
                background: "var(--color-steel)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.25rem",
              }}
            >
              🍔
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h2
              className="font-display"
              style={{
                margin: "0 0 4px",
                fontSize: "1.5rem",
                color: "var(--color-chalk)",
                lineHeight: 1.1,
              }}
            >
              {product.name}
            </h2>
            {product.description && (
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "0.78rem",
                  color: "var(--color-ash)",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {product.description}
              </p>
            )}
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                color: "var(--color-amber)",
                fontSize: "1.1rem",
              }}
            >
              {fmt(unitPrice)}
              {addonsPrice > 0 && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--color-ash)",
                    marginLeft: "6px",
                    fontWeight: 400,
                  }}
                >
                  (base {fmt(product.basePrice)} + {fmt(addonsPrice)})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={step} isBurger={isBurger} />

        {/* Step content */}
        <div style={{ minHeight: "200px" }}>
          {step === 0 && isBurger && (
            <StepDoneness value={meatDoneness} onChange={setMeatDoneness} />
          )}
          {step === 1 && (
            <StepExtras
              addons={addons}
              selected={selectedAddons}
              onChange={setSelectedAddons}
            />
          )}
          {step === 2 && (
            <StepRemove
              ingredients={ingredients}
              selected={removedIngredients}
              onChange={setRemovedIngredients}
            />
          )}
        </div>

        {/* Notes (visible on last step) */}
        {lastStep && <NotesField value={notes} onChange={setNotes} />}

        {/* Quantity + CTA */}
        <div
          style={{
            marginTop: "1.25rem",
            borderTop: "1px solid var(--color-smoke)",
            paddingTop: "1rem",
          }}
        >
          {/* Qty picker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.875rem",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--color-ash)" }}>
              Quantidade:
            </span>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "var(--color-steel)",
                  border: "1px solid var(--color-smoke)",
                  color: "var(--color-chalk)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                −
              </button>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  minWidth: "24px",
                  textAlign: "center",
                }}
              >
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "var(--color-steel)",
                  border: "1px solid var(--color-smoke)",
                  color: "var(--color-chalk)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Navigation buttons */}
          <div style={{ display: "flex", gap: "0.625rem" }}>
            {step > firstStep && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-ghost"
                style={{ flex: 1, padding: "0.875rem" }}
              >
                ← Voltar
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="btn-amber"
              style={{ flex: 2, padding: "0.875rem", fontSize: "1rem" }}
            >
              {lastStep ? `Adicionar • ${fmt(totalDisplay)}` : "Próximo →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductModal);
