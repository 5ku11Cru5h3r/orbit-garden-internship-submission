import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const items = await api.get<any[]>("/api/submissions/mine");
      setSubmissions(items);
    } catch {}
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return setError("Image required");
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("patientId", patientId);
      form.append("email", email);
      form.append("note", note);
      form.append("image", image);
      await api.postForm("/api/submissions", form);
      setName(""); setPatientId(""); setEmail(""); setNote(""); setImage(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div>
        <h2 className="text-xl font-semibold mb-2">Upload Teeth Photo</h2>
        <p className="text-sm text-muted-foreground mb-6">Fill in your details and attach a clear dental image. Supported up to 15MB.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" required/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Patient ID</label>
              <input value={patientId} onChange={(e)=>setPatientId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" required/>
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" required/>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Note</label>
            <textarea value={note} onChange={(e)=>setNote(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" rows={3}/>
          </div>
          <div>
            <label className="block text-sm mb-1">Upload Image</label>
            <input type="file" accept="image/*" onChange={(e)=>setImage(e.target.files?.[0]||null)} className="w-full" required/>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={loading} className="px-4 py-2 rounded-md bg-primary text-primary-foreground">{loading?"Uploading...":"Submit"}</button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">My Submissions</h2>
        <div className="space-y-3">
          {submissions.map((s)=> (
            <div key={s._id} className="border rounded-md p-4 bg-card flex items-center gap-4">
              <img src={s.originalImageUrl} alt="teeth" className="h-16 w-16 object-cover rounded"/>
              <div className="flex-1">
                <div className="font-medium">{s.name} • {s.patientId}</div>
                <div className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()} • {s.status}</div>
              </div>
              {s.reportUrl && (
                <a href={s.reportUrl} target="_blank" className="text-sm px-3 py-1.5 rounded bg-secondary text-secondary-foreground">Download PDF</a>
              )}
            </div>
          ))}
          {submissions.length===0 && <div className="text-sm text-muted-foreground">No submissions yet.</div>}
        </div>
      </div>
    </div>
  );
}
