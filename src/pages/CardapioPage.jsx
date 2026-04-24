import { memo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/Navbar.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import ProductModal from "../components/ProductModal.jsx";
import { SkeletonList } from "../components/SkeletonCard.jsx";
import { api } from "../lib/api.js";

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CATEGORY_ICONS = {
  Hambúrgueres: "🍔",
  Acompanhamentos: "🍟",
  Bebidas: "🥤",
  Sobremesas: "🍦",
  Outros: "🍽️",
};

const CATEGORY_ORDER = [
  "Hambúrgueres",
  "Acompanhamentos",
  "Bebidas",
  "Sobremesas",
  "Outros",
];

// ─── Product Card (memoized) ──────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({ product }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <article
        onClick={() => setShowModal(true)}
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
          background: "var(--color-iron)",
          border: "1px solid var(--color-smoke)",
          borderRadius: "1rem",
          padding: "0.875rem",
          cursor: "pointer",
          transition: "border-color 0.2s, transform 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--color-amber)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--color-smoke)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Product image */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: "110px",
              height: "110px",
              objectFit: "cover",
              borderRadius: "0.75rem",
              flexShrink: 0,
            }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "0.75rem",
              flexShrink: 0,
              background: "var(--color-steel)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
            }}
          >
            {CATEGORY_ICONS[product.category] ?? "🍔"}
          </div>
        )}

        {/* Info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <h3
            style={{
              margin: "0 0 4px",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "var(--color-chalk)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {product.name}
          </h3>
          {product.description && (
            <p
              style={{
                margin: "0 0 8px",
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

          {/* Tags */}
          {product.isBurger && (
            <span
              style={{
                display: "inline-block",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "var(--color-amber)",
                border: "1px solid var(--color-amber)",
                borderRadius: "0.25rem",
                padding: "1px 6px",
                marginBottom: "6px",
                width: "fit-content",
              }}
            >
              CUSTOMIZÁVEL
            </span>
          )}

          {/* Price + CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                color: "var(--color-amber)",
                fontSize: "1rem",
              }}
            >
              {fmt(product.basePrice)}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="btn-amber"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                fontSize: "1.25rem",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Adicionar"
            >
              +
            </button>
          </div>
        </div>
      </article>

      {showModal && (
        <ProductModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  );
});

// ─── Category Section ─────────────────────────────────────────────────────────
function CategorySection({ category, products }) {
  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>
          {CATEGORY_ICONS[category] ?? "🍽️"}
        </span>
        <h2
          className="font-display"
          style={{
            margin: 0,
            fontSize: "1.75rem",
            color: "var(--color-chalk)",
          }}
        >
          {category.toUpperCase()}
        </h2>
        <div
          style={{ flex: 1, height: "1px", background: "var(--color-smoke)" }}
        />
        <span style={{ fontSize: "0.75rem", color: "var(--color-ash)" }}>
          {products.length} {products.length === 1 ? "item" : "itens"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

// ─── Combos Section ──────────────────────────────────────────────────────────
function ComboCard({ combo }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div
      className="card"
      style={{
        padding: "1rem",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-amber)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-smoke)")
      }
      onClick={() => setShowInfo((v) => !v)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {combo.imageUrl ? (
          <img
            src={combo.imageUrl}
            alt={combo.name}
            style={{
              width: "72px",
              height: "72px",
              objectFit: "cover",
              borderRadius: "0.625rem",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "0.625rem",
              flexShrink: 0,
              background: "var(--color-steel)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
            }}
          >
            🍱
          </div>
        )}
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: "0 0 2px",
              fontWeight: 700,
              color: "var(--color-chalk)",
              fontSize: "0.95rem",
            }}
          >
            {combo.name}
          </p>
          {combo.description && (
            <p
              style={{
                margin: "0 0 6px",
                fontSize: "0.75rem",
                color: "var(--color-ash)",
              }}
            >
              {combo.description}
            </p>
          )}
          <p
            style={{
              margin: 0,
              fontWeight: 800,
              color: "var(--color-amber)",
              fontSize: "1rem",
            }}
          >
            {Number(combo.promotionalPrice).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <span style={{ color: "var(--color-amber)", fontSize: "1.25rem" }}>
          {showInfo ? "▲" : "▼"}
        </span>
      </div>
      {showInfo && combo.parts?.length > 0 && (
        <ul
          style={{
            margin: "0.75rem 0 0",
            padding: "0 0 0 1rem",
            color: "var(--color-ash)",
            fontSize: "0.8rem",
          }}
        >
          {combo.parts.map((part) => (
            <li key={part.productId}>
              {part.quantity}× {part.product?.name ?? "Item"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CardapioPage() {
  const [activeCategory, setActiveCategory] = useState("todos");

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: combos = [], isLoading: loadingCombos } = useQuery({
    queryKey: ["combos"],
    queryFn: async () => {
      const res = await api.get("/combos");
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Group products by category
  const grouped = {};
  for (const p of products) {
    const cat = p.category ?? "Outros";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  const categories = [
    "todos",
    ...CATEGORY_ORDER.filter((c) => grouped[c]?.length),
  ];
  if (combos.length) categories.splice(1, 0, "combos");

  const filteredGroups =
    activeCategory === "todos"
      ? Object.entries(grouped).sort(([a], [b]) => {
          const ai = CATEGORY_ORDER.indexOf(a);
          const bi = CATEGORY_ORDER.indexOf(b);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        })
      : grouped[activeCategory]
        ? [[activeCategory, grouped[activeCategory]]]
        : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-pitch)" }}>
      <Navbar />
      <CartDrawer />

      {/* Page header */}
      <div
        style={{
          background: "var(--color-forge)",
          borderBottom: "1px solid var(--color-smoke)",
          padding: "2rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "var(--color-amber)",
              margin: "0 0 0.5rem",
            }}
          >
            CARDÁPIO
          </h1>
          <p
            style={{ color: "var(--color-ash)", margin: 0, fontSize: "0.9rem" }}
          >
            Monte seu burger ou escolha um dos nossos combos
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div
        style={{
          background: "var(--color-forge)",
          borderBottom: "1px solid var(--color-smoke)",
          overflowX: "auto",
          position: "sticky",
          top: "64px",
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            gap: "0.25rem",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "0.875rem 1rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                color:
                  activeCategory === cat
                    ? "var(--color-amber)"
                    : "var(--color-ash)",
                borderBottom: `2px solid ${activeCategory === cat ? "var(--color-amber)" : "transparent"}`,
                transition: "color 0.2s, border-color 0.2s",
                fontFamily: "var(--font-body)",
              }}
            >
              {cat === "todos"
                ? "🍽️ Todos"
                : cat === "combos"
                  ? "🍱 Combos"
                  : `${CATEGORY_ICONS[cat] ?? ""} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}
      >
        {/* Combos */}
        {(activeCategory === "todos" || activeCategory === "combos") &&
          combos.length > 0 && (
            <section style={{ marginBottom: "2.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>🍱</span>
                <h2
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: "1.75rem",
                    color: "var(--color-chalk)",
                  }}
                >
                  COMBOS
                </h2>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--color-smoke)",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#000",
                    background: "var(--color-amber)",
                    padding: "2px 8px",
                    borderRadius: "2rem",
                  }}
                >
                  PROMOÇÃO
                </span>
              </div>
              {loadingCombos ? (
                <SkeletonList count={2} />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  {combos.map((c) => (
                    <ComboCard key={c.id} combo={c} />
                  ))}
                </div>
              )}
            </section>
          )}

        {/* Products */}
        {loadingProducts ? (
          <>
            <div
              className="skeleton"
              style={{ height: "32px", width: "200px", marginBottom: "1rem" }}
            />
            <SkeletonList count={4} />
          </>
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map(([cat, prods]) => (
            <CategorySection key={cat} category={cat} products={prods} />
          ))
        ) : activeCategory !== "combos" ? (
          <p
            style={{
              color: "var(--color-ash)",
              textAlign: "center",
              padding: "3rem 0",
            }}
          >
            Nenhum produto disponível no momento.
          </p>
        ) : null}
      </main>
    </div>
  );
}
