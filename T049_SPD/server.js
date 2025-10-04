import express from "express";
import connectDB from "./app/db/db.js";
import dotenv from "dotenv";
import bootstrap from "./app/components/bootstrap.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

bootstrap(app);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ success: false, message: "Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
