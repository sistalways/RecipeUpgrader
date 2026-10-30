import { Button } from "./Button.js";
import { useAuth } from "../hooks/useAuth.js";
import { useGuestMode } from "../hooks/useGuestMode.js";

export type Page = "tool" | "saved";

interface AppHeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

export function AppHeader({ page, onNavigate }: AppHeaderProps) {
  const { isAuthAvailable, session, isLoading, signOut } = useAuth();
  const { exitGuestMode } = useGuestMode();

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          {isAuthAvailable ? (
            <button
              onClick={() => {
                if (session) void signOut();
                exitGuestMode();
              }}
              className="text-lg font-extrabold tracking-tight text-stone-900"
            >
              Recipe<span className="text-emerald-600">Upgrader</span>
            </button>
          ) : (
            <span className="text-lg font-extrabold tracking-tight text-stone-900">
              Recipe<span className="text-emerald-600">Upgrader</span>
            </span>
          )}
          {session && page === "tool" && (
            <Button variant="secondary" onClick={() => onNavigate("saved")}>
              Saved recipes
            </Button>
          )}
          {page === "saved" && (
            <Button variant="secondary" onClick={() => onNavigate("tool")}>
              ← Back to tool
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthAvailable && !isLoading && session && (
            <>
              <span className="hidden text-sm text-stone-500 sm:inline">{session.user.email}</span>
              <Button variant="ghost" onClick={() => void signOut()}>
                Sign out
              </Button>
            </>
          )}
          {isAuthAvailable && !isLoading && !session && (
            <Button variant="ghost" onClick={exitGuestMode}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
