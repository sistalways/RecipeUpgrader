import { useState } from "react";
import { AppHeader, type Page } from "./components/AppHeader.js";
import { AuthGate } from "./components/AuthGate.js";
import { useAuth } from "./hooks/useAuth.js";
import { useGuestMode } from "./hooks/useGuestMode.js";
import { SavedRecipesPage } from "./pages/SavedRecipesPage.js";
import { ToolPage } from "./pages/ToolPage.js";

export function App() {
  const { isAuthAvailable, session, isLoading } = useAuth();
  const { isGuest, continueAsGuest } = useGuestMode();
  const [page, setPage] = useState<Page>("tool");

  // Login isn't configured at all for this deployment - go straight to the
  // tool, same as always. Guest mode is the only mode in that case.
  if (!isAuthAvailable) {
    return (
      <div className="min-h-screen bg-stone-50">
        <AppHeader page="tool" onNavigate={() => undefined} />
        <ToolPage />
      </div>
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

  if (!session && !isGuest) {
    return <AuthGate onContinueAsGuest={continueAsGuest} />;
  }

  const currentPage: Page = page === "saved" && session ? "saved" : "tool";

  return (
    <div className="min-h-screen bg-stone-50">
      <AppHeader page={currentPage} onNavigate={setPage} />
      {currentPage === "saved" ? <SavedRecipesPage /> : <ToolPage />}
    </div>
  );
}
