import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleLabel = {
    ADMIN: "Admin",
    FUNCIONARIO: "Funcionário",
    COZINHA: "Cozinha",
    MOTOBOY: "Motoboy",
    CLIENTE: null,
  };

  return (
    <header
      style={{
        backgroundColor: "var(--color-forge)",
        borderBottom: "1px solid var(--color-smoke)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            color: "var(--color-amber)",
            letterSpacing: "0.08em",
            textDecoration: "none",
          }}
        >
          🍔 BURGER CO.
        </Link>

        {/* Nav links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Link
            to="/cardapio"
            style={{
              color: "var(--color-chalk)",
              textDecoration: "none",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--color-amber)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--color-chalk)")}
          >
            Cardápio
          </Link>

          {isAuthenticated && user?.role === "CLIENTE" && (
            <Link
              to="/dashboard"
              style={{
                color: "var(--color-chalk)",
                textDecoration: "none",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.color = "var(--color-amber)")
              }
              onMouseLeave={(e) =>
                (e.target.style.color = "var(--color-chalk)")
              }
            >
              Meus Pedidos
            </Link>
          )}

          {isAuthenticated && ["ADMIN", "FUNCIONARIO"].includes(user?.role) && (
            <Link
              to="/admin"
              style={{
                color: "var(--color-chalk)",
                textDecoration: "none",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Admin
            </Link>
          )}

          {isAuthenticated && user?.role === "COZINHA" && (
            <Link
              to="/cozinha"
              style={{
                color: "var(--color-chalk)",
                textDecoration: "none",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Cozinha
            </Link>
          )}

          {isAuthenticated && user?.role === "MOTOBOY" && (
            <Link
              to="/motoboy"
              style={{
                color: "var(--color-chalk)",
                textDecoration: "none",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Entregas
            </Link>
          )}

          {/* Cart button */}
          {(!isAuthenticated || user?.role === "CLIENTE") && (
            <button
              onClick={openCart}
              className="btn-amber"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                position: "relative",
              }}
            >
              🛒
              {totalItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "var(--color-danger)",
                    color: "#fff",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
          )}

          {/* Auth */}
          {isAuthenticated ? (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-ash)",
                  maxWidth: "100px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {roleLabel[user?.role] ? (
                  <span
                    style={{ color: "var(--color-amber)", marginRight: "4px" }}
                  >
                    [{roleLabel[user.role]}]
                  </span>
                ) : null}
                {user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-amber"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
