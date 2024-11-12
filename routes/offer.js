const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const isAuthenticated = require("../middleware/isAuthenticated");
const Offer = require("../models/Offer");

const upload = multer();

router.post(
  "/offer/publish",
  isAuthenticated,
  upload.single("picture"),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      if (title.length > 50)
        return res.status(400).json({ message: "Title is too long" });
      if (description.length > 500)
        return res.status(400).json({ message: "Description is too long" });
      if (price > 100000)
        return res.status(400).json({ message: "Price exceeds limit" });

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `/vinted/offers/${req.user._id}`,
      });

      const productDetails = [
        { MARQUE: brand },
        { TAILLE: size },
        { ÉTAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ];

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: productDetails,
        product_image: { secure_url: result.secure_url },
        owner: req.user._id,
      });

      await newOffer.save();

      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;

router.put("/offer/:id", isAuthenticated, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    if (offer.owner.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    const { title, description, price, condition, city, brand, size, color } =
      req.body;

    if (title) offer.product_name = title;
    if (description) offer.product_description = description;
    if (price) offer.product_price = price;

    offer.product_details = [
      { MARQUE: brand || offer.product_details[0].MARQUE },
      { TAILLE: size || offer.product_details[1].TAILLE },
      { ÉTAT: condition || offer.product_details[2].ÉTAT },
      { COULEUR: color || offer.product_details[3].COULEUR },
      { EMPLACEMENT: city || offer.product_details[4].EMPLACEMENT },
    ];

    await offer.save();
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/offer/:id", isAuthenticated, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    if (offer.owner.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    await offer.remove();
    res.json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
