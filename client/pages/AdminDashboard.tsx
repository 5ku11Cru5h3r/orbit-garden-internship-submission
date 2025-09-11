import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    try {
      const data = await api.get<any[]>("/api/submissions");
      setItems(data);
    } catch {}
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin • Submissions</h1>
      <div className="grid gap-3">
        {items.map((s) => (
          <Link key={s._id} to={`/admin/submissions/${s._id}`} className="border rounded-md p-4 bg-card flex items-center gap-4 hover:border-primary">
            <img src={s.originalImageUrl} alt="teeth" className="h-16 w-16 object-cover rounded"/>
            <div className="flex-1">
              <div className="font-medium">{s.name} • {s.patientId}</div>
              <div className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()} • {s.status}</div>
            </div>
            <div className="text-sm text-primary">View →</div>
          </Link>
        ))}
        {items.length===0 && <div className="text-sm text-muted-foreground">No submissions yet.</div>}
      </div>
    </div>
  );
}
