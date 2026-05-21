import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getRouter } from "./router";
import { Toaster } from "sonner";
import { syncFromSupabase } from "@/lib/store";
import "./styles.css";

const queryClient = new QueryClient();
const router = getRouter();

// Sync user session from Supabase on app load
syncFromSupabase().catch(console.error);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "rgba(17,17,17,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid #222",
            borderRadius: "9999px",
            color: "#fafafa",
            fontFamily: "DM Sans, sans-serif",
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
