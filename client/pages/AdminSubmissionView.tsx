import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import AnnotationCanvas from "@/components/AnnotationCanvas";

export default function AdminSubmissionView() {
  const { id } = useParams();
  const [sub, setSub] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [gen, setGen] = useState(false);

  const load = async () => {
    const s = await api.get<any>(`/api/submissions/${id}`);
    setSub(s);
  };

  useEffect(()=>{ load(); }, [id]);

  const onExport = async ({ imageBlob, json }: { imageBlob: Blob; json: any[] }) => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append("annotatedImage", imageBlob, `annotated.png`);
      form.append("annotationJson", JSON.stringify(json));
      await api.postForm(`/api/submissions/${id}/annotate`, form);
      await load();
    } finally { setSaving(false); }
  };

  const onGenerate = async () => {
    setGen(true);
    try {
      await api.post(`/api/submissions/${id}/report`, {});
      await load();
    } finally { setGen(false); }
  };

  if (!sub) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{sub.name} • {sub.patientId}</h1>
          <div className="text-sm text-muted-foreground">{new Date(sub.createdAt).toLocaleString()} • {sub.email}</div>
        </div>
        <div className="flex items-center gap-2">
          {sub.reportUrl && <a className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground" href={sub.reportUrl} target="_blank">Download PDF</a>}
          <button disabled={gen} onClick={onGenerate} className="px-3 py-1.5 rounded bg-primary text-primary-foreground">{gen?"Generating...":"Generate PDF"}</button>
        </div>
      </div>

      <AnnotationCanvas imageUrl={sub.originalImageUrl} initial={sub.annotationJson || []} onExport={onExport} />
      {saving && <div className="text-sm text-muted-foreground">Saving annotation...</div>}
    </div>
  );
}
