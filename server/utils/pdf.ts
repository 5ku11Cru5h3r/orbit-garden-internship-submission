// // import PDFDocument from "pdfkit";
// // import { saveBuffer } from "./storage";

// // export async function generateReportPDF(options: {
// //   patient: { name: string; patientId: string; email: string };
// //   note: string;
// //   uploadedAt: Date;
// //   originalImageUrl: string;
// //   annotatedImageUrl?: string;
// // }): Promise<{ url: string; key: string }> {
// //   const doc = new PDFDocument({ size: "A4", margin: 50 });
// //   const chunks: Buffer[] = [];
// //   return await new Promise((resolve, reject) => {
// //     doc.on("data", (chunk) => chunks.push(chunk as Buffer));
// //     doc.on("end", async () => {
// //       const buffer = Buffer.concat(chunks);
// //       try {
// //         const saved = await saveBuffer(buffer, "application/pdf", "reports");
// //         resolve(saved);
// //       } catch (e) {
// //         reject(e);
// //       }
// //     });

// //     doc
// //       .fontSize(20)
// //       .text("OralVis Healthcare - Dental Report", { align: "center" });
// //     doc.moveDown();

// //     doc.fontSize(12).text(`Patient Name: ${options.patient.name}`);
// //     doc.text(`Patient ID: ${options.patient.patientId}`);
// //     doc.text(`Email: ${options.patient.email}`);
// //     doc.text(`Uploaded: ${options.uploadedAt.toLocaleString()}`);
// //     doc.moveDown();

// //     doc.fontSize(14).text("Notes", { underline: true });
// //     doc.fontSize(12).text(options.note || "N/A");
// //     doc.moveDown();
// //     doc
// //       .image(options.originalImageUrl, 0, 15, { width: 300 })
// //       .text("Patient Image", 0, 0);
// //     doc
// //       .image(options.annotatedImageUrl, 0, 15, { width: 300 })
// //       .text("Annotated Image", 0, 0);
// //     // const addImage = async (label: string, url: string) => {
// //     //   try {
// //     //     // pdfkit can embed only from file or buffer; for simplicity we render a label and the URL instead of fetching remote
// //     //     doc.fontSize(12).text(label + ": " + url, { link: url, underline: true });
// //     //   } catch {
// //     //     // ignore
// //     //   }
// //     // };

// //     // addImage("Original Image", options.originalImageUrl);
// //     // if (options.annotatedImageUrl) addImage("Annotated Image", options.annotatedImageUrl);

// //     doc.end();
// //   });
// // }
// import PDFDocument from "pdfkit";
// import { saveBuffer } from "./storage";

//  export async function generateReportPDF(options: {
//   patient: { name: string; patientId: string; email: string };
//   note: string;
//   uploadedAt: Date;
//   originalImageUrl: string;
//   annotatedImageUrl?: string;
// }): Promise<{ url: string; key: string }> {
//   const doc = new PDFDocument({ size: "A4", margin: 50 });
//   const chunks: Buffer[] = [];

//   return await new Promise((resolve, reject) => {
//     doc.on("data", (chunk) => chunks.push(chunk as Buffer));
//     doc.on("end", async () => {
//       const buffer = Buffer.concat(chunks);
//       try {
//         const saved = await saveBuffer(buffer, "application/pdf", "reports");
//         resolve(saved);
//       } catch (e) {
//         reject(e);
//       }
//     });


//     // Patient Info Row
//     const infoY = 100;
//     doc.fontSize(12).font("Helvetica");
//     doc.text(`Name: ${options.patient.name}`, 50, infoY);
//     doc.text(`Email: ${options.patient.email}`, 250, infoY);
//     doc.text(
//       `Date: ${new Date().toLocaleDateString("en-GB")}`,
//       450,
//       infoY
//     );

//     doc.moveDown(3);

//     // Screening Report Title
//     doc.fontSize(14).font("Helvetica-Bold").text("SCREENING REPORT:", 50, 160);

//     // Images (Upper, Front, Lower)
//     const imgY = 180;
//     const imgW = 150;
//     const imgH = 120;

//     doc.image(options.originalImageUrl, 60, imgY, { width: imgW, height: imgH });
//     doc.text("Original Teeth", 100, imgY + imgH + 10, { align: "center" });

//     doc.image(options.annotatedImageUrl, 230, imgY, { width: imgW, height: imgH });
//     doc.text("Annotated Teeth", 270, imgY + imgH + 10, { align: "center" });

//     // doc.image(options.lowerImageUrl, 400, imgY, { width: imgW, height: imgH });
//     // doc.text("Lower Teeth", 440, imgY + imgH + 10, { align: "center" });

//     doc.moveDown(10);

//     // Legend
//     const legendY = 330;
//     const legendX = 60;
//     const legends = [
//       { color: "#800020", label: "Inflammed / Red gums" },
//       { color: "#FFD700", label: "Malaligned" },
//       { color: "#FF7F50", label: "Receded gums" },
//       { color: "#FF0000", label: "Stains" },
//       { color: "#00BFFF", label: "Attrition" },
//       { color: "#FF00FF", label: "Crowns" },
//     ];

//     legends.forEach((item, i) => {
//       doc.rect(legendX, legendY + i * 20, 10, 10).fill(item.color).stroke();
//       doc.fillColor("black").fontSize(11);
//       doc.text(item.label, legendX + 20, legendY + i * 20);
//     });

//     // Treatment Recommendations
//     const recY = 480;
//     doc.fontSize(14).font("Helvetica-Bold").text("TREATMENT RECOMMENDATIONS:", 50, recY);

//     const recs = [
//       { label: "Inflammed or Red gums", text: "Scaling." },
//       { label: "Malaligned", text: "Braces or Clear Aligner." },
//       { label: "Receded gums", text: "Gum Surgery." },
//       { label: "Stains", text: "Teeth cleaning and polishing." },
//       { label: "Attrition", text: "Filling/ Night Guard." },
//       {
//         label: "Crowns",
//         text: "If the crown is loose or broken, better get it checked. Teeth coloured caps are the best ones.",
//       },
//     ];

//     doc.fontSize(12).font("Helvetica");
//     let y = recY + 30;
//     recs.forEach((r) => {
//       doc.fillColor("black").text(`${r.label}:`, 60, y, { continued: true });
//       doc.fillColor("black").text(` ${r.text}`);
//       y += 25;
//     });

//     // End
//     doc.end();
//   });
// }
import PDFDocument from "pdfkit";
import { saveBuffer } from "./storage";

export async function generateReportPDF(options: {
  patient: { name: string; patientId: string; email: string };
  note: string;
  uploadedAt: Date;
  originalImageUrl: string;
  annotatedImageUrl?: string;
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
        console.error("PDF saveBuffer failed:", e);
        reject(new Error("PDF generation failed: " + (e as Error).message));
      }
    });

    // Header - Purple Box
    doc.rect(0, 0, doc.page.width, 80).fill("#8e6cd1");
    doc.fillColor("white").fontSize(22).font("Helvetica-Bold");
    doc.text("Oral Health Screening Report", 0, 30, { align: "center" });
    doc.fillColor("black");

    // Patient Info
    const infoY = 100;
    doc.fontSize(12).font("Helvetica");
    doc.text(`Name: ${options.patient.name}`, 50, infoY);
    doc.text(`Patient ID: ${options.patient.patientId}`, 250, infoY);
    doc.text(`Email: ${options.patient.email}`, 50, infoY + 20);
    doc.text(
      `Uploaded: ${options.uploadedAt.toLocaleDateString("en-GB")}`,
      250,
      infoY + 20
    );

    doc.moveDown(3);

    // Screening Report Section
    doc.fontSize(14).font("Helvetica-Bold").text("SCREENING REPORT:", 50, 160);

    const imgY = 190;
    const imgW = 150;
    const imgH = 120;

    // Original Image
    try {
      console.log("Loading original image from URL:", options.originalImageUrl);
      console.log("Loading annotated image from URL:", options.annotatedImageUrl);
      doc.image(options.originalImageUrl, 60, imgY, { width: imgW, height: imgH });
      doc.fontSize(12).fillColor("black").text("Original Teeth", 100, imgY + imgH + 10, { align: "center" });
    } catch (err) {
      console.error("Could not load original image:", err);
      doc.fontSize(12).fillColor("red").text("", 60, imgY);
    }

    // Annotated Image (optional)
    if (options.annotatedImageUrl) {
      try {
        doc.image(options.annotatedImageUrl, 260, imgY, { width: imgW, height: imgH });
        doc.fontSize(12).fillColor("black").text("Annotated Teeth", 300, imgY + imgH + 10, { align: "center" });
      } catch (err) {
        console.error("Could not load annotated image:", err);
        doc.fontSize(12).fillColor("red").text("", 260, imgY);
      }
    }

    doc.moveDown(10);

    // Legend
    const legendY = 350;
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

    doc.end();
  });
}
