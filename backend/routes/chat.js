import express from "express";
import { CohereClient } from "cohere-ai";
import { authMiddleware } from "../middleware/auth.js";
import Document from "../models/Document.js";

const router = express.Router();

// Initialize Cohere client
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

// --- STEP 1: Generate 3 Interview Questions ---
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const jdDoc = await Document.findOne({ userId: req.user, type: "jd" });
    if (!jdDoc) return res.status(400).json({ message: "JD not uploaded" });

    const prompt = `Generate 3 concise, realistic interview questions based on this job description:
${jdDoc.text}

Return them as a numbered list (1., 2., 3.) only. Do NOT add any extra headers or explanations.`;

    const response = await cohere.chat({
      model: "command-a-03-2025",
      message: prompt,
      max_tokens: 300,
      temperature: 0.7,
    });

    const questions = response.text
      .split(/\n/)
      .filter((line) => /^\d+\./.test(line))
      .join("\n");

    res.json({ questions });
  } catch (err) {
    console.error("Chat start error:", err);
    res.status(500).json({ message: "Error generating questions" });
  }
});

// --- STEP 2: Evaluate User’s Response ---
router.post("/query", authMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const resumeDoc = await Document.findOne({
      userId: req.user,
      type: "resume",
    });
    if (!resumeDoc)
      return res.status(400).json({ message: "Resume not uploaded" });

    const prompt = `
You are an AI interviewer.
Question: ${question}
Candidate's Answer: ${answer}
Resume: ${resumeDoc.text.substring(0, 3000)}

Evaluate the answer briefly and give:
- Score (1 to 10)
- 3–4 sentence feedback.
Format strictly as:
Score: X/10
Feedback: ...
`;

    const response = await cohere.chat({
      model: "command-a-03-2025",
      message: prompt,
      max_tokens: 250,
      temperature: 0.7,
    });

    const feedback = response.text;
    res.json({ response: feedback });
  } catch (err) {
    console.error("Chat query error:", err);
    res.status(500).json({ message: "Error generating feedback" });
  }
});

export default router;
