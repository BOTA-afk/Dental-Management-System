import mongoose from "mongoose";

const MedicationItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medication name is required"],
      trim: true
    },
    dosage: {
      type: String,
      required: [true, "Dosage is required"],
      trim: true
    },
    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      trim: true
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true
    },
    instructions: {
      type: String,
      default: "",
      trim: true
    }
  },
  { _id: false }
);

const PrescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required"]
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Dentist is required"]
    },
    date: {
      type: Date,
      default: Date.now
    },
    diagnosis: {
      type: String,
      required: [true, "Clinical diagnosis is required"],
      trim: true
    },
    medications: {
      type: [MedicationItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one medication is required"
      }
    },
    notes: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Discontinued"],
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

PrescriptionSchema.index({ patient: 1, date: -1 });
PrescriptionSchema.index({ dentist: 1, date: -1 });

export default mongoose.models.Prescription || mongoose.model("Prescription", PrescriptionSchema);
