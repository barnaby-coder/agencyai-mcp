import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import * as z from "zod";
import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { handleGetServices } from "./tools/get-services.js";
import { handleAssessReadiness } from "./tools/assess-readiness.js";
import { handleBookConsultation } from "./tools/book-consultation.js";

// Load services data
const servicesPath = new URL('../data/services.json', import.meta.url).pathname;
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

  const app = express();
  app.use(cors());

  // SSE endpoint for MCP
  app.get('/sse', async (req, res) => {
    try {
      console.log('New SSE connection');
      // Set SSE headers before transport
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const transport = new SSEServerTransport('/message', res);
      await server.connect(transport);
    } catch (error) {
      console.error('SSE connection error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'SSE connection failed' });
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

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
