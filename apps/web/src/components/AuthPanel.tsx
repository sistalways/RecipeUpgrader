import { useAuth } from "../hooks/useAuth.js";

/**
 * Header status: who's signed in with a sign-out link, or a "Sign in"
 * link back to the sign-in page for guests. Renders nothing if login
 * isn't configured for this deployment (no Supabase env vars set).
 */
export function AuthPanel({ onSignInClick }: { onSignInClick: () => void }) {
  const { isAuthAvailable, session, isLoading, signOut } = useAuth();

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

  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span>Using as guest</span>
      <button onClick={onSignInClick} className="text-slate-500 underline hover:text-slate-800">
        Sign in
      </button>
    </div>
  );
}
