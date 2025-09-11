import PDFDocument from "pdfkit";
import { saveBuffer } from "./storage";

export async function generateReportPDF(options: {
  patient: { name: string; phone: string };
  date: Date;
  upperImageUrl: string;
  frontImageUrl: string;
  lowerImageUrl: string;
}): Promise<{ url: string; key: string }> {
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

    // HEADER - Purple Box
    doc.rect(0, 0, doc.page.width, 80).fill("#8e6cd1");
    doc.fillColor("white").fontSize(22).font("Helvetica-Bold");
    doc.text("Oral Health Screening Report", 0, 30, {
      align: "center",
    });
    doc.fillColor("black"); // reset

    doc.moveDown(3);

    // Patient Info Row
    const infoY = 100;
    doc.fontSize(12).font("Helvetica");
    doc.text(`Name: ${options.patient.name}`, 50, infoY);
    doc.text(`Phone: ${options.patient.phone}`, 250, infoY);
    doc.text(
      `Date: ${options.date.toLocaleDateString("en-GB")}`,
      450,
      infoY
    );

    doc.moveDown(3);

    // Screening Report Title
    doc.fontSize(14).font("Helvetica-Bold").text("SCREENING REPORT:", 50, 160);

    // Images (Upper, Front, Lower)
    const imgY = 180;
    const imgW = 150;
    const imgH = 120;

    doc.image(options.upperImageUrl, 60, imgY, { width: imgW, height: imgH });
    doc.text("Upper Teeth", 100, imgY + imgH + 10, { align: "center" });

    doc.image(options.frontImageUrl, 230, imgY, { width: imgW, height: imgH });
    doc.text("Front Teeth", 270, imgY + imgH + 10, { align: "center" });

    doc.image(options.lowerImageUrl, 400, imgY, { width: imgW, height: imgH });
    doc.text("Lower Teeth", 440, imgY + imgH + 10, { align: "center" });

    doc.moveDown(10);

    // Legend
    const legendY = 330;
    const legendX = 60;
    const legends = [
      { color: "#800020", label: "Inflammed / Red gums" },
      { color: "#FFD700", label: "Malaligned" },
      { color: "#FF7F50", label: "Receded gums" },
      { color: "#FF0000", label: "Stains" },
      { color: "#00BFFF", label: "Attrition" },
      { color: "#FF00FF", label: "Crowns" },
    ];

    legends.forEach((item, i) => {
      doc.rect(legendX, legendY + i * 20, 10, 10).fill(item.color).stroke();
      doc.fillColor("black").fontSize(11);
      doc.text(item.label, legendX + 20, legendY + i * 20);
    });

    // Treatment Recommendations
    const recY = 480;
    doc.fontSize(14).font("Helvetica-Bold").text("TREATMENT RECOMMENDATIONS:", 50, recY);

    const recs = [
      { label: "Inflammed or Red gums", text: "Scaling." },
      { label: "Malaligned", text: "Braces or Clear Aligner." },
      { label: "Receded gums", text: "Gum Surgery." },
      { label: "Stains", text: "Teeth cleaning and polishing." },
      { label: "Attrition", text: "Filling/ Night Guard." },
      {
        label: "Crowns",
        text: "If the crown is loose or broken, better get it checked. Teeth coloured caps are the best ones.",
      },
    ];

    doc.fontSize(12).font("Helvetica");
    let y = recY + 30;
    recs.forEach((r) => {
      doc.fillColor("black").text(`${r.label}:`, 60, y, { continued: true });
      doc.fillColor("black").text(` ${r.text}`);
      y += 25;
    });

    // End
    doc.end();
  });
}
