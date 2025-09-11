import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">MERN • Role-based • S3-ready</div>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">OralVis Healthcare<br/>Dental Image Annotation & Reports</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-prose">Patients securely upload dental images. Admins annotate with rectangles, circles, arrows, or freehand, then generate polished PDF reports. Optional AWS S3 storage for originals, annotations, and reports.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {!user && (
            <>
              <Link to="/auth/register" className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium">Get Started</Link>
              <Link to="/auth/login" className="px-5 py-2.5 rounded-md border">Sign in</Link>
            </>
          )}
          {user?.role === "patient" && (
            <Link to="/patient" className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium">Upload & View Reports</Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium">Open Admin Dashboard</Link>
          )}
        </div>
        <ul className="mt-8 grid sm:grid-cols-2 gap-3 text-sm">
          <li className="p-3 rounded-md bg-card border">• JWT via HTTP-only cookies</li>
          <li className="p-3 rounded-md bg-card border">• Roles: patient, admin</li>
          <li className="p-3 rounded-md bg-card border">• Canvas annotation tools</li>
          <li className="p-3 rounded-md bg-card border">• PDF with embedded links</li>
        </ul>
      </div>
      <div className="relative">
        <div className="absolute -inset-6 blur-3xl bg-primary/20 rounded-full"/>
        <div className="relative border rounded-xl overflow-hidden shadow-lg">
          <img src="/placeholder.svg" alt="preview" className="w-full object-cover"/>
        </div>
      </div>
    </div>
  );
}
