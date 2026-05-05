import { useMemo, useState } from "react";
import { useCart } from "../context/CartContext.jsx";

const DONENESS_OPTIONS = [
  { id: "MAL_PASSADO", label: "Mal passado" },
  { id: "AO_PONTO", label: "Ao ponto" },
  { id: "BEM_PASSADO", label: "Bem passado" },
];

const DEFAULT_ADDONS = [
  { id: "addon-bacon", nome: "Bacon crocante", price: 6 },
  { id: "addon-queijo-duplo", nome: "Queijo em dobro", price: 5 },
  { id: "addon-onion-rings", nome: "Onion rings", price: 7 },
  { id: "addon-picles-extra", nome: "Picles extra", price: 3 },
];

const DEFAULT_REMOVALS = [
  "Sem cebola",
  "Sem picles",
  "Sem tomate",
  "Sem molho especial",
];

const currency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function isBurgerProduct(product) {
  const cat = (product?.category ?? "").toLowerCase();
  return /hamburguer|hamburger|burger|lanche|sanduíche|sanduiche/.test(cat);
}

function ProductCustomizer({
  product,
  addonsOptions = DEFAULT_ADDONS,
  removalOptions = DEFAULT_REMOVALS,
  onClose,
}) {
  const { addItem, openCart } = useCart();

  const isBurger = isBurgerProduct(product);
  const [doneness, setDoneness] = useState("AO_PONTO");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedRemovals, setSelectedRemovals] = useState([]);
  const [observation, setObservation] = useState("");
  const [quantity, setQuantity] = useState(1);

  const basePrice = Number(product?.price ?? product?.basePrice ?? 0);

  const addonsTotal = useMemo(
    () =>
      selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0),
    [selectedAddons],
  );

  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((entry) => entry.id === addon.id);
      if (exists) {
        return prev.filter((entry) => entry.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const toggleRemoval = (item) => {
    setSelectedRemovals((prev) =>
      prev.includes(item)
        ? prev.filter((entry) => entry !== item)
        : [...prev, item],
    );
  };

  const handleAddToCart = () => {
    const productId = String(product?.id || "").trim();
    if (!productId) return;

    const keyParts = [
      productId,
      isBurger ? doneness : "",
      selectedAddons
        .map((addon) => addon.id)
        .sort()
        .join("."),
      selectedRemovals.slice().sort().join("."),
      observation.trim(),
    ];

    addItem({
      key: keyParts.join("|"),
      id: productId,
      nome: product?.nome || product?.name,
      price: basePrice,
      addons: selectedAddons,
      removals: selectedRemovals,
      observation: [
        isBurger
          ? `Ponto da carne: ${DONENESS_OPTIONS.find((option) => option.id === doneness)?.label || "Ao ponto"}`
          : null,
        observation.trim(),
      ]
        .filter(Boolean)
        .join(" | "),
      quantity,
      payload: {
        productId,
        addonIds: selectedAddons.map((addon) => addon.id),
        removedIngredients: isBurger ? selectedRemovals.join(", ") : "",
      },
    });

    openCart();
    if (onClose) onClose();
  };

  return (
    <section className="rounded-3xl border border-[#2b313c] bg-[#11161d] p-5 text-[#e8eaf0] shadow-xl sm:p-6">
      <header className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-[#f3f4f7]">
          {product?.nome || product?.name}
        </h2>
        <p className="mt-1 text-sm text-[#a1a8b8]">
          Customizacao premium do seu burger.
        </p>
      </header>

      <div className="space-y-5">
        {isBurger && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
              Ponto da carne
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {DONENESS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDoneness(option.id)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                    doneness === option.id
                      ? "border-amber-400 bg-amber-400/10 text-amber-300"
                      : "border-[#2b313c] bg-[#171d26] text-[#c4cada] hover:border-amber-500/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
            Extras
          </p>
          <div className="space-y-2">
            {addonsOptions.map((addon) => {
              const selected = selectedAddons.some(
                (entry) => entry.id === addon.id,
              );
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => toggleAddon(addon)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all ${
                    selected
                      ? "border-amber-400/70 bg-amber-400/10"
                      : "border-[#2b313c] bg-[#171d26] hover:border-[#3a4352]"
                  }`}
                >
                  <span className="text-sm text-[#e7e9ef]">{addon.nome}</span>
                  <span className="text-sm font-semibold text-amber-300">
                    + {currency(addon.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isBurger && removalOptions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
              Remover ingredientes
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {removalOptions.map((item) => {
                const selected = selectedRemovals.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleRemoval(item)}
                    className={`rounded-xl border px-3 py-2 text-sm transition-all ${
                      selected
                        ? "border-[#8b93a5] bg-[#2a2f39] text-white"
                        : "border-[#2b313c] bg-[#171d26] text-[#c7cde0] hover:border-[#8b93a5]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
            Observacao
          </label>
          <textarea
            rows={3}
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            placeholder="Ex: molho separado"
            className="w-full resize-none rounded-xl border border-[#2b313c] bg-[#171d26] px-3 py-2 text-sm text-[#edf0f6] outline-none placeholder:text-[#7b8394] focus:border-amber-400/60"
          />
        </div>
      </div>

      <footer className="mt-6 rounded-2xl border border-[#2b313c] bg-[#151b23] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-[#9aa3b5]">Quantidade</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-8 w-8 rounded-lg border border-[#323949] bg-[#1a202b] text-lg"
            >
              -
            </button>
            <span className="w-6 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="h-8 w-8 rounded-lg border border-[#323949] bg-[#1a202b] text-lg"
            >
              +
            </button>
          </div>
        </div>

        <p className="text-xs text-[#9aa3b5]">
          Unitario: {currency(unitPrice)}
        </p>
        <p className="mt-1 text-3xl font-bold text-amber-400">
          {currency(totalPrice)}
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product?.id}
          className="mt-4 w-full rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#11161d] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar ao carrinho
        </button>
      </footer>
    </section>
  );
}

export default ProductCustomizer;
