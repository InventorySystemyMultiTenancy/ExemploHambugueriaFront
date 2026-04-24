import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../lib/api.js";

const fmt = (v) =>
  Number(v ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  price: "",
  category: "Hambúrgueres",
  imageUrl: "",
  isBurger: true,
  isActive: true,
  ingredients: "",
};

const CATEGORIES = [
  "Hambúrgueres",
  "Acompanhamentos",
  "Bebidas",
  "Sobremesas",
  "Outros",
];

function ProductFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? EMPTY_PRODUCT);
  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));
  const toggle = (field) => () =>
    setForm((p) => ({ ...p, [field]: !p[field] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: parseFloat(form.price),
      isBurger: Boolean(form.isBurger),
      isActive: Boolean(form.isActive),
      ingredients: form.ingredients
        ? form.ingredients
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    });
  };

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
          maxWidth: "540px",
          padding: "1.5rem",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            margin: "0 0 1.25rem",
            fontWeight: 800,
            color: "var(--color-chalk)",
          }}
        >
          {initial?.id ? "Editar Produto" : "Novo Produto"}
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <input
            className="input-dark"
            placeholder="Nome do produto *"
            value={form.name}
            onChange={set("name")}
            required
          />
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Descrição"
            style={{
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
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.625rem",
            }}
          >
            <input
              className="input-dark"
              type="number"
              min="0"
              step="0.01"
              placeholder="Preço (R$) *"
              value={form.price}
              onChange={set("price")}
              required
            />
            <select
              value={form.category}
              onChange={set("category")}
              style={{
                background: "var(--color-steel)",
                border: "1px solid var(--color-smoke)",
                borderRadius: "0.75rem",
                padding: "0.75rem 1rem",
                color: "var(--color-chalk)",
                fontSize: "0.875rem",
                outline: "none",
                fontFamily: "var(--font-body)",
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <input
            className="input-dark"
            placeholder="URL da imagem"
            value={form.imageUrl}
            onChange={set("imageUrl")}
          />
          <input
            className="input-dark"
            placeholder="Ingredientes (separados por vírgula)"
            value={form.ingredients}
            onChange={set("ingredients")}
          />
          <div style={{ display: "flex", gap: "1rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--color-chalk)",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.isBurger}
                onChange={toggle("isBurger")}
                style={{
                  accentColor: "var(--color-amber)",
                  width: "16px",
                  height: "16px",
                }}
              />
              É hambúrguer?
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--color-chalk)",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={toggle("isActive")}
                style={{
                  accentColor: "var(--color-amber)",
                  width: "16px",
                  height: "16px",
                }}
              />
              Ativo?
            </label>
          </div>

          <div
            style={{ display: "flex", gap: "0.625rem", marginTop: "0.5rem" }}
          >
            <button
              type="submit"
              className="btn-amber"
              style={{ flex: 1, padding: "0.875rem" }}
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ flex: 1, padding: "0.875rem" }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null); // null | { product? }
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("todos");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await api.get("/admin/products");
      return res.data?.data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return api.put(`/admin/products/${data.id}`, data);
      }
      return api.post("/admin/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Produto salvo!", {
        style: { background: "#222", color: "#F5A623" },
      });
      setModal(null);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.error?.message ?? "Erro ao salvar produto",
      );
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }) =>
      api.patch(`/admin/products/${id}`, { isActive: !isActive }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: () => toast.error("Erro ao atualizar produto"),
  });

  const filtered = products
    .filter((p) => tab === "todos" || p.category === tab)
    .filter(
      (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()),
    );

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
          📦 PRODUTOS
        </h1>
        <button
          type="button"
          onClick={() => setModal({ product: null })}
          className="btn-amber"
          style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
        >
          + Novo Produto
        </button>
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
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: "200px" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.375rem",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          {["todos", ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setTab(c)}
              className={tab === c ? "btn-amber" : "btn-ghost"}
              style={{ padding: "0.375rem 0.875rem", fontSize: "0.78rem" }}
            >
              {c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p style={{ color: "var(--color-ash)" }}>Carregando...</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            {filtered.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: "0.875rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  opacity: p.isActive ? 1 : 0.55,
                }}
              >
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "0.5rem",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontWeight: 700,
                      color: "var(--color-chalk)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {p.name}
                    {!p.isActive && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "0.65rem",
                          color: "var(--color-danger)",
                          border: "1px solid var(--color-danger)",
                          borderRadius: "3px",
                          padding: "1px 5px",
                        }}
                      >
                        Inativo
                      </span>
                    )}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.72rem",
                      color: "var(--color-ash)",
                    }}
                  >
                    {p.category}
                  </p>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 800,
                    color: "var(--color-amber)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(p.price)}
                </p>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        product: {
                          ...p,
                          ingredients: p.ingredients?.join(", ") ?? "",
                        },
                      })
                    }
                    className="btn-ghost"
                    style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toggleActiveMutation.mutate({
                        id: p.id,
                        isActive: p.isActive,
                      })
                    }
                    className="btn-ghost"
                    style={{
                      padding: "0.375rem 0.75rem",
                      fontSize: "0.75rem",
                      color: p.isActive
                        ? "var(--color-danger)"
                        : "var(--color-ok)",
                    }}
                  >
                    {p.isActive ? "Desativar" : "Ativar"}
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p
                style={{
                  color: "var(--color-ash)",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                Nenhum produto encontrado.
              </p>
            )}
          </div>
        )}
      </div>

      {modal && (
        <ProductFormModal
          initial={modal.product}
          onClose={() => setModal(null)}
          onSave={(data) => saveMutation.mutate(data)}
        />
      )}
    </div>
  );
}
