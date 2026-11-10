import { useState } from "react";
import { AppHeader, type Page } from "./components/AppHeader.js";
import { AuthGate } from "./components/AuthGate.js";
import { useAuth } from "./hooks/useAuth.js";
import { SavedRecipesPage } from "./pages/SavedRecipesPage.js";
import { ToolPage } from "./pages/ToolPage.js";

export function App() {
  const { isAuthAvailable, session, isLoading } = useAuth();
  const [page, setPage] = useState<Page>("tool");

  // Sign-in is required, so without Supabase configured there's no way in.
  // Say so plainly rather than showing a tool every request would fail on.
  if (!isAuthAvailable) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <p className="max-w-sm text-center text-sm text-stone-600" role="alert">
          Sign-in isn't configured for this deployment. Set VITE_SUPABASE_URL and
          VITE_SUPABASE_ANON_KEY (see README) and reload.
        </p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-sm text-stone-500" role="status">
          Loading…
        </p>
      </main>
    );
  }

  if (!session) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <AppHeader page={page} onNavigate={setPage} />
      {page === "saved" ? <SavedRecipesPage /> : <ToolPage />}
    </div>
  );
}
