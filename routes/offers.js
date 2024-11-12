const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page = 1 } = req.query;

    const filters = {};
    if (title) filters.product_name = new RegExp(title, "i");
    if (priceMin) filters.product_price = { $gte: Number(priceMin) };
    if (priceMax)
      filters.product_price = {
        ...filters.product_price,
        $lte: Number(priceMax),
      };

    const sortOption = {};
    if (sort === "price-desc") sortOption.product_price = -1;
    if (sort === "price-asc") sortOption.product_price = 1;

    const limit = 10;
    const skip = (page - 1) * limit;

    const offers = await Offer.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "owner",
        select: "account.username account.avatar",
      });

    const count = await Offer.countDocuments(filters);

    res.status(200).json({ count, offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    const offerId = req.params.id;

    const offer = await Offer.findById(offerId).populate({
      path: "owner",
      select: "account.username account.avatar",
    });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
