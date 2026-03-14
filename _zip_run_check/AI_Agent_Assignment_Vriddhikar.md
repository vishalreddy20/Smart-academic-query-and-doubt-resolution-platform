# AI Workflow and Agent Design Assignment By Dhone Vishal Gowtham Reddy

Role: AI Agent Development Intern  
Organization: Vriddhikar Society (Non-Profit - Transforming Education)

---

## 1) Problem Statement (100-150 words)

Vriddhikar Society receives a high volume of repetitive parent and student emails related to admissions, scholarship eligibility, course schedules, fee deadlines, and document requirements. The internal operations team spends significant time reading similar messages, extracting key intent, drafting near-identical replies, and routing unresolved cases to the correct person. This creates delays, increases response inconsistency, and reduces time available for high-impact support work.

AI automation can reduce this operational load by classifying incoming emails, generating policy-aligned draft responses, and escalating only exception cases to human staff. This improves turnaround time, ensures consistent communication tone, and helps the team focus on complex or sensitive student needs. The result is faster support, better service quality, and improved internal productivity with minimal human intervention.

---

## 2) AI Workflow Design

### Workflow Goal

Automate first-level handling of incoming support emails for admissions and student services.

### Step-by-Step Workflow

1. Trigger: New email received in shared inbox (for example, support at vriddhikar dot org).
2. Data extraction: Automation tool captures sender, subject, message body, and timestamp.
3. AI intent classification: AI labels the email into categories such as Admissions, Scholarship, Fees, Schedule, Documents, or Other.
4. Priority detection: AI flags urgency (High/Medium/Low) based on keywords such as "deadline today", "urgent", "payment failed", and related phrases.
5. Draft generation: AI creates a concise, empathetic, policy-safe reply draft using approved response format.
6. Confidence check:
   - If confidence >= 85% and category is standard, auto-send reply.
   - If confidence < 85% or category is sensitive or unclear, route to human review queue.
7. Logging: Store email metadata, category, confidence, draft text, action taken, and status in Google Sheets.
8. Notification: Send Slack or email alert to operations team only for escalated items.
9. Learning loop: Weekly review of escalated items used to refine prompts and FAQ knowledge base.

### Simple Flow Representation

New Email -> Extract Content -> AI Classify + Prioritize -> Generate Draft  
-> (High Confidence?) Yes -> Auto Reply + Log  
-> No -> Human Review + Edit/Send + Log

---

## 3) Prompt Engineering (Exact Prompts)

### Prompt 1: Intent Classification + Priority

```text
You are an operations assistant for an education non-profit.
Classify the email into exactly one category from this list:
[Admissions, Scholarship, Fees, Schedule, Documents, Other].

Also provide:
- priority: High, Medium, or Low
- confidence score: 0-100
- reason: one short sentence

Rules:
- High priority if the sender mentions deadline within 48 hours, payment issue,
  or inability to attend class due to unresolved admin issue.
- If category is ambiguous, choose Other and reduce confidence.
- Output in valid JSON only.

Email Subject: {{subject}}
Email Body: {{body}}
```

### Prompt 2: Draft Reply Generation

```text
You are writing a reply on behalf of Vriddhikar Society student support.
Write a professional, warm, and concise email reply.

Input:
- Category: {{category}}
- Priority: {{priority}}
- Original Email: {{body}}
- FAQ Context: {{faq_snippets}}

Instructions:
- Acknowledge the user's issue in one sentence.
- Provide a clear action-oriented response in 3-5 bullet points.
- If information is missing, ask maximum 2 clarifying questions.
- Keep total length under 170 words.
- Do not invent policies; use only the given FAQ context.
- End with: "If needed, our team will follow up within 1 business day."

Return format:
Subject: [suggested subject]
Body: [email body]
```

### Prompt 3: Escalation Decision

```text
Given the classification result and draft reply, decide whether this ticket
should be auto-sent or escalated.

Escalate if:
- confidence < 85
- category = Other
- email includes complaint/legal/safety-sensitive language
- reply requires policy not present in FAQ context

Return JSON:
{
  "decision": "auto_send" or "escalate",
  "escalation_reason": "short reason",
  "owner_team": "Admissions|Finance|Academic Ops|Support Lead"
}
```

---

## 4) Sample Input and Output

### Example 1

Input Email:

- Subject: Scholarship form deadline query
- Body: "Hi team, I am applying for the need-based scholarship. I uploaded my marksheet but I am not sure if my income certificate was received. Deadline is tomorrow. Please help urgently."

AI Output (Classification):

```json
{
  "category": "Scholarship",
  "priority": "High",
  "confidence": 94,
  "reason": "Scholarship query with deadline within 24 hours."
}
```

AI Output (Draft Reply):

```text
Subject: Re: Scholarship form deadline query
Body:
Dear Student,

Thank you for reaching out. I understand this is urgent given tomorrow's deadline.

- We have received your marksheet successfully.
- Please re-upload the income certificate using the scholarship portal link shared below.
- After upload, reply to this email with your application ID for verification.
- If upload fails, share a screenshot of the error and we will assist immediately.

If needed, our team will follow up within 1 business day.
```

Escalation Decision:

```json
{
  "decision": "auto_send",
  "escalation_reason": "High confidence and FAQ-supported response",
  "owner_team": "Support Lead"
}
```

### Example 2

Input Email:

- Subject: Wrong fee charged and no refund
- Body: "I was charged twice for term fees and no one has replied for a week. If this is not solved today I will file a formal complaint."

AI Output (Classification):

```json
{
  "category": "Fees",
  "priority": "High",
  "confidence": 88,
  "reason": "Payment issue and complaint language indicate urgency."
}
```

AI Output (Escalation):

```json
{
  "decision": "escalate",
  "escalation_reason": "Complaint-sensitive issue requiring human handling",
  "owner_team": "Finance"
}
```

AI Draft (for human review, not auto-send):

```text
Subject: Re: Wrong fee charged and no refund
Body:
Dear Student,

Thank you for informing us, and I am sorry for the inconvenience caused.

- We have marked your case as urgent for finance review.
- Please share your transaction IDs and payment date/time for quick reconciliation.
- Our finance team will verify duplicate debit status and update you at the earliest.

If needed, our team will follow up within 1 business day.
```

---

## 5) Tools Used

- ChatGPT (prompt testing, classification logic, response drafting)
- Zapier or Make (automation workflow orchestration)
- Gmail shared inbox (trigger source)
- Google Sheets (ticket tracking, logs, analytics)
- Slack or Email notifications (escalation alerts)

---

## 6) Automation Logic (Minimal Human Intervention)

1. Trigger starts automatically whenever a new email arrives in the shared support inbox.
2. Zapier or Make sends subject and body to AI prompts for classification and draft generation.
3. AI returns category, confidence, priority, draft reply, and escalation decision.
4. If decision is `auto_send`, system sends the reply automatically and marks status as `Closed-Auto`.
5. If decision is `escalate`, system creates a review task, assigns owner team, and alerts operations in Slack.
6. Every ticket is logged in Google Sheets with timestamps for reporting and SLA tracking.
7. Weekly report summarizes auto-resolution rate, top query categories, and escalation reasons.

---

## Short Note for Submission Form

Approach:  
I selected a repetitive internal support process (email handling) and designed an AI-first workflow that combines intent classification, draft response generation, and smart escalation. The design prioritizes speed, consistency, and safety through confidence thresholds and human-in-the-loop fallback.

Challenges Faced:  
The biggest challenge was balancing automation with reliability in sensitive cases (fees complaints, legal tone, unclear policy context).

Smart Logic Added:

- Confidence-based auto-send vs human escalation
- Urgency detection based on deadline and payment signals
- JSON-structured outputs for reliable integration with Zapier or Make
- Weekly learning loop to continuously improve prompts and FAQ coverage
