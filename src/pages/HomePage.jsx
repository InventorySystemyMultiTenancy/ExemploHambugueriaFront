import { Link } from "react-router-dom";
import CartDrawer from "../components/CartDrawer.jsx";
import Navbar from "../components/Navbar.jsx";
import { useTranslation } from "../context/I18nContext.jsx";

function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-[#0f0f13] text-gray-100">
      <Navbar activeLink="home" />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&q=80"
          alt="Hambúrguer artesanal"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
        <div className="absolute inset-0 flex items-center px-6 sm:px-16">
          <div className="max-w-lg">
            <p className="mb-3 font-display text-[0.65rem] uppercase tracking-[0.35em] text-amber-400">
              {t("HOME_TAGLINE_H", "Feito na hora · Ingredientes premium")}
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {t("HOME_HERO_TITLE_1_H", "Hambúrgueres")}
              <br />
              <span className="text-amber-400">
                {t("HOME_HERO_TITLE_2_H", "Artesanais")}
              </span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75 sm:text-base">
              {t(
                "HOME_HERO_DESC_H",
                "Carne fresca, pão brioche quentinho e combinações que vão te surpreender. Do smash ao duplo, cada mordida é única.",
              )}
            </p>
            <Link
              to="/cardapio"
              className="mt-7 inline-block rounded-2xl bg-amber-400 px-8 py-4 text-base font-extrabold text-[#10151d] shadow-xl transition-all hover:scale-[1.03] hover:bg-amber-300"
            >
              {t("HOME_BTN_ORDER_H", "Fazer Pedido Agora")}
            </Link>
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="mx-auto max-w-5xl px-6 py-14 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "🍔",
              titleKey: "HOME_FEAT_1_TITLE_H",
              titleDefault: "Smash Burger",
              descKey: "HOME_FEAT_1_DESC_H",
              descDefault:
                "Blend de carne prensado na chapa, caramelizado por fora e suculento por dentro.",
            },
            {
              icon: "🔥",
              titleKey: "HOME_FEAT_2_TITLE_H",
              titleDefault: "Feito na Hora",
              descKey: "HOME_FEAT_2_DESC_H",
              descDefault:
                "Cada pedido é preparado na hora. Sem pré-cozidos, sem congelados.",
            },
            {
              icon: "🛵",
              titleKey: "HOME_FEAT_3_TITLE_H",
              titleDefault: "Delivery Rápido",
              descKey: "HOME_FEAT_3_DESC_H",
              descDefault:
                "Entregamos quentinho até você. Acompanhe seu pedido em tempo real.",
            },
          ].map((feat) => (
            <div
              key={feat.titleKey}
              className="rounded-2xl border border-white/10 bg-[#1a1a22] p-6 text-center"
            >
              <div className="mb-3 text-4xl">{feat.icon}</div>
              <h3 className="mb-2 font-display text-lg font-bold text-amber-400">
                {t(feat.titleKey, feat.titleDefault)}
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                {t(feat.descKey, feat.descDefault)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sobre */}
      <section className="mx-auto max-w-4xl px-6 pb-16 sm:px-8">
        <div className="mb-8 text-center">
          <p className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-amber-400">
            {t("HOME_ABOUT_LABEL_H", "Quem somos")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-gray-100 sm:text-4xl">
            {t("HOME_ABOUT_TITLE_H", "Paixão por hambúrgueres artesanais")}
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-16 rounded-full bg-amber-400" />
        </div>

        <div className="space-y-5 text-base leading-8 text-gray-400">
          <p>
            {t(
              "HOME_ABOUT_P1_H",
              "Nascemos da paixão por hambúrgueres de verdade. Usamos apenas carnes frescas, pães artesanais quentinhos e ingredientes selecionados para criar experiências únicas a cada mordida.",
            )}
          </p>
          <p>
            {t(
              "HOME_ABOUT_P2_H",
              "Além dos nossos smash burgers, temos opções para todos os gostos: duplos, vegetarianos, combos com batata frita e muito mais. Cada item do cardápio é preparado com o mesmo cuidado e dedicação.",
            )}
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/cardapio"
            className="rounded-2xl bg-amber-400 px-10 py-4 text-base font-bold text-[#10151d] shadow-md transition-all hover:scale-[1.02] hover:bg-amber-300"
          >
            {t("HOME_BTN_MENU_H", "Ver Cardápio Completo")}
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#1e1e2a] py-6 text-center text-xs text-gray-500">
        {t(
          "FOOTER_COPYRIGHT_H",
          "Hamburgueria © 2024 · Artesanal do início ao fim!",
        )}
      </footer>

      <CartDrawer />
    </main>
  );
}

export default HomePage;
