import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { SocketProvider } from "./context/SocketProvider";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    
    <SocketProvider>
    <App />
    </SocketProvider>
  </StrictMode>
);
