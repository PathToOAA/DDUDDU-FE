// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./index.css";
import App from "./App.tsx";
import OdsayLocalTest from "./pages/OdsayLocalTest";

createRoot(document.getElementById("root")!).render(import.meta.env.DEV && new URLSearchParams(location.search).has("odsay-test") ? <OdsayLocalTest /> : <App />);
