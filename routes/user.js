require("dotenv").config();

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;

    if (!username)
      return res.status(400).json({ message: "Username is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const salt = uid2(16);
    const hash = CryptoJS.HmacSHA256(password, salt).toString();
    const token = uid2(32);

    const newUser = new User({
      email,
      account: { username },
      newsletter,
      token,
      hash,
      salt,
    });

    if (req.files && req.files.avatar) {
      const avatarFile = req.files.avatar;

      const result = await cloudinary.uploader.upload(avatarFile.tempFilePath, {
        folder: `/vinted/users/${newUser._id}/avatar`,
      });
      newUser.account.avatar = { secure_url: result.secure_url };
    }

    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: {
        username: newUser.account.username,
        avatar: newUser.account.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
