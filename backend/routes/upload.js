import express from "express";
import multer from "multer";
import fs from "fs";
import { createRequire } from "module";
import { authMiddleware } from "../middleware/auth.js";
import Document from "../models/Document.js";
import cloudinary from "../config/cloudinary.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { type } = req.body;
    if (!["resume", "jd"].includes(type))
      return res.status(400).json({ message: "Invalid type" });

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text.substring(0, 10000);

    // Upload file in cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "upivot_assignment",
    });

    const doc = await Document.create({
      userId: req.user,
      type,
      fileUrl: uploadResult.secure_url,
      text: extractedText,
    });

    fs.unlinkSync(req.file.path);
    res.json({ message: "File uploaded", document: doc });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
