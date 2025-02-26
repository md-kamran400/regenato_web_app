const mongoose = require("mongoose");

// const manufacturingSchema = mongoose.Schema({
//     categoryId:  { type: String, required: true, unique: true },
//     name: String,
//     hours: Number,
//     hourlyrate: Number,
//     totalrate: Number,
//     subCategories: [
//         {
//             subcategoryId: String, //subcategoryId
//             name: String,
//             hours: Number,
//             hourlyRate: Number,
//             totalRate: Number
//         }
//     ]
// });

// const ManufacturingModel = mongoose.model("manufacturing", manufacturingSchema);

// module.exports = ManufacturingModel;

const manufacturingSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: String,
  hours: Number,
  hourlyrate: Number,
  totalrate: Number,
  subCategories: [
    {
      subcategoryId: String, // Machine ID
      name: String,
      hours: Number,
      hourlyRate: Number,
      totalRate: Number,
      isAvailable: { type: Boolean, default: true }, // Track availability
      unavailableUntil: { type: Date, default: null }, // Store until when the machine is occupied
    },
  ],
});

const ManufacturingModel = mongoose.model("manufacturing", manufacturingSchema);

module.exports = ManufacturingModel;
