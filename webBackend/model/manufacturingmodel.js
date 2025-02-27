// const mongoose = require("mongoose");

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

const mongoose = require("mongoose");

const manufacturingSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: String,
  hours: Number,
  hourlyrate: Number,
  totalrate: Number,
  subCategories: [
    {
      subcategoryId: { type: String, required: true }, // Machine ID
      name: { type: String, required: true },
      hours: Number,
      hourlyRate: Number,
      totalRate: Number,
      isAvailable: { type: Boolean, default: true }, // Machine availability
      unavailableUntil: { type: Date, default: null }, // Time until machine is occupied
    },
  ],
});

// Middleware to auto-reset availability when fetching data
manufacturingSchema.pre("find", async function (next) {
  await this.model.updateMany(
    { "subCategories.unavailableUntil": { $lt: new Date() } }, // If time has passed
    {
      $set: {
        "subCategories.$.isAvailable": true,
        "subCategories.$.unavailableUntil": null,
      },
    }
  );
  next();
});

const ManufacturingModel = mongoose.model("manufacturing", manufacturingSchema);

module.exports = ManufacturingModel;
