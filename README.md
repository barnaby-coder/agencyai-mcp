# Agency AI MCP Server

AI-powered commerce server for Agency AI Operations consulting services. This MCP (Model Context Protocol) server exposes tools that allow AI assistants to recommend services, assess AI readiness, and book consultations with Agency AI.

---

## 🎯 What This Is

The Agency AI MCP Server is a **digital sales agent** that AI assistants (like Claude Desktop, Claude.ai, and other MCP-compatible clients) can call to:

1. **Recommend services** based on client industry, size, and pain points
2. **Assess AI readiness** with scoring, gap analysis, and pricing estimates
3. **Book consultations** with automated scheduling and pre-call questionnaires

**Live Demo:** https://agencyai-mcp.up.railway.app

**GitHub:** https://github.com/barnaby-coder/agencyai-mcp

---

## 🚀 Why MCP Matters

**Without MCP:**
- Users manually visit agencyai.me
- Fill out contact forms
- Wait for human response
- No AI-assisted discovery

**With MCP:**
- AI assistants directly access Agency AI's service catalog
- Instant recommendations based on client context
- Automated readiness assessments
- One-click consultation booking
- Seamless AI-to-AI handoff

---

## 📋 Available Tools

### 1. `get_service_offerings`

Returns recommended AI operations services based on client profile.

**Input:**
- `industry` (optional): Client's industry (healthcare, finance, professional_services, real_estate, insurance_brokerages, construction_trades)
- `company_size` (optional): Number of employees
- `pain_points` (optional): Array of current challenges (manual_data_entry, email_overload, no_decision_tracking, lost_knowledge, no_knowledge_base)

**Output:**
- Array of recommended services with:
  - Service name and description
  - Target revenue and delivery time
  - Target company size and industries
  - Included features
  - Fit reasoning (why this service matches their needs)

**Example Call:**
```
Claude: "Can you show me Agency AI's services for a healthcare company with 50 employees struggling with email overload?"

MCP Response:
{
  "recommended_packages": [
    {
      "id": "automated_workflows",
      "name": "Automated Workflows",
      "target_revenue": "$25K-$75K",
      "delivery_time": "4-6 weeks",
      "fits_reason": "Automated Workflows includes email triage - directly addresses email overwhelm"
    }
  ]
}
```

---

### 2. `assess_ai_readiness`

Calculates client's AI readiness score with gap analysis and pricing.

**Input:**
- `industry`: Client's industry
- `employee_count`: Number of employees
- `current_tools` (optional): Current tools (salesforce, hubspot, gmail, slack, notion, etc.)
- `pain_points` (optional): Current challenges

**Output:**
- Readiness score (0-100)
- Recommended package (automated_workflows or custom_ai_second_brain)
- Gap analysis (what's missing)
- Implementation roadmap
- Pricing estimate

**Example Call:**
```
Claude: "Assess AI readiness for a healthcare company with 50 employees using Salesforce, Gmail, and Slack"

MCP Response:
{
  "readiness_score": 40,
  "recommended_package": "custom_ai_second_brain",
  "gap_analysis": [
    "No CRM integration (AI can't access customer context)",
    "Email not integrated (manual email triage)",
    "Decision tracking missing (no organizational memory)"
  ],
  "implementation_roadmap": "Phase 1: Knowledge layer (4 weeks), Phase 2: System integrations (4 weeks), Phase 3: Custom tools (4 weeks)",
  "pricing_estimate": "$150K-$180K"
}
```

---

### 3. `book_consultation`

Books a consultation meeting with Agency AI.

**Input:**
- `service_package`: Service package (automated_workflows or custom_ai_second_brain)
- `contact_name`: Contact person name
- `contact_email`: Contact email
- `company_name` (optional): Company name
- `preferred_times` (optional): Array of preferred meeting times
- `industry` (optional): Industry
- `employee_count` (optional): Employee count

**Output:**
- Booking ID
- Confirmed meeting time
- Meeting link
- Pre-call questionnaire link
- Next steps

**Example Call:**
```
Claude: "Book an Automated Workflows consultation for Dr. Sarah Johnson at sarah@healthtech.com, company Health Tech Solutions"

MCP Response:
{
  "booking_id": "BOOK-1774401284456",
  "confirmed_time": "2026-03-26 10am",
  "meeting_link": "https://agencyai.me/consultation/BOOK-1774401284456",
  "pre_call_questionnaire": "https://agencyai.me/questionnaire/BOOK-1774401284456",
  "next_steps": [
    "Calendar invite sent to your email",
    "Complete pre-call questionnaire before meeting",
    "Prepare questions about AI operations"
  ]
}
```

---

## 🔧 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Assistant                            │
│              (Claude Desktop / Claude.ai)                   │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ MCP Protocol
                     │
┌────────────────────▼──────────────────────────────────────┐
│              Agency AI MCP Server                          │
│        (https://agencyai-mcp.up.railway.app)              │
├─────────────────────────────────────────────────────────────┤
│  Tools:                                                   │
│  • get_service_offerings                                  │
│  • assess_ai_readiness                                     │
│  • book_consultation                                      │
├─────────────────────────────────────────────────────────────┤
│  Data Sources:                                             │
│  • services.json (service definitions)                     │
│  • Tool handlers (business logic)                         │
│  • [Future] Database (bookings, calendar, email)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
agencyai-mcp/
├── src/
│   ├── server-http.ts          # Express HTTP/SSE server
│   └── tools/
│       ├── get-services.ts     # get_service_offerings handler
│       ├── assess-readiness.ts # assess_ai_readiness handler
│       └── book-consultation.ts # book_consultation handler
├── data/
│   └── services.json          # Service definitions (static)
├── api/                       # HTTP API (for direct REST access)
├── test-tools.js              # Test script for 3 tools
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### For AI Assistant Users

1. **Add MCP Server to Claude Desktop:**
   ```json
   {
     "mcpServers": {
       "agencyai-mcp": {
         "url": "https://agencyai-mcp.up.railway.app/sse"
       }
     }
   }
   ```

2. **Start using:**
   - Ask Claude: "Show me Agency AI's services for a healthcare company"
   - Ask Claude: "Assess AI readiness for my 50-person finance firm"
   - Ask Claude: "Book a consultation with Agency AI"

### For Developers

```bash
# Clone repository
git clone https://github.com/barnaby-coder/agencyai-mcp.git
cd agencyai-mcp

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start

# Run tests
node test-tools.js
```

---

## 🧪 Testing

```bash
# Run all 3 tools
node test-tools.js
```

Expected output:
```
✅ Connected to MCP server
📋 Found 3 tools

TEST 1: get_service_offerings ✅
TEST 2: assess_ai_readiness ✅
TEST 3: book_consultation ✅

All tests completed successfully!
```

---

## 📊 Client Journey Examples

### Journey 1: The Discovery Flow

**User:** "I run a healthcare company with 50 employees. We're drowning in email and losing track of decisions."

**Claude:**
1. Calls `get_service_offerings` with industry=healthcare, company_size=50, pain_points=[email_overload, no_decision_tracking]
2. Returns: Automated Workflows ($25K-$75K, 4-6 weeks) with email triage and decision logging
3. User: "How ready are we for AI?"
4. Calls `assess_ai_readiness` with current_tools=[gmail, slack, salesforce]
5. Returns: Score 40/100, gaps identified, pricing estimate
6. User: "Book a consultation"
7. Calls `book_consultation`
8. Returns: Booking confirmation with meeting link

**Result:** From problem to booked consultation in < 5 minutes, without leaving Claude.

---

### Journey 2: The Expert Flow

**User:** "I'm evaluating AI vendors for my 100-person insurance brokerage. We use Salesforce and Slack."

**Claude:**
1. Calls `get_service_offerings` for insurance_brokerages, company_size=100
2. Returns: Custom AI Second Brain ($180K-$220K, 8-12 weeks)
3. User: "Show me why this is the right package"
4. Calls `assess_ai_readiness` with current_tools=[salesforce, slack]
5. Returns: Readiness score 65, gap analysis showing CRM/email integration needed
6. User: "What would implementation look like?"
7. Returns: Detailed 3-phase roadmap with timelines
8. User: "Let's talk"
9. Calls `book_consultation`
10. Returns: Booking with pre-call questionnaire sent

**Result:** Expert-level evaluation with AI-driven insights, no sales calls needed.

---

### Journey 3: The Bootcamp Flow

**User:** "I saw the AI Companion Bootcamp on agencyai.me. Is this right for me?"

**Claude:**
1. Calls `get_service_offerings` for professional_services, company_size=5
2. Returns: Automated Workflows ($25K-$35K) for smaller companies
3. User: "Actually, I want to build my own AI assistant"
4. Claude: "The AI Companion Bootcamp might be better. Let me explain..."
5. [Claude navigates to agencyai.me/bootcamp.html and explains the offering]
6. User: "Book me for the bootcamp"
7. Calls `book_consultation` with service_package=automated_workflows (bootcamp variant)
8. Returns: Booking confirmation

**Result:** Cross-sell from consulting services to bootcamp, all via AI.

---

## 💡 Business Value for Agency AI

### Before MCP
- Users visit website manually
- Fill out contact form
- Wait 24-48 hours for response
- Sales team qualifies leads
- Multiple emails to book meeting

### After MCP
- AI assistants access services directly
- Instant recommendations based on context
- Automated readiness assessments
- One-click booking with calendar integration
- Pre-qualified leads with full context

**Conversion Impact:**
- 10x faster time-to-booking
- Higher-quality leads (pre-qualified)
- Reduced sales team workload
- AI-driven upsell and cross-sell

---

## 🔮 Future Roadmap

### Phase 1: Production Booking (Immediate)
- [ ] Database integration (Supabase)
- [ ] Real calendar integration (Nylas/Google Calendar)
- [ ] Email service integration (SendGrid/Postmark)
- [ ] Real meeting links (Google Meet/Zoom)

### Phase 2: Enhanced Intelligence
- [ ] Dynamic pricing based on complexity
- [ ] Case study matching (show similar client results)
- [ ] ROI calculator integration
- [ ] Interactive roadmap visualization

### Phase 3: Full Automation
- [ ] Automated follow-up sequences
- [ ] Contract generation and e-signature
- [ ] Onboarding flow automation
- [ ] Client portal integration

---

## 🔗 Integration with agencyai.me

The MCP server is the **backend API** for the AI-powered features on agencyai.me:

1. **Homepage (agencyai.me/):**
   - AI assistant can recommend services based on site content
   - MCP provides detailed service specs and pricing

2. **Bootcamp (agencyai.me/bootcamp.html):**
   - AI assistant can assess if bootcamp is right fit
   - MCP provides alternative service recommendations

3. **Insights (agencyai.me/insights.html):**
   - AI assistant can reference thought leadership
   - MCP services back up insights with practical offerings

**Future Integration:**
- Live chat on agencyai.me powered by MCP server
- AI advisor widget with real-time service recommendations
- Interactive AI readiness assessment on website

---

## 🛠️ Technical Stack

- **Runtime:** Node.js v22 (TypeScript)
- **Framework:** Express.js with MCP SDK
- **Transport:** SSE (Server-Sent Events) over HTTP
- **Deployment:** Railway (auto-deploys from GitHub)
- **Protocol:** Model Context Protocol (MCP) by Anthropic

---

## 📝 Configuration

### Services Data
Edit `data/services.json` to update:
- Service names and descriptions
- Pricing and delivery times
- Target industries and company sizes
- Included features

### Business Logic
Edit tool handlers to update:
- Fit reasoning in `get-services.ts`
- Scoring algorithm in `assess-readiness.ts`
- Gap analysis rules in `assess-readiness.ts`
- Pricing logic in `assess-readiness.ts`

### Allowed Hosts
Edit `src/server-http.ts` to add new domains:
```typescript
const app = createMcpExpressApp({
  host: '0.0.0.0',
  allowedHosts: ['0.0.0.0', 'localhost', '127.0.0.1', 'agencyai-mcp.up.railway.app', 'your-custom-domain.com']
});
```

---

## 📞 Support

- **GitHub Issues:** https://github.com/barnaby-coder/agencyai-mcp/issues
- **Documentation:** https://docs.modelcontextprotocol.io
- **Agency AI:** https://agencyai.me

---

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for Agency AI Operations**

*Deployed on Railway • Powered by MCP • Live at https://agencyai-mcp.up.railway.app*
