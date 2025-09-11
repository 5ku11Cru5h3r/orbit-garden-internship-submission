import { useEffect, useRef, useState } from "react";

type Tool = "rect" | "circle" | "arrow" | "free" | "select";

type Shape =
  | { id: string; type: "rect"; x: number; y: number; w: number; h: number; color: string }
  | { id: string; type: "circle"; x: number; y: number; r: number; color: string }
  | { id: string; type: "arrow"; x1: number; y1: number; x2: number; y2: number; color: string }
  | { id: string; type: "free"; points: { x: number; y: number }[]; color: string };

export default function AnnotationCanvas({ imageUrl, onExport, initial }: {
  imageUrl: string;
  onExport: (data: { imageBlob: Blob; json: Shape[] }) => void;
  initial?: Shape[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<Tool>("rect");
  const [color, setColor] = useState<string>("#ff3838");
  const [shapes, setShapes] = useState<Shape[]>(initial || []);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => { setShapes(initial || []); }, [initial]);

  useEffect(() => {
    const canvas = canvasRef.current; const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;

    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.fillStyle = color + "55";

    for (const s of shapes) {
      ctx.strokeStyle = s.color; ctx.fillStyle = s.color + "33";
      switch(s.type){
        case "rect": ctx.strokeRect(s.x, s.y, s.w, s.h); break;
        case "circle": ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.stroke(); break;
        case "arrow": drawArrow(ctx, s.x1, s.y1, s.x2, s.y2, s.color); break;
        case "free": drawFree(ctx, s.points, s.color); break;
      }
    }
  }, [shapes, imageUrl, color]);

  const onMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    setStart(pos); setDrawing(true);
    if (tool === "free") setShapes((prev) => [...prev, { id: crypto.randomUUID(), type: "free", points: [pos], color }]);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !start) return;
    const pos = getPos(e);
    if (tool === "rect") {
      const rect = { id: currentId(), type: "rect" as const, x: start.x, y: start.y, w: pos.x - start.x, h: pos.y - start.y, color };
      setShapes((prev) => [...prev.slice(0,-1), rect]);
    } else if (tool === "circle") {
      const r = Math.hypot(pos.x - start.x, pos.y - start.y);
      const circle = { id: currentId(), type: "circle" as const, x: start.x, y: start.y, r, color };
      setShapes((prev) => [...prev.slice(0,-1), circle]);
    } else if (tool === "arrow") {
      const arrow = { id: currentId(), type: "arrow" as const, x1: start.x, y1: start.y, x2: pos.x, y2: pos.y, color };
      setShapes((prev) => [...prev.slice(0,-1), arrow]);
    } else if (tool === "free") {
      setShapes((prev) => {
        const copy = [...prev];
        const last = copy[copy.length-1] as Extract<Shape, {type:"free"}>;
        last.points.push(pos); return copy;
      });
    }
  };
  const onMouseUp = () => { setDrawing(false); setStart(null); };

  const startShape = (t: Tool) => {
    setTool(t);
    setShapes((prev) => (drawing ? prev : [...prev, emptyShape(t, color)]));
  };

  const exportImage = () => {
    const canvas = canvasRef.current!;
    canvas.toBlob((blob)=> blob && onExport({ imageBlob: blob, json: shapes }), "image/png");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <button onClick={()=>startShape("rect")} className={`px-3 py-1.5 rounded border ${tool==="rect"?"bg-secondary":""}`}>Rect</button>
        <button onClick={()=>startShape("circle")} className={`px-3 py-1.5 rounded border ${tool==="circle"?"bg-secondary":""}`}>Circle</button>
        <button onClick={()=>startShape("arrow")} className={`px-3 py-1.5 rounded border ${tool==="arrow"?"bg-secondary":""}`}>Arrow</button>
        <button onClick={()=>startShape("free")} className={`px-3 py-1.5 rounded border ${tool==="free"?"bg-secondary":""}`}>Freehand</button>
        <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="ml-2"/>
        <button onClick={()=>setShapes([])} className="ml-auto px-3 py-1.5 rounded border">Clear</button>
        <button onClick={exportImage} className="px-3 py-1.5 rounded bg-primary text-primary-foreground">Save Annotation</button>
      </div>
      <div className="border rounded-md overflow-auto max-h-[70vh]">
        <img ref={imgRef} src={imageUrl} alt="original" className="max-w-full hidden" onLoad={()=>{
          // trigger redraw
          setShapes((prev)=>[...prev]);
        }}/>
        <canvas ref={canvasRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} className="cursor-crosshair"/>
      </div>
    </div>
  );
}

function emptyShape(t: Tool, color: string): Shape {
  const id = crypto.randomUUID();
  switch (t) {
    case "rect": return { id, type: "rect", x: 0, y: 0, w: 0, h: 0, color };
    case "circle": return { id, type: "circle", x: 0, y: 0, r: 0, color };
    case "arrow": return { id, type: "arrow", x1: 0, y1: 0, x2: 0, y2: 0, color };
    case "free": return { id, type: "free", points: [], color };
    default: return { id, type: "rect", x: 0, y: 0, w: 0, h: 0, color };
  }
}

function getPos(e: React.MouseEvent) {
  const canvas = e.currentTarget as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function drawFree(ctx: CanvasRenderingContext2D, points: {x:number;y:number}[], color: string) {
  if (points.length < 2) return;
  ctx.strokeStyle = color; ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.stroke();
}
