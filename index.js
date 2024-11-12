require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const userRouter = require("./routes/user");
const offersRoutes = require("./routes/offers");
const cors = require("cors");

const app = express();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB connection error:", error));

app.use(express.json());
app.use(fileUpload());
app.use(cors());

app.use("/user", userRouter);
app.use("/offers", offersRoutes);

app.all("*", (req, res) => {
  return res.status(404).json("Not found");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
