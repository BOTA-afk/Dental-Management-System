import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Supplier from './models/Supplier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const seedSuppliers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected for seeding suppliers...");

    const suppliers = [
      {
        name: "Prime Dental Supplies Ltd",
        contactPerson: "Kamal Perera",
        email: "kamal.dental@example.com",
        phone: "+94 77 123 4567",
        address: "No. 45 High Level Road, Colombo 06",
        categories: ["Supply"],
        notes: "Official distributor of medical examination gloves, masks, and disposable instruments."
      },
      {
        name: "MediPharma Distributors",
        contactPerson: "Dr. Nimal Fernando",
        email: "orders@medipharma.lk",
        phone: "+94 11 289 9000",
        address: "No. 12 Hospital Square, Colombo 08",
        categories: ["Medication"],
        notes: "Authorized supplier of local anesthetics, antibiotics, and dental analgesics."
      },
      {
        name: "Apex Precision Dental Instruments",
        contactPerson: "Saman Silva",
        email: "sales@apexinstruments.lk",
        phone: "+94 71 888 9911",
        address: "Industrial Zone, Kandy",
        categories: ["Supply", "Equipment"],
        notes: "Specializes in stainless steel mirrors, probes, tweezers, and restorative tools."
      }
    ];

    for (const sup of suppliers) {
      const exists = await Supplier.findOne({ email: sup.email });
      if (!exists) {
        await Supplier.create(sup);
        console.log(`🚀 Seeded supplier: ${sup.name}`);
      } else {
        console.log(`⚠️ Supplier already exists: ${sup.name}`);
      }
    }

    console.log("✅ Supplier seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Supplier seeding failed:", error);
    process.exit(1);
  }
};

seedSuppliers();
