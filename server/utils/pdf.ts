import PDFDocument from "pdfkit";
import { saveBuffer } from "./storage";

export async function generateReportPDF(options: {
  patient: { name: string; patientId: string; email: string };
  note: string;
  uploadedAt: Date;
  originalImageUrl: string;
  annotatedImageUrl?: string;
}): Promise<{ url: string; key: string }>{
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  return await new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      try {
        const saved = await saveBuffer(buffer, "application/pdf", "reports");
        resolve(saved);
      } catch (e) {
        reject(e);
      }
    });

    doc.fontSize(20).text("OralVis Healthcare - Dental Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Patient Name: ${options.patient.name}`);
    doc.text(`Patient ID: ${options.patient.patientId}`);
    doc.text(`Email: ${options.patient.email}`);
    doc.text(`Uploaded: ${options.uploadedAt.toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text("Notes", { underline: true });
    doc.fontSize(12).text(options.note || "N/A");
    doc.moveDown();

    const addImage = async (label: string, url: string) => {
      try {
        // pdfkit can embed only from file or buffer; for simplicity we render a label and the URL instead of fetching remote
        doc.fontSize(12).text(label + ": " + url, { link: url, underline: true });
      } catch {
        // ignore
      }
    };

    addImage("Original Image", options.originalImageUrl);
    if (options.annotatedImageUrl) addImage("Annotated Image", options.annotatedImageUrl);

    doc.end();
  });
}
