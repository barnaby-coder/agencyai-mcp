import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import * as z from "zod";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { handleGetServices } from "./tools/get-services.js";
import { handleAssessReadiness } from "./tools/assess-readiness.js";
import { handleBookConsultation } from "./tools/book-consultation.js";

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load services data
const servicesPath = join(__dirname, '../data/services.json');
const services = JSON.parse(readFileSync(servicesPath, 'utf-8'));

const server = new McpServer({
  name: "agencyai-commerce",
  version: "1.0.0"
});

server.registerTool(
  "get_service_offerings",
  {
    title: "Get Service Offerings",
    description: "Get AI operations consulting services. Returns recommended packages based on industry, company size, and pain points.",
    inputSchema: z.object({
      industry: z.string().optional().describe("Client's industry (healthcare, finance, professional_services, real_estate, insurance_brokerages, construction_trades)"),
      company_size: z.number().optional().describe("Number of employees"),
      pain_points: z.array(z.string()).optional().describe("Current pain points (e.g., 'manual_data_entry', 'no_decision_tracking', 'email_overload')")
    })
  },
  async ({ industry, company_size, pain_points }) => {
    const result = await handleGetServices({ industry, company_size, pain_points, services });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result)
        }
      ]
    };
  }
);

server.registerTool(
  "assess_ai_readiness",
  {
    title: "Assess AI Readiness",
    description: "Assess client's AI readiness. Returns readiness score, recommended package, implementation roadmap, and pricing estimate.",
    inputSchema: z.object({
      industry: z.string().describe("Client's industry"),
      employee_count: z.number().describe("Number of employees"),
      current_tools: z.array(z.string()).optional().describe("Current tools (e.g., 'salesforce', 'gmail', 'zoom', 'slack', 'notion')"),
      pain_points: z.array(z.string()).optional().describe("Current challenges (e.g., 'no_decision_tracking', 'manual_data_entry', 'email_overload', 'lost_knowledge')")
    })
  },
  async ({ industry, employee_count, current_tools, pain_points }) => {
    const result = await handleAssessReadiness({ industry, employee_count, current_tools, pain_points });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result)
        }
      ]
    };
  }
);

server.registerTool(
  "book_consultation",
  {
    title: "Book Consultation",
    description: "Book a consultation. Returns booking confirmation, meeting link, and pre-call questionnaire.",
    inputSchema: z.object({
      service_package: z.string().describe("Service package (automated_workflows, custom_ai_second_brain)"),
      contact_name: z.string().describe("Contact person name"),
      contact_email: z.string().describe("Contact email"),
      company_name: z.string().optional().describe("Company name"),
      preferred_times: z.array(z.string()).optional().describe("Preferred meeting times (e.g., '2026-03-25 2pm', '2026-03-26 10am')"),
      industry: z.string().optional().describe("Industry (optional)"),
      employee_count: z.number().optional().describe("Employee count (optional)")
    })
  },
  async ({ service_package, contact_name, contact_email, company_name, preferred_times, industry, employee_count }) => {
    const result = await handleBookConsultation({ service_package, contact_name, contact_email, company_name, preferred_times, industry, employee_count });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result)
        }
      ]
    };
  }
);

async function main() {
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  const app = createMcpExpressApp({
    host: '0.0.0.0',
    allowedHosts: ['0.0.0.0', 'localhost', '127.0.0.1', 'agencyai-mcp.up.railway.app']
  });

  // Store transports by session ID
  const transports: Record<string, SSEServerTransport> = {};

  // SSE endpoint for establishing stream
  app.get('/sse', async (req, res) => {
    console.log('New SSE connection');
    try {
      const transport = new SSEServerTransport('/message', res);
      const sessionId = transport.sessionId;
      transports[sessionId] = transport;

      transport.onclose = () => {
        console.log(`SSE transport closed for session ${sessionId}`);
        delete transports[sessionId];
      };

      await server.connect(transport);
      console.log(`Established SSE stream with session ID: ${sessionId}`);
    } catch (error) {
      console.error('SSE connection error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'SSE connection failed' });
      }
    }
  });

  // Messages endpoint for receiving client JSON-RPC requests
  app.post('/message', async (req, res) => {
    console.log('POST /message received');
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      console.error('No session ID provided');
      res.status(400).send('Missing sessionId parameter');
      return;
    }

    const transport = transports[sessionId];
    if (!transport) {
      console.error(`No active transport found for session ID: ${sessionId}`);
      res.status(404).send('Session not found');
      return;
    }

    try {
      await transport.handlePostMessage(req, res, req.body);
    } catch (error) {
      console.error('Error handling POST request:', error);
      if (!res.headersSent) {
        res.status(500).send('Error handling request');
      }
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', name: 'agencyai-mcp', version: '1.0.0' });
  });

  // Root endpoint for testing
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      name: 'agencyai-mcp',
      version: '1.0.0',
      endpoints: {
        sse: '/sse',
        health: '/health'
      }
    });
  });

  app.listen(PORT, HOST, () => {
    console.log(`Agency AI MCP HTTP server running on ${HOST}:${PORT}`);
    console.log(`SSE endpoint: http://${HOST}:${PORT}/sse`);
    console.log(`Health check: http://${HOST}:${PORT}/health`);
  }).on('error', (err) => {
    console.error('Server listen error:', err);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
