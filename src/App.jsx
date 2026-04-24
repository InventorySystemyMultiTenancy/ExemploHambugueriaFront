import { Toaster } from "react-hot-toast";
import AppRoutes from "./Routes.jsx";
import RealtimeBridge from "./realtime/RealtimeBridge.jsx";

function App() {
  return (
    <>
      <AppRoutes />
      <RealtimeBridge />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1A1A1A",
            color: "#DDDDDD",
            border: "1px solid #3A3A3A",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.875rem",
          },
        }}
      />
    </>
  );
}

export default App;
