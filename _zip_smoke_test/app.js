const STORAGE_KEY = "vriddhikar_query_logs_v2";

const form = document.getElementById("queryForm");
const emptyState = document.getElementById("emptyState");
const resultCard = document.getElementById("resultCard");
const classificationJson = document.getElementById("classificationJson");
const replyContent = document.getElementById("replyContent");
const decisionJson = document.getElementById("decisionJson");
const chips = document.getElementById("chips");
const historyTableBody = document.getElementById("historyTableBody");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const clearLogsBtn = document.getElementById("clearLogsBtn");
const integrationStatus = document.getElementById("integrationStatus");
const submitButton = form.querySelector("button[type='submit']");

let backendUp = false;
let llmConfigured = false;

function loadLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function localFallbackProcess(data) {
  const text = normalize(`${data.subject} ${data.queryText}`);

  const signals = {
    Scholarship: ["scholarship", "financial aid", "income certificate", "need based"],
    Admissions: ["admission", "apply", "enrollment", "intake", "seat"],
    Fees: ["fee", "payment", "charged", "refund", "transaction", "invoice"],
    Schedule: ["class timing", "schedule", "timetable", "reschedule", "session"],
    Documents: ["document", "marksheet", "certificate", "upload", "verification"],
    Technical: ["portal", "login", "password", "otp", "error", "website"]
  };

  let category = "Other";
  let maxHits = 0;

  Object.entries(signals).forEach(([key, words]) => {
    const hits = words.reduce((acc, w) => (text.includes(w) ? acc + 1 : acc), 0);
    if (hits > maxHits) {
      maxHits = hits;
      category = key;
    }
  });

  const hasUrgency = /(urgent|asap|today|tomorrow|deadline|immediately)/.test(text);
  const hasComplaint = /(complaint|legal|lawsuit|not replied|no response)/.test(text);
  const hasPaymentIssue = /(payment failed|charged twice|double charged|refund)/.test(text);

  let priority = "Low";
  if (hasUrgency || hasPaymentIssue) {
    priority = "High";
  } else if (maxHits > 0) {
    priority = "Medium";
  }

  let confidence = 70;
  if (category !== "Other") confidence += 12;
  if (maxHits >= 2) confidence += 8;
  if (hasComplaint) confidence -= 10;
  confidence = Math.max(48, Math.min(97, confidence));

  const reason =
    category === "Other"
      ? "Query intent appears ambiguous and needs review."
      : `${category} indicators detected with ${priority.toLowerCase()}-to-high urgency signals.`;

  const ownerTeam = ownerTeamForCategory(category);

  const reply = generateReply({ ...data, category, priority });

  const decision = {
    decision:
      confidence < 85 || category === "Other" || hasComplaint || (!data.faqContext.trim() && priority === "High")
        ? "escalate"
        : "auto_send",
    escalation_reason:
      confidence < 85 || category === "Other" || hasComplaint || (!data.faqContext.trim() && priority === "High")
        ? "Low confidence, sensitive tone, or missing policy context requires human review."
        : "High-confidence standard query with safe response.",
    owner_team: ownerTeam,
    reply_word_count: reply.wordCount
  };

  return {
    classification: {
      category,
      priority,
      confidence,
      reason
    },
    reply,
    decision
  };
}

function ownerTeamForCategory(category) {
  switch (category) {
    case "Admissions":
      return "Admissions";
    case "Fees":
      return "Finance";
    case "Schedule":
      return "Academic Ops";
    case "Scholarship":
    case "Documents":
    case "Technical":
      return "Support Lead";
    default:
      return "Support Lead";
  }
}

function generateReply(data) {
  const { studentName, category, priority, faqContext } = data;
  const safeName = studentName || "Student";
  const lines = [];

  lines.push(`Dear ${safeName},`);
  lines.push("");
  lines.push("Thank you for reaching out. I understand your concern and we are here to help.");
  lines.push("");

  if (category === "Scholarship") {
    lines.push("- Please share your application ID so we can verify your scholarship status quickly.");
    lines.push("- Ensure all required documents (income proof, marksheet) are uploaded in the portal.");
    lines.push("- If the deadline is near, we will prioritize your case on urgent basis.");
  } else if (category === "Admissions") {
    lines.push("- Please confirm the program name and intake cycle you are applying for.");
    lines.push("- Verify that your profile and documents are complete in the application portal.");
    lines.push("- Our admissions team will share the next actionable step shortly.");
  } else if (category === "Fees") {
    lines.push("- Please share transaction ID, date, and payment mode for verification.");
    lines.push("- Our finance team will reconcile your payment status and confirm the update.");
    lines.push("- If duplicate charge is detected, refund guidance will be shared promptly.");
  } else if (category === "Schedule") {
    lines.push("- Please mention your class, subject, and current batch/timing.");
    lines.push("- We will check available schedule options and share the suitable update.");
    lines.push("- If this affects attendance, we will mark this query as priority.");
  } else if (category === "Documents") {
    lines.push("- Please list the document name and upload status (uploaded/pending/error).");
    lines.push("- Share screenshot if the portal shows any validation issue.");
    lines.push("- Our support team will verify and guide the correct submission steps.");
  } else if (category === "Technical") {
    lines.push("- Please share screenshot of the portal error and browser/device details.");
    lines.push("- Try clearing cache or using incognito mode once before retrying.");
    lines.push("- Our tech support team will follow up if issue persists.");
  } else {
    lines.push("- Thank you for sharing the details. We are reviewing your query carefully.");
    lines.push("- To help us assist you faster, please include any relevant IDs, dates, or screenshots.");
  }

  if (!faqContext.trim()) {
    lines.push("- For exact policy confirmation, our team may request one additional detail.");
  }

  if (priority === "High") {
    lines.push("- We have marked this as high priority and will process it at the earliest.");
  }

  lines.push("");
  lines.push("If needed, our team will follow up within 1 business day.");

  const subject = `Re: ${data.subject}`;
  const body = lines.join("\n");
  const wordCount = body.split(/\s+/).filter(Boolean).length;

  return {
    subject,
    body,
    wordCount
  };
}

function chipClass(value) {
  if (value === "High" || value === "escalate") return "chip chip-danger";
  if (value === "Medium") return "chip chip-warn";
  return "chip chip-neutral";
}

function renderResult(result, source) {
  emptyState.classList.add("hidden");
  resultCard.classList.remove("hidden");

  classificationJson.textContent = JSON.stringify(result.classification, null, 2);
  replyContent.textContent = `Subject: ${result.reply.subject}\n\n${result.reply.body}`;
  decisionJson.textContent = JSON.stringify(result.decision, null, 2);

  chips.innerHTML = `
    <span class="${chipClass(result.classification.priority)}">Priority: ${result.classification.priority}</span>
    <span class="${chipClass(result.decision.decision)}">Decision: ${result.decision.decision}</span>
    <span class="chip chip-neutral">Category: ${result.classification.category}</span>
    <span class="chip chip-neutral">Confidence: ${result.classification.confidence}</span>
    <span class="chip chip-neutral">Source: ${source}</span>
  `;
}

function renderHistory() {
  const logs = loadLogs();
  historyTableBody.innerHTML = "";

  if (!logs.length) {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:#66756a;">No records yet.</td>
      </tr>
    `;
    return;
  }

  logs
    .slice()
    .reverse()
    .forEach((entry) => {
      const tr = document.createElement("tr");
      appendCell(tr, entry.time);
      appendCell(tr, entry.studentName);
      appendCell(tr, entry.category);
      appendCell(tr, entry.priority);
      appendCell(tr, entry.confidence);
      appendCell(tr, entry.decision);
      historyTableBody.appendChild(tr);
    });
}

function appendCell(row, value) {
  const td = document.createElement("td");
  td.textContent = String(value ?? "");
  row.appendChild(td);
}

function logEntry({ studentName, classification, decision }) {
  const logs = loadLogs();
  logs.push({
    time: new Date().toLocaleString(),
    studentName,
    category: classification.category,
    priority: classification.priority,
    confidence: classification.confidence,
    decision: decision.decision
  });
  saveLogs(logs);
}

function toCsv(rows) {
  const header = ["Time", "Student", "Category", "Priority", "Confidence", "Decision"];
  const body = rows.map((r) => [r.time, r.studentName, r.category, r.priority, r.confidence, r.decision]);
  return [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function setSubmitState(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Processing..." : "Run AI Workflow";
}

async function getBackendHealth() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) throw new Error("Health endpoint unavailable");

    const health = await response.json();
    backendUp = true;
    llmConfigured = Boolean(health.llmConfigured);

    integrationStatus.textContent = llmConfigured
      ? "Backend connected: LLM mode active. Automation webhooks are optional."
      : "Backend connected: fallback mode (set OPENAI_API_KEY for real LLM).";
  } catch {
    backendUp = false;
    llmConfigured = false;
    integrationStatus.textContent = "Backend not running: using browser fallback only.";
  }
}

async function processViaBackend(data) {
  const response = await fetch("/api/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Backend processing failed");
  }

  const payload = await response.json();
  return {
    source: payload.source || "backend",
    result: payload.result
  };
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    studentName: form.studentName.value.trim(),
    email: form.email.value.trim(),
    subject: form.subject.value.trim(),
    queryText: form.queryText.value.trim(),
    faqContext: form.faqContext.value.trim()
  };

  let source = "browser-fallback";
  let result;

  setSubmitState(true);

  try {
    if (backendUp) {
      const apiOutput = await processViaBackend(data);
      source = apiOutput.source === "llm" ? "llm-api" : "server-fallback";
      result = apiOutput.result;
    } else {
      result = localFallbackProcess(data);
    }
  } catch {
    result = localFallbackProcess(data);
    source = "browser-fallback";
  } finally {
    setSubmitState(false);
  }

  renderResult(result, source);
  logEntry({ studentName: data.studentName, classification: result.classification, decision: result.decision });
  renderHistory();
});

exportCsvBtn.addEventListener("click", () => {
  const logs = loadLogs();
  if (!logs.length) return;

  const blob = new Blob([toCsv(logs)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "query_workflow_log.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

clearLogsBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
});

renderHistory();
void getBackendHealth();
