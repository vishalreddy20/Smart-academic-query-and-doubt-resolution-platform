# RMMM (Risk Mitigation, Monitoring, and Management) Plan

This plan details the risk management strategy for the MERN project (SmartDoubt), categorized using standard risk management frameworks to ensure smooth development, deployment, and operation.

---

## Step 1: Forming a Risk Table

| RISK ID | RISKS | CATEGORY | PROBABILITY | IMPACT | RMMM |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | AI API integration complexity causing schedule delays | TE | 75% | 2 | Add buffer time for AI testing, implement robust fallback mechanisms, monitor API dependency. |
| **2** | Unplanned requirement changes for core tutoring features | PS | 60% | 2 | Implement strict change control process, freeze core requirements, review scope impact before approval. |
| **3** | Slower than expected database queries with large chat histories | TE | 50% | 2 | Implement database indexing, use query optimization, and perform load testing early in development. |
| **4** | Cloud hosting or deployment configuration failures (Vercel/Railway) | DE | 40% | 3 | Follow comprehensive deployment checklists, use staging environments, monitor server logs actively. |
| **5** | Lack of required skills for advanced responsive UI techniques | ST | 30% | 3 | Provide Tailwind/React training resources, assign complex UI to experienced members, conduct peer reviews. |

---

## Step 2: Sorted Risks (Descending Order of Probability)

| RISK ID | RISKS | CATEGORY | PROBABILITY | IMPACT | RMMM |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | AI API integration complexity causing schedule delays | TE | 75% | 2 | Add buffer time for AI testing, implement robust fallback mechanisms, monitor API dependency. |
| **2** | Unplanned requirement changes for core tutoring features | PS | 60% | 2 | Implement strict change control process, freeze core requirements, review scope impact before approval. |
| **3** | Slower than expected database queries with large chat histories | TE | 50% | 2 | Implement database indexing, use query optimization, and perform load testing early in development. |
| **4** | Cloud hosting or deployment configuration failures (Vercel/Railway) | DE | 40% | 3 | Follow comprehensive deployment checklists, use staging environments, monitor server logs actively. |
| **5** | Lack of required skills for advanced responsive UI techniques | ST | 30% | 3 | Provide Tailwind/React training resources, assign complex UI to experienced members, conduct peer reviews. |

---

## Step 3: Risk Information Sheets (RIS)

### Risk Information Sheet (RIS) for Risk ID: 1
**Risk ID:** 1  |  **Date:** 15/04/2026  |  **Probability:** 75%  |  **Impact:** 2

* **Description:** AI API integration complexity causing schedule delays for the doubt resolution feature.
* **Refinement & Context:** 
  * Sub condition 1: Unpredictable API rate limits and throttling during intensive testing.
  * Sub condition 2: Parsing robust and complex streaming data from the LLM takes more time than estimated.
  * Sub condition 3: Need for elaborate fallback UI elements when the AI service is unreachable.
* **Mitigation & Monitoring Strategies:**
  1. Mock API responses during early development to unblock frontend work.
  2. Start API integration in sprint 1 to identify hurdles immediately.
  3. Monitor API response times and failure rates via continuous integration tests.
  4. Track time spent specifically on LLM connectivity in weekly status meetings.
* **Contingency Plan and Management:**
  1. Revise project schedule to allocate more time to the backend team.
  2. Degrade gracefully to a simpler, non-streaming text model if streaming is too unstable.
  3. Reallocate senior engineering resources to unblock AI connection issues.
* **Trigger:** When early API integration tasks exceed their estimated time by more than 20% or if consistent timeouts are observed.
* **Status:** Mitigation actions initiated (Monitoring in progress)
* **Assigned To:** Lead Backend Developer | **Originator:** Risk Management Team

---

### Risk Information Sheet (RIS) for Risk ID: 2
**Risk ID:** 2  |  **Date:** 15/04/2026  |  **Probability:** 60%  |  **Impact:** 2

* **Description:** Unplanned requirement changes for core tutoring features, causing scope creep.
* **Refinement & Context:** 
  * Sub condition 1: Stakeholders requesting additional roles, such as admin dashboards or supervisor modes not originally planned.
  * Sub condition 2: Feature "polishing" iterations expanding into full functional pivots.
* **Mitigation & Monitoring Strategies:**
  1. Secure formal sign-off on the Business Requirements Document (BRD) early.
  2. Implement a strict Change Request (CR) workflow for any new features.
  3. Monitor feature scope in every sprint planning session.
* **Contingency Plan and Management:**
  1. Add newly requested features to a "v2.0 / Post-MVP" backlog.
  2. Clearly communicate the schedule and cost impact of accommodating mid-cycle changes.
  3. Re-negotiate deadlines if critical changes are approved by stakeholders.
* **Trigger:** Stakeholders or clients request a feature that does not exist in the approved use-case diagram or sprint backlog.
* **Status:** Mitigation actions initiated (Scope documented and baseline set)
* **Assigned To:** Product Owner / Project Manager | **Originator:** Risk Management Team

---

### Risk Information Sheet (RIS) for Risk ID: 3
**Risk ID:** 3  |  **Date:** 15/04/2026  |  **Probability:** 50%  |  **Impact:** 2

* **Description:** Slower than expected database queries with large chat histories affecting platform performance.
* **Refinement & Context:** 
  * Sub condition 1: Inefficient MongoDB aggregation pipelines causing memory load.
  * Sub condition 2: Lack of proper indexing on frequently queried fields like `userId` or `sessionId`.
* **Mitigation & Monitoring Strategies:**
  1. Implement and enforce database schema reviews before pushing to production.
  2. Add compound indexes on high-traffic document attributes early on.
  3. Monitor query execution times using MongoDB Atlas built-in profiler tools.
* **Contingency Plan and Management:**
  1. Implement application-level caching (e.g., Redis) to offload the database.
  2. Implement data pagination and lazy-loading for historical chat data.
  3. Upgrade cloud database tier temporarily to handle load while optimizing code.
* **Trigger:** Development or staging environments report DB query times exceeding 300ms for standard fetches.
* **Status:** Mitigation actions planned (Indexing guidelines defined)
* **Assigned To:** Database Administrator / Backend Team | **Originator:** Risk Management Team

---

### Risk Information Sheet (RIS) for Risk ID: 4
**Risk ID:** 4  |  **Date:** 15/04/2026  |  **Probability:** 40%  |  **Impact:** 3

* **Description:** Cloud hosting or deployment configuration failures (Vercel/Railway) preventing successful release.
* **Refinement & Context:** 
  * Sub condition 1: Environment variables not correctly synced between local, preview, and production environments.
  * Sub condition 2: Unforeseen CORS policy blocks between decoupled frontend (Vercel) and backend (Railway).
* **Mitigation & Monitoring Strategies:**
  1. Maintain a shared, secure deployment checklist document.
  2. Create staging environments early to mimic production behavior continuously.
  3. Monitor server deployment logs and configure webhook alerts for failed builds.
* **Contingency Plan and Management:**
  1. Roll back to the last stable deployment commit instantly.
  2. Temporarily test backend via alternative services (e.g., Render/Heroku) if Railway experiences an outage.
  3. Escalate to cloud provider support as a priority.
* **Trigger:** A pushed commit fails the CI/CD pipeline or results in HTTP 500/405 errors on the live URLs.
* **Status:** Mitigation actions initiated (CI/CD pipeline and staging established)
* **Assigned To:** DevOps / Full Stack Developer | **Originator:** Risk Management Team

---

### Risk Information Sheet (RIS) for Risk ID: 5
**Risk ID:** 5  |  **Date:** 15/04/2026  |  **Probability:** 30%  |  **Impact:** 3

* **Description:** Lack of required skills for advanced responsive UI techniques and animation implementation.
* **Refinement & Context:** 
  * Sub condition 1: Team members are familiar with basic React but lack experience with advanced framer motion or complex Tailwind component scaling.
  * Sub condition 2: Time lost to extensive bug-fixing on mobile device views.
* **Mitigation & Monitoring Strategies:**
  1. Share relevant tutorials and documentation for specific tech stacks (Tailwind, Framer Motion) at kickoff.
  2. Assign complex, dynamic UI components to the most experienced frontend engineers.
  3. Monitor UI bug reports in testing phases to catch skill-gap issues early.
* **Contingency Plan and Management:**
  1. Simplify the design requirements (e.g., replace complex animations with basic css transitions).
  2. Organize a pair-programming session to unblock team members struggling with UI tasks.
  3. Utilize open-source component libraries to speed up development.
* **Trigger:** UI tasks take considerably longer than estimated, or numerous layout bugs are reported on smaller screens.
* **Status:** Mitigation actions planned (Resource sharing and task assignments under review)
* **Assigned To:** Lead Frontend Developer | **Originator:** Risk Management Team
