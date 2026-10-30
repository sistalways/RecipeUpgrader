import { useState } from "react";
import { useAuth } from "./hooks/useAuth.js";
import { HomePage } from "./pages/HomePage.js";
import { SignInPage } from "./pages/SignInPage.js";

/**
 * Shows the sign-in page first, with guest mode under it. Once the user
 * signs in or picks guest mode, they get the tool. If login isn't
 * configured for this deployment, everyone goes straight to the tool.
 */
export function App() {
  const { isAuthAvailable, session, isLoading } = useAuth();
  const [isGuest, setIsGuest] = useState(false);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500" role="status">
          Loading…
        </p>
      </main>
    );
  }

  if (isAuthAvailable && !session && !isGuest) {
    return <SignInPage onContinueAsGuest={() => setIsGuest(true)} />;
  }

  return <HomePage onSignInClick={() => setIsGuest(false)} />;
}
