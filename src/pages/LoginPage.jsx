import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;
  const { login } = useAuth();

  const [tab, setTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: "",
    password: "",
  });

  const handlePostAuth = (data) => {
    login(data);
    const role = data.user?.role;
    if (redirectTo) {
      navigate(redirectTo);
      return;
    }
    if (role === "COZINHA") {
      navigate("/cozinha");
      return;
    }
    if (["ADMIN", "FUNCIONARIO"].includes(role)) {
      navigate("/admin");
      return;
    }
    if (role === "MOTOBOY") {
      navigate("/motoboy");
      return;
    }
    navigate("/dashboard");
  };

  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/auth/login", payload);
      return res.data?.data;
    },
    onSuccess: handlePostAuth,
    onError: () =>
      toast.error("Credenciais inválidas", {
        style: { background: "#222", color: "#fff" },
      }),
  });

  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/auth/register", payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      toast.success("Conta criada! Bem-vindo 🍔", {
        style: { background: "#222", color: "#F5A623" },
      });
      handlePostAuth(data);
    },
    onError: (err) => {
      const msg = err.response?.data?.error?.message || "Erro ao criar conta";
      toast.error(msg, { style: { background: "#222", color: "#fff" } });
    },
  });

  const onLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) return;
    loginMutation.mutate(loginForm);
  };

  const onRegisterSubmit = (e) => {
    e.preventDefault();
    if (!registerForm.email && !registerForm.phone) {
      toast.error("Informe email ou telefone");
      return;
    }
    registerMutation.mutate({
      name: registerForm.name,
      email: registerForm.email || undefined,
      phone: registerForm.phone || undefined,
      cpf: registerForm.cpf || undefined,
      address: registerForm.address || undefined,
      password: registerForm.password,
    });
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-pitch)",
        display: "flex",
      }}
    >
      {/* Left — hero */}
      <div
        style={{
          display: "none",
          position: "relative",
          overflow: "hidden",
          flex: "0 0 45%",
        }}
        className="lg-hero"
      >
        <img
          src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80"
          alt="Burger"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(245,166,35,0.6) 0%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "3rem",
            color: "#fff",
          }}
        >
          <p
            className="font-display"
            style={{
              fontSize: "3.5rem",
              margin: "0 0 1rem",
              lineHeight: 0.95,
              color: "#fff",
            }}
          >
            O BURGER
            <br />
            PERFEITO
            <br />
            <span style={{ color: "var(--color-amber)" }}>TE ESPERA.</span>
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <p
              className="font-display"
              style={{
                fontSize: "2rem",
                color: "var(--color-amber)",
                marginBottom: "2rem",
              }}
            >
              🍔 BURGER CO.
            </p>
          </Link>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "var(--color-iron)",
              borderRadius: "0.875rem",
              padding: "4px",
              marginBottom: "2rem",
            }}
          >
            {["login", "register"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "0.625rem",
                  borderRadius: "0.625rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-body)",
                  background: tab === t ? "var(--color-amber)" : "transparent",
                  color: tab === t ? "#000" : "var(--color-ash)",
                  transition: "all 0.2s",
                }}
              >
                {t === "login" ? "Entrar" : "Criar Conta"}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === "login" && (
            <form
              onSubmit={onLoginSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-ash)",
                    display: "block",
                    marginBottom: "0.375rem",
                  }}
                >
                  Email ou Telefone
                </label>
                <input
                  className="input-dark"
                  type="text"
                  placeholder="seu@email.com ou (11) 99999-9999"
                  value={loginForm.identifier}
                  onChange={(e) =>
                    setLoginForm((f) => ({ ...f, identifier: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-ash)",
                    display: "block",
                    marginBottom: "0.375rem",
                  }}
                >
                  Senha
                </label>
                <input
                  className="input-dark"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-amber"
                disabled={isLoading}
                style={{
                  padding: "1rem",
                  fontSize: "1rem",
                  marginTop: "0.5rem",
                }}
              >
                {isLoading ? "Entrando..." : "Entrar →"}
              </button>
            </form>
          )}

          {/* Register form */}
          {tab === "register" && (
            <form
              onSubmit={onRegisterSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-ash)",
                    display: "block",
                    marginBottom: "0.375rem",
                  }}
                >
                  Nome *
                </label>
                <input
                  className="input-dark"
                  type="text"
                  placeholder="Seu nome completo"
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.625rem",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-ash)",
                      display: "block",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Email
                  </label>
                  <input
                    className="input-dark"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-ash)",
                      display: "block",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Telefone
                  </label>
                  <input
                    className="input-dark"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={registerForm.phone}
                    onChange={(e) =>
                      setRegisterForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-ash)",
                    display: "block",
                    marginBottom: "0.375rem",
                  }}
                >
                  Endereço (opcional)
                </label>
                <input
                  className="input-dark"
                  type="text"
                  placeholder="Rua, número, bairro"
                  value={registerForm.address}
                  onChange={(e) =>
                    setRegisterForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-ash)",
                    display: "block",
                    marginBottom: "0.375rem",
                  }}
                >
                  Senha *
                </label>
                <input
                  className="input-dark"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
              </div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "var(--color-ash)",
                  margin: 0,
                }}
              >
                * Informe email ou telefone (pelo menos um)
              </p>
              <button
                type="submit"
                className="btn-amber"
                disabled={isLoading}
                style={{
                  padding: "1rem",
                  fontSize: "1rem",
                  marginTop: "0.25rem",
                }}
              >
                {isLoading ? "Criando conta..." : "Criar Conta →"}
              </button>
            </form>
          )}

          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.8rem",
              color: "var(--color-ash)",
            }}
          >
            <Link
              to="/cardapio"
              style={{ color: "var(--color-amber)", textDecoration: "none" }}
            >
              ← Voltar ao cardápio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
