import { Button } from "./Button.js";
import { useAuth } from "../hooks/useAuth.js";

export type Page = "tool" | "saved";

interface AppHeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

/** Only rendered for a signed-in user - App.tsx shows the sign-in screen otherwise. */
export function AppHeader({ page, onNavigate }: AppHeaderProps) {
  const { session, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("tool")}
            className="text-lg font-extrabold tracking-tight text-stone-900"
          >
            Recipe<span className="text-emerald-600">Upgrader</span>
          </button>
          {page === "tool" ? (
            <Button variant="secondary" onClick={() => onNavigate("saved")}>
              Saved recipes
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => onNavigate("tool")}>
              ← Back to tool
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session?.user.email && (
            <span className="hidden text-sm text-stone-500 sm:inline">{session.user.email}</span>
          )}
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
