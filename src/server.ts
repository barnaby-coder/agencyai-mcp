import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod";
import { handleGetServices } from "./tools/get-services.js";
import { handleAssessReadiness } from "./tools/assess-readiness.js";
import { handleBookConsultation } from "./tools/book-consultation.js";
import services from "../data/services.json";

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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agency AI MCP server running");
}

main().catch(console.error);
