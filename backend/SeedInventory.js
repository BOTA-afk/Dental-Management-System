import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Inventory from './models/Inventory.js';
import InventoryLog from './models/InventoryLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const seedInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected for seeding inventory...");

    const items = [
      {
        name: "Latex Gloves (Box)",
        category: "Supply",
        quantity: 8,
        minimumThreshold: 15,
        unit: "Box",
        price: 1200,
        description: "Medical grade powder-free latex gloves. 100 units per box."
      },
      {
        name: "Dental Mirrors",
        category: "Supply",
        quantity: 25,
        minimumThreshold: 30,
        unit: "Piece",
        price: 600,
        description: "Stainless steel front surface examination mirrors."
      },
      {
        name: "Anesthetic Cartridges",
        category: "Medication",
        quantity: 10,
        minimumThreshold: 50,
        unit: "Box",
        price: 2500,
        description: "Lidocaine HCl 2% and Epinephrine local anesthetic. 50 cartridges per box."
      },
      {
        name: "Cotton Rolls",
        category: "Supply",
        quantity: 80,
        minimumThreshold: 40,
        unit: "Box",
        price: 900,
        description: "Highly absorbent dental cotton rolls. 1000 units per pack."
      },
      {
        name: "Dental Masks",
        category: "Supply",
        quantity: 60,
        minimumThreshold: 50,
        unit: "Box",
        price: 1500,
        description: "3-ply surgical masks with high fluid resistance. 50 units per box."
      },
      {
        name: "Syringes",
        category: "Supply",
        quantity: 150,
        minimumThreshold: 100,
        unit: "Piece",
        price: 150,
        description: "Sterile disposable syringes with needles."
      }
    ];

    for (const item of items) {
      const exists = await Inventory.findOne({ name: item.name });
      if (!exists) {
        const newItem = await Inventory.create(item);
        console.log(`🚀 Seeded inventory item: ${newItem.name}`);
        
        // Log restocking transaction
        await InventoryLog.create({
          item: newItem._id,
          type: 'restock',
          quantity: item.quantity,
          notes: 'Seeded initial inventory'
        });
      } else {
        console.log(`⚠️ Item already exists: ${item.name}. Skipping.`);
      }
    }

    console.log("✅ Seeding completed!");
    process.exit();
  } catch (error) {
    console.error("❌ Inventory seeding failed:", error);
    process.exit(1);
  }
};

seedInventory();
