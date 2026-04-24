import { createContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem("hb_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(() => localStorage.getItem("hb_token"));

  const login = (payload) => {
    setToken(payload.accessToken);
    setUser(payload.user);
    localStorage.setItem("hb_token", payload.accessToken);
    localStorage.setItem("hb_user", JSON.stringify(payload.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("hb_token");
    localStorage.removeItem("hb_user");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
