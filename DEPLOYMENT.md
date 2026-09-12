# CRRD Deployment & Scaling Guide

This document outlines the steps required to move the **CRRD Platform** from development to a production-grade environment on **Vercel** and integrate enterprise-grade connections.

---

## 🚀 Vercel Deployment

### 1. Environment Variables
In your Vercel Dashboard (Settings > Environment Variables), you **MUST** add the following keys:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google AI Studio API Key. |
| `FIREBASE_PROJECT_ID` | From your `firebase-applet-config.json`. |
| `FIREBASE_CLIENT_EMAIL` | Firebase Service Account Email (for Admin SDK). |
| `FIREBASE_PRIVATE_KEY` | Firebase Service Account Private Key. |
| `MS_GRAPH_CLIENT_ID` | (Optional) For Outlook/Hotmail integration. |
| `MS_GRAPH_CLIENT_SECRET` | (Optional) For Outlook/Hotmail integration. |

### 2. Custom Domain Setup
1. Go to **Settings > Domains** in Vercel.
2. Enter your domain (e.g., `risk.yourcompany.com`).
3. Vercel will provide **A Records** or **CNAME** records.
4. Update your DNS provider (GoDaddy, Cloudflare, etc.) with these records.
5. SSL (HTTPS) will be automatically provisioned within minutes.

---

## 🔌 Enterprise Connections (Outlook, Hotmail, M365)

To allow companies to connect their communication suites:

1. **Register an App in Microsoft Azure**:
   - Go to [Azure Portal > App Registrations](https://portal.azure.com/).
   - Add a Web Platform with Redirect URI: `https://your-domain.com/auth/microsoft/callback`.
2. **Permissions (Scopes)**:
   - `User.Read` (Profile)
   - `Mail.Read` (To ingest security alerts from Outlook)
   - `Calendars.Read` (To sync remediation deadlines)
3. **Connect in App**:
   - Users go to **Settings > Integrations**.
   - Click "Connect Microsoft 365".
   - The platform uses OAuth2 to securely link their enterprise data.

---

## 🧠 MCP (Model Context Protocol)

The platform is now **MCP-Ready**. MCP allows external AI models (like Claude or other Gemini instances) to securely query your Risk Register.

**How to use MCP:**
- **Endpoint**: `https://your-domain.com/api/mcp`
- **Capability**: It exposes your `Top 5 Risks` and `Asset Criticality` as tools.
- **Security**: Access is protected via Organization API Keys (configurable in Settings).

---

## 🛠️ Production Hardening
- **Firebase Security Rules**: Ensure `firestore.rules` are deployed to block all unauthorized cross-tenant access.
- **API Rate Limiting**: The Express server is configured to handle high concurrency, but consider adding a WAF (Web Application Firewall) if expecting heavy traffic.
