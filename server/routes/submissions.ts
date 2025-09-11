import { RequestHandler } from "express";
import multer from "multer";
import { Submission } from "../models/submission";
import { saveBuffer } from "../utils/storage";
import { generateReportPDF } from "../utils/pdf";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

export const createSubmission: RequestHandler = async (req, res) => {
  res.status(400).json({ error: "Use multipart/form-data" });
};

export const createSubmissionMultipart = [
  upload.single("image"),
  (async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Image is required" });
      const { name, patientId, email, note } = req.body as any;
      if (!name || !patientId || !email) return res.status(400).json({ error: "Missing fields" });
      const stored = await saveBuffer(file.buffer, file.mimetype, "uploads");
      const sub = await Submission.create({
        patient: req.user.id,
        name,
        patientId,
        email,
        note: note || "",
        originalImageUrl: stored.url,
        status: "uploaded",
      });
      res.json(sub);
    } catch (e) {
      res.status(500).json({ error: "Failed to create submission" });
    }
  }) as RequestHandler,
];

export const listMine: RequestHandler = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const items = await Submission.find({ patient: req.user.id }).sort({ createdAt: -1 });
  res.json(items);
};

export const listAll: RequestHandler = async (_req, res) => {
  const items = await Submission.find({}).sort({ createdAt: -1 });
  res.json(items);
};

export const getById: RequestHandler = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const s = await Submission.findById(req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  if (req.user.role === "patient" && String(s.patient) !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  res.json(s);
};

export const saveAnnotation = [
  upload.single("annotatedImage"),
  (async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const s = await Submission.findById(req.params.id);
      if (!s) return res.status(404).json({ error: "Not found" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

      let annotatedImageUrl: string | undefined;
      if (req.file) {
        const stored = await saveBuffer(req.file.buffer, req.file.mimetype, "uploads");
        annotatedImageUrl = stored.url;
      }
      const { annotationJson } = req.body as any;
      s.annotationJson = annotationJson ? JSON.parse(annotationJson) : s.annotationJson;
      if (annotatedImageUrl) s.annotatedImageUrl = annotatedImageUrl;
      s.status = "annotated";
      await s.save();
      res.json(s);
    } catch (e) {
      res.status(500).json({ error: "Failed to save annotation" });
    }
  }) as RequestHandler,
];

export const generateReport: RequestHandler = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const s = await Submission.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const saved = await generateReportPDF({
      patient: { name: s.name, patientId: s.patientId, email: s.email },
      note: s.note,
      uploadedAt: s.createdAt,
      originalImageUrl: s.originalImageUrl,
      annotatedImageUrl: s.annotatedImageUrl,
    });

    s.reportUrl = saved.url;
    s.status = "reported";
    await s.save();

    res.json({ reportUrl: s.reportUrl, status: s.status });
  } catch (e) {
    res.status(500).json({ error: "Failed to generate report" });
  }
};
