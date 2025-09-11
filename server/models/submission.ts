import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SubmissionStatus = "uploaded" | "annotated" | "reported";

export interface ISubmission extends Document {
  patient: Types.ObjectId;
  name: string;
  patientId: string;
  email: string;
  note: string;
  originalImageUrl: string;
  annotatedImageUrl?: string;
  annotationJson?: any;
  reportUrl?: string;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    patientId: { type: String, required: true },
    email: { type: String, required: true },
    note: { type: String, default: "" },
    originalImageUrl: { type: String, required: true },
    annotatedImageUrl: { type: String },
    annotationJson: { type: Schema.Types.Mixed },
    reportUrl: { type: String },
    status: { type: String, enum: ["uploaded", "annotated", "reported"], default: "uploaded", index: true },
  },
  { timestamps: true }
);

export const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>("Submission", SubmissionSchema);
