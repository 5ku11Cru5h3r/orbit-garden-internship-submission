import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
      <p className="mb-6 text-muted-foreground">Login to access your OralVis dashboard</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border rounded-md px-3 py-2 bg-background" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border rounded-md px-3 py-2 bg-background" required />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="w-full py-2 rounded-md bg-primary text-primary-foreground font-medium">{loading ? "Signing in..." : "Sign in"}</button>
      </form>
      <p className="mt-4 text-sm">No account? <Link to="/auth/register" className="text-primary underline">Register</Link></p>
    </div>
  );
}
