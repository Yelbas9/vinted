const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
  product_name: { type: String, required: true, maxlength: 50 },
  product_description: { type: String, maxlength: 500 },
  product_price: { type: Number, required: true, max: 100000 },
  product_details: Array,
  product_image: Object,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Offer = mongoose.model("Offer", OfferSchema);
module.exports = Offer;
