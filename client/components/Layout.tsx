import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary" />
            <span className="font-extrabold tracking-tight text-xl">OralVis Healthcare</span>
          </Link>
          <nav className="flex items-center gap-4">
            {!user && (
              <>
                <Link to="/auth/login" className="text-sm hover:text-primary">Login</Link>
                <Link to="/auth/register" className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground">Register</Link>
              </>
            )}
            {user && (
              <>
                {user.role === "patient" && (
                  <Link to="/patient" className="text-sm hover:text-primary">My Dashboard</Link>
                )}
                {user.role === "admin" && (
                  <Link to="/admin" className="text-sm hover:text-primary">Admin</Link>
                )}
                <button
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                  className="text-sm px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">{children}</main>
      <footer className="border-t py-8 text-xs text-muted-foreground text-center">© {new Date().getFullYear()} OralVis Healthcare</footer>
    </div>
  );
}
