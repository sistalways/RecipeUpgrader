import { AuthGate } from "./components/AuthGate.js";
import { useAuth } from "./hooks/useAuth.js";
import { useGuestMode } from "./hooks/useGuestMode.js";
import { HomePage } from "./pages/HomePage.js";

export function App() {
  const { isAuthAvailable, session, isLoading } = useAuth();
  const { isGuest, continueAsGuest } = useGuestMode();

  // Login isn't configured at all for this deployment — go straight to the
  // tool, same as always. Guest mode is the only mode in that case.
  if (!isAuthAvailable) {
    return <HomePage />;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500" role="status">
          Loading…
        </p>
      </main>
    );
  }

  if (!session && !isGuest) {
    return <AuthGate onContinueAsGuest={continueAsGuest} />;
  }

  return <HomePage />;
}
