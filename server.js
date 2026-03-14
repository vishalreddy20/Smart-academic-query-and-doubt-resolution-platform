const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    llmConfigured: Boolean(process.env.OPENAI_API_KEY),
    automationWebhookConfigured: Boolean(process.env.AUTOMATION_WEBHOOK_URL),
    sheetsWebhookConfigured: Boolean(process.env.SHEETS_WEBHOOK_URL)
  });
});

app.post("/api/process", async (req, res) => {
  const payload = req.body || {};

  const requiredFields = ["studentName", "email", "subject", "queryText"];
  const missing = requiredFields.filter((field) => !payload[field] || !String(payload[field]).trim());
  if (missing.length) {
    return res.status(400).json({
      ok: false,
      error: `Missing required fields: ${missing.join(", ")}`
    });
  }

  if (!isValidEmail(payload.email)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid email format"
    });
  }

  if (String(payload.subject).length > 240 || String(payload.queryText).length > 10000) {
    return res.status(400).json({
      ok: false,
      error: "Input too long. Keep subject <= 240 and queryText <= 10000 characters"
    });
  }

  let result;
  let source = "fallback";

  try {
    if (process.env.OPENAI_API_KEY) {
      result = await processWithOpenAI(payload);
      source = "llm";
    } else {
      result = processWithFallback(payload);
    }
  } catch (err) {
    result = processWithFallback(payload);
    result.error = `LLM unavailable, used fallback: ${err.message}`;
  }

  const eventData = {
    timestamp: new Date().toISOString(),
    source,
    input: {
      studentName: payload.studentName,
      email: payload.email,
      subject: payload.subject,
      queryText: payload.queryText,
      faqContext: payload.faqContext || ""
    },
    output: result
  };

  void postWebhook(process.env.AUTOMATION_WEBHOOK_URL, eventData);
  void postWebhook(process.env.SHEETS_WEBHOOK_URL, eventData);

  res.json({
    ok: true,
    source,
    result
  });
});

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      ok: false,
      error: "Request payload too large. Max request size is 1MB"
    });
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      ok: false,
      error: "Malformed JSON payload"
    });
  }

  console.error("Unhandled server error:", err);
  return res.status(500).json({
    ok: false,
    error: "Internal server error"
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

async function processWithOpenAI(payload) {
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const prompt = buildPrompt(payload);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an education support automation assistant. Return strictly valid JSON. Never include markdown code fences."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error("OpenAI response did not include message content");
  }

  const parsed = safeJsonParse(raw);
  if (!parsed) {
    throw new Error("Could not parse JSON output from LLM");
  }

  return sanitizeResult(parsed, payload);
}

function buildPrompt(payload) {
  return `
Task: Process one student support query for an education NGO.

Input:
- studentName: ${payload.studentName}
- email: ${payload.email}
- subject: ${payload.subject}
- queryText: ${payload.queryText}
- faqContext: ${payload.faqContext || ""}

Instructions:
1) Classify into exactly one category:
Admissions, Scholarship, Fees, Schedule, Documents, Technical, Other.
2) Set priority: High | Medium | Low.
3) Set confidence: integer 0-100.
4) Provide one-line reason.
5) Draft a reply:
   - warm, professional, concise
   - max 170 words
   - include 3-5 action bullets
   - do not invent policy details
   - end with: "If needed, our team will follow up within 1 business day."
6) Escalation rule:
   escalate if confidence < 85 OR category is Other OR sensitive complaint/legal tone OR missing policy context for high-stakes answer.
7) ownerTeam mapping:
   Admissions->Admissions, Fees->Finance, Schedule->Academic Ops, Scholarship/Documents/Technical/Other->Support Lead.

Output strictly as valid JSON with this shape:
{
  "classification": {
    "category": "...",
    "priority": "...",
    "confidence": 0,
    "reason": "..."
  },
  "reply": {
    "subject": "Re: ...",
    "body": "..."
  },
  "decision": {
    "decision": "auto_send|escalate",
    "escalation_reason": "...",
    "owner_team": "..."
  }
}
`.trim();
}

function safeJsonParse(value) {
  const direct = tryParse(value);
  if (direct) return direct;

  const extracted = value.match(/\{[\s\S]*\}/);
  if (!extracted) return null;
  return tryParse(extracted[0]);
}

function tryParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function sanitizeResult(candidate, payload) {
  const categoryList = ["Admissions", "Scholarship", "Fees", "Schedule", "Documents", "Technical", "Other"];
  const priorityList = ["High", "Medium", "Low"];

  const rawCategory = candidate?.classification?.category;
  const rawPriority = candidate?.classification?.priority;
  const category = categoryList.includes(rawCategory) ? rawCategory : "Other";
  const priority = priorityList.includes(rawPriority) ? rawPriority : "Medium";

  const confidenceNum = Number(candidate?.classification?.confidence);
  const confidence = Number.isFinite(confidenceNum)
    ? Math.max(0, Math.min(100, Math.round(confidenceNum)))
    : 70;

  const reason = String(candidate?.classification?.reason || "Model-generated classification").slice(0, 200);

  const replySubject = String(candidate?.reply?.subject || `Re: ${payload.subject}`).slice(0, 180);
  const replyBody = String(candidate?.reply?.body || "Thank you for reaching out. We will review and follow up.").trim();

  const modelDecision = candidate?.decision?.decision === "escalate" ? "escalate" : "auto_send";
  const modelReason = String(
    candidate?.decision?.escalation_reason || "Decision generated by model-based workflow"
  ).slice(0, 220);

  const ownerTeam = mapOwnerTeam(category);
  const guardedDecision = applyGuardrails({
    modelDecision,
    modelReason,
    category,
    confidence,
    priority,
    subject: payload.subject,
    queryText: payload.queryText,
    faqContext: payload.faqContext || ""
  });

  return {
    classification: {
      category,
      priority,
      confidence,
      reason
    },
    reply: {
      subject: replySubject,
      body: replyBody,
      wordCount: replyBody.split(/\s+/).filter(Boolean).length
    },
    decision: {
      decision: guardedDecision.decision,
      escalation_reason: guardedDecision.reason,
      owner_team: ownerTeam
    }
  };
}

function mapOwnerTeam(category) {
  switch (category) {
    case "Admissions":
      return "Admissions";
    case "Fees":
      return "Finance";
    case "Schedule":
      return "Academic Ops";
    default:
      return "Support Lead";
  }
}

function processWithFallback(payload) {
  const text = `${payload.subject} ${payload.queryText}`.toLowerCase();

  const keywords = {
    Scholarship: ["scholarship", "financial aid", "income certificate"],
    Admissions: ["admission", "apply", "enrollment", "seat"],
    Fees: ["fee", "payment", "refund", "charged", "transaction"],
    Schedule: ["schedule", "timetable", "class timing", "reschedule"],
    Documents: ["document", "certificate", "marksheet", "upload"],
    Technical: ["portal", "login", "password", "error", "otp"]
  };

  let category = "Other";
  let hits = 0;

  Object.entries(keywords).forEach(([candidate, words]) => {
    const matchCount = words.reduce((sum, word) => (text.includes(word) ? sum + 1 : sum), 0);
    if (matchCount > hits) {
      hits = matchCount;
      category = candidate;
    }
  });

  const urgent = /(urgent|today|tomorrow|deadline|asap|immediately)/.test(text);
  const complaint = /(complaint|legal|lawsuit|no response|not replied)/.test(text);

  const priority = urgent ? "High" : hits > 0 ? "Medium" : "Low";
  const confidence = Math.max(50, Math.min(95, 68 + (hits > 0 ? 16 : 0) + (urgent ? 8 : 0) - (complaint ? 12 : 0)));

  const replyLines = [
    `Dear ${payload.studentName},`,
    "",
    "Thank you for reaching out. We have received your query and are here to support you.",
    "",
    "- We are reviewing your request based on the details shared.",
    "- Please share any relevant application ID, transaction ID, or screenshots for faster resolution.",
    "- Our team will route this to the right support owner.",
    "",
    "If needed, our team will follow up within 1 business day."
  ];

  const guarded = applyGuardrails({
    modelDecision: "auto_send",
    modelReason: "Fallback decision",
    category,
    confidence,
    priority,
    subject: payload.subject,
    queryText: payload.queryText,
    faqContext: payload.faqContext || ""
  });

  return {
    classification: {
      category,
      priority,
      confidence,
      reason:
        category === "Other"
          ? "Intent unclear; requires human validation."
          : `${category} intent detected with rule-based analysis.`
    },
    reply: {
      subject: `Re: ${payload.subject}`,
      body: replyLines.join("\n"),
      wordCount: replyLines.join(" ").split(/\s+/).filter(Boolean).length
    },
    decision: {
      decision: guarded.decision,
      escalation_reason: guarded.reason,
      owner_team: mapOwnerTeam(category)
    }
  };
}

function applyGuardrails({
  modelDecision,
  modelReason,
  category,
  confidence,
  priority,
  subject,
  queryText,
  faqContext
}) {
  const text = `${subject} ${queryText}`.toLowerCase();
  const sensitive = /(complaint|legal|lawsuit|harass|threat|abuse|unsafe|violence)/.test(text);
  const mustEscalate =
    confidence < 85 ||
    category === "Other" ||
    sensitive ||
    (!faqContext.trim() && priority === "High");

  if (mustEscalate) {
    return {
      decision: "escalate",
      reason: "Guardrail triggered: low confidence, sensitive content, ambiguous intent, or missing policy context."
    };
  }

  return {
    decision: modelDecision,
    reason: modelReason || "Model decision accepted"
  };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

async function postWebhook(url, payload) {
  if (!url) return;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const message = await response.text();
      console.warn(`Webhook failed (${url}):`, response.status, message);
    }
  } catch (err) {
    console.warn(`Webhook call error (${url}):`, err.message);
  }
}
