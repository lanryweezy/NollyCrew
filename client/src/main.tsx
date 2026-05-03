import { createRoot } from "react-dom/client";
import { ClerkProvider } from '@clerk/clerk-react';
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Clerk Publishable Key is missing. Authentication features will be disabled.");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY || "pk_test_placeholder"} afterSignOutUrl="/">
    <App />
  </ClerkProvider>
);
