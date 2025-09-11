import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AuthRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "admin">("patient");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ name, email, password, role });
      navigate("/");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Create your account</h1>
      <p className="mb-6 text-muted-foreground">Join OralVis to manage dental image reports</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border rounded-md px-3 py-2 bg-background" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border rounded-md px-3 py-2 bg-background" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full border rounded-md px-3 py-2 bg-background">
            <option value="patient">Patient</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="w-full py-2 rounded-md bg-primary text-primary-foreground font-medium">{loading ? "Creating..." : "Create account"}</button>
      </form>
      <p className="mt-4 text-sm">Have an account? <Link to="/auth/login" className="text-primary underline">Login</Link></p>
    </div>
  );
}
