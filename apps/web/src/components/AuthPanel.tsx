import { useAuth } from "../hooks/useAuth.js";
import { useGuestMode } from "../hooks/useGuestMode.js";

/**
 * Header-only auth status now that sign-in/sign-up live on the dedicated
 * AuthGate screen. Shows nothing at all if login isn't configured for
 * this deployment.
 */
export function AuthPanel() {
  const { isAuthAvailable, session, isLoading, signOut } = useAuth();
  const { exitGuestMode } = useGuestMode();

  if (!isAuthAvailable || isLoading) {
    return null;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span>Signed in as {session.user.email}</span>
        <button onClick={() => void signOut()} className="text-slate-500 underline hover:text-slate-800">
          Sign out
        </button>
      </div>
    );
  }

  // Signed out and already past the gate means the guest chose to continue
  // without an account — offer a way back to sign in without a reload.
  return (
    <button onClick={exitGuestMode} className="text-sm text-slate-500 underline hover:text-slate-800">
      Sign in
    </button>
  );
}
