import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import CartDrawer from "../components/CartDrawer.jsx";

const HIGHLIGHTS = [
  {
    emoji: "🍔",
    title: "Artesanal",
    desc: "Cada burger feito na hora com ingredientes selecionados",
  },
  {
    emoji: "🔥",
    title: "Na Brasa",
    desc: "Ponto certo, selado na chapa de ferro fundido",
  },
  {
    emoji: "🚀",
    title: "Rápido",
    desc: "Pronto em até 25 min. Entrega ou retirada.",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-pitch)" }}>
      <Navbar />
      <CartDrawer />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Background image overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.35)",
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.7) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "2rem 1.5rem",
            maxWidth: "800px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
              color: "var(--color-amber)",
              letterSpacing: "0.3em",
              marginBottom: "1rem",
            }}
          >
            HAMBÚRGUERES ARTESANAIS
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(3.5rem, 10vw, 7rem)",
              color: "#fff",
              margin: "0 0 1.5rem",
              lineHeight: 0.95,
              letterSpacing: "0.04em",
            }}
          >
            MONTE SEU
            <br />
            <span style={{ color: "var(--color-amber)" }}>BURGER</span>
            <br />
            PERFEITO
          </h1>
          <p
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "2.5rem",
              maxWidth: "500px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.6,
            }}
          >
            Escolha o ponto da carne, adicione extras e monte seu pedido do
            jeito que você quer.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/cardapio"
              className="btn-amber"
              style={{
                padding: "1rem 2.5rem",
                fontSize: "1.1rem",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Ver Cardápio
            </Link>
            <Link
              to="/login"
              className="btn-ghost"
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Acompanhar Pedido
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "5rem 1.5rem",
        }}
      >
        <h2
          className="font-display"
          style={{
            textAlign: "center",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            color: "var(--color-chalk)",
            marginBottom: "3rem",
          }}
        >
          POR QUE A GENTE É{" "}
          <span style={{ color: "var(--color-amber)" }}>DIFERENTE</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                {h.emoji}
              </p>
              <h3
                className="font-display"
                style={{
                  fontSize: "1.5rem",
                  color: "var(--color-amber)",
                  marginBottom: "0.5rem",
                }}
              >
                {h.title}
              </h3>
              <p
                style={{
                  color: "var(--color-ash)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {h.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section
        style={{
          background: "var(--color-forge)",
          borderTop: "1px solid var(--color-smoke)",
          borderBottom: "1px solid var(--color-smoke)",
          padding: "4rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "var(--color-amber)",
            marginBottom: "1rem",
          }}
        >
          COM FOME AGORA?
        </h2>
        <Link
          to="/cardapio"
          className="btn-amber"
          style={{
            padding: "1.1rem 3rem",
            fontSize: "1.1rem",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Pedir Agora 🍔
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem 1.5rem",
          textAlign: "center",
          color: "var(--color-ash)",
          fontSize: "0.8rem",
        }}
      >
        © 2025 Burger Co. Todos os direitos reservados.
      </footer>
    </div>
  );
}
