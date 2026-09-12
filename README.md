CRRD  Cyber Risk & Business Risk Management Platform
CRRD (Cyber Risk Register Dashboard) is a production-ready B2B SaaS platform designed to bridge the gap between technical vulnerability management and executive-level business risk. Unlike standard security dashboards, CRRD focuses on quantitative risk scoring, remediation velocity, and strategic advisory.
 Key Modules
 Executive Health Dashboard: Real-time visualization of organizational security posture, featuring risk distribution heatmaps and remediation trend analysis.
 Asset Intelligence: A comprehensive registry for business systems and services with a weighted Criticality Scoring (1-5) system.
 Structured Risk Ledger: A clinical ledger for logging threats using the 5x5 Risk Matrix (Likelihood × Business Impact) to calculate Inherent and Residual risk.
 Remediation Engine: Full-cycle task management to assign owners, track completion, and monitor the reduction of business exposure.
 Intelligence Briefing (Reports): Automated, print-optimized executive summaries designed for board-level stakeholders and compliance audits.
 Strategic Advisory Engine: A context-aware AI assistant powered by Gemini 3.8 Flash that analyzes your real-time risk posture to provide clinical, data-driven remediation advice.
 Tech Stack & Architecture
Frontend: React 19, Vite, Tailwind CSS, Lucide Icons, Recharts.
Backend: Node.js, Express (Full-stack proxy architecture).
Database & Auth: Firebase Firestore (NoSQL) & Firebase Authentication.
AI/ML: Google Gemini 3.8 Flash (Server-side integration).
Interoperability: MCP (Model Context Protocol) enabled for external AI context sharing.
Integrations: Microsoft 365 / Outlook OAuth2 integration.
Enterprise-Grade Security
Multi-Tenancy: Strict Attribute-Based Access Control (ABAC) enforced via Firestore Security Rules.
Audit-Ready: Structured data schema optimized for NIST CSF and ISO 27001 compliance mapping.
Privacy-First AI: All AI interactions are proxied through a secure backend to prevent API key exposure and ensure data governance.
