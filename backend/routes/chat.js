import express from "express";
import { CohereClient } from "cohere-ai";
import { authMiddleware } from "../middleware/auth.js";
import Document from "../models/Document.js";

const router = express.Router();

// Initialize Cohere client
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

// --- STEP 1: Generate 3 High-Impact Interview Questions ---
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const jdDoc = await Document.findOne({ userId: req.user, type: "jd" }).sort(
      {
        createdAt: -1,
      },
    );
    if (!jdDoc) return res.status(400).json({ message: "JD not uploaded" });

    // Use current timestamp as a randomness seed
    const sessionSeed = Date.now().toString().slice(-6);

    const prompt = `
    You are a Master Interviewer at a top-tier tech firm. [Context Seed: ${sessionSeed}]
    JD Analysis: "${jdDoc.text}"

    Generate 3 distinct, high-impact interview questions targeting unique technical, behavioral, and strategic competencies from the JD. 

    - DIVERSITY RULE: Use the [Context Seed] to ensure you focus on a different subset of skills from the JD for every session. Avoid the most "obvious" requirements.
    
    - STRICT FORMATTING RULE: Return ONLY the raw question text as a numbered list (1., 2., 3.). No category headers, no labels, and no bolding (**).
    `;

    const response = await cohere.chat({
      model: "command-a-03-2025",
      message: prompt,
      max_tokens: 500,
      temperature: 0.9,
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

// --- STEP 2: Professional Grade Evaluation Rubric  ---
router.post("/query", authMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;

    // --- Hardcoded Word Count Check ---
    const wordCount = answer.trim().split(/\s+/).length;
    if (wordCount < 10) {
      return res.json({
        response: `Score: 1/10
Feedback: Your response is too brief for a professional evaluation. A strong answer should provide specific context, actions you took, and the end result of your situation.`,
      });
    }

    const resumeDoc = await Document.findOne({
      userId: req.user,
      type: "resume",
    }).sort({ createdAt: -1 });
    if (!resumeDoc)
      return res.status(400).json({ message: "Resume not uploaded" });

    const prompt = `
    Analyze this interview response with high rigor. 
    Question: "${question}"
    Candidate's Answer: "${answer}"
    Identity Reference (Resume): "${resumeDoc.text.substring(0, 3000)}"

    - CORE RULES -
    1. STRICTNESS: Only award points for what the candidate SAID in their ANSWER. Do NOT credit them for resume skills not explicitly mentioned now.
    2. RUBRIC: 
       - 1-3: Sub-professional, vague, or content-free.
       - 4-6: Addresses the prompt but lacks technical "How" or measurable results.
       - 7-10: Evidence-based response with clear actions and impact.

    Format as:
    Score: X/10
    Feedback: (3-4 concise, professional sentences).
    `;

    const response = await cohere.chat({
      model: "command-a-03-2025",
      message: prompt,
      max_tokens: 300,
      temperature: 0.5,
    });

    const feedback = response.text;
    res.json({ response: feedback });
  } catch (err) {
    console.error("Chat query error:", err);
    res.status(500).json({ message: "Error generating feedback" });
  }
});

export default router;
