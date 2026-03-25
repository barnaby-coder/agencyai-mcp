const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const services = require('../data/services.json');

const server = new Server({
  name: "agencyai-commerce",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: "get_service_offerings",
      description: "Get AI operations consulting services. Returns recommended packages based on industry, company size, and pain points.",
      inputSchema: {
        type: "object",
        properties: {
          industry: {
            type: "string",
            description: "Client's industry (healthcare, finance, professional_services, real_estate, insurance_brokerages, construction_trades)"
          },
          company_size: {
            type: "number",
            description: "Number of employees"
          },
          pain_points: {
            type: "array",
            description: "Current pain points (e.g., 'manual_data_entry', 'no_decision_tracking', 'email_overload')"
          }
        }
      }
    },
    {
      name: "assess_ai_readiness",
      description: "Assess client's AI readiness. Returns readiness score, recommended package, implementation roadmap, and pricing estimate.",
      inputSchema: {
        type: "object",
        properties: {
          industry: {
            type: "string",
            description: "Client's industry"
          },
          employee_count: {
            type: "number",
            description: "Number of employees"
          },
          current_tools: {
            type: "array",
            description: "Current tools (e.g., 'salesforce', 'gmail', 'zoom', 'slack', 'notion')"
          },
          pain_points: {
            type: "array",
            description: "Current challenges (e.g., 'no_decision_tracking', 'manual_data_entry', 'email_overload', 'lost_knowledge')"
          }
        },
        required: ["industry", "employee_count"]
      }
    },
    {
      name: "book_consultation",
      description: "Book a consultation. Returns booking confirmation, meeting link, and pre-call questionnaire.",
      inputSchema: {
        type: "object",
        properties: {
          service_package: {
            type: "string",
            description: "Service package (automated_workflows, custom_ai_second_brain)"
          },
          contact_name: {
            type: "string",
            description: "Contact person name"
          },
          contact_email: {
            type: "string",
            description: "Contact email"
          },
          company_name: {
            type: "string",
            description: "Company name"
          },
          preferred_times: {
            type: "array",
            description: "Preferred meeting times (e.g., '2026-03-25 2pm', '2026-03-26 10am')"
          },
          industry: {
            type: "string",
            description: "Industry (optional)"
          },
          employee_count: {
            type: "number",
            description: "Employee count (optional)"
          }
        },
        required: ["service_package", "contact_name", "contact_email"]
      }
    }
  ]
}));

function handleGetServices(args) {
  const { industry, company_size, pain_points } = args;
  let recommended_services = services.services;
  
  if (industry) {
    const industry_map = {
      "healthcare": "healthcare",
      "finance": "finance",
      "professional_services": "professional_services",
      "legal": "professional_services",
      "consulting": "professional_services",
      "real_estate": "real_estate",
      "insurance_brokerages": "insurance_brokerages",
      "construction_trades": "construction_trades"
    };
    
    const normalized_industry = industry_map[industry] || industry;
    recommended_services = recommended_services.filter(s => 
      s.industries.includes(normalized_industry)
    );
  }
  
  if (company_size) {
    recommended_services = recommended_services.filter(s => {
      const [min, max] = s.target_company_size.split('-').map(n => parseInt(n));
      return company_size >= min && company_size <= max;
    });
  }
  
  const enriched_services = recommended_services.map(service => ({
    ...service,
    fits_reason: getFitReason(service, pain_points || [])
  }));
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        recommended_packages: enriched_services
      }, null, 2)
    }]
  };
}

function getFitReason(service, pain_points) {
  if (pain_points.includes("no_decision_tracking") && service.id === "automated_workflows") {
    return "Automated Workflows includes decision logging - addresses your core pain point";
  }
  if (pain_points.includes("manual_data_entry") && service.id === "custom_ai_second_brain") {
    return "Second Brain integrates with your CRM/accounting - eliminates manual data entry";
  }
  if (pain_points.includes("email_overload") && service.id === "automated_workflows") {
    return "Automated Workflows includes email triage - directly addresses email overwhelm";
  }
  if (pain_points.includes("no_knowledge_base") && service.id === "custom_ai_second_brain") {
    return "Second Brain creates persistent knowledge layer - captures all organizational intelligence";
  }
  return "General AI operations improvement for this industry";
}

function handleAssessReadiness(args) {
  const { industry, employee_count, current_tools, pain_points } = args;
  const readiness_score = calculateReadinessScore(current_tools || [], pain_points || []);
  const recommended_package = recommendPackage(readiness_score, employee_count);
  const gap_analysis = generateGapAnalysis(current_tools || [], pain_points || []);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        readiness_score,
        recommended_package,
        gap_analysis,
        implementation_roadmap: generateRoadmap(recommended_package),
        pricing_estimate: getPricing(recommended_package, employee_count)
      }, null, 2)
    }]
  };
}

function calculateReadinessScore(current_tools, pain_points) {
  let score = 50;
  
  if (current_tools.includes("salesforce") || current_tools.includes("hubspot")) score += 10;
  if (current_tools.includes("slack") || current_tools.includes("teams")) score += 10;
  if (current_tools.includes("notion") || current_tools.includes("confluence")) score += 10;
  
  if (pain_points.includes("no_decision_tracking")) score -= 15;
  if (pain_points.includes("manual_data_entry")) score -= 15;
  if (pain_points.includes("lost_knowledge")) score -= 10;
  if (pain_points.includes("email_overload")) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function recommendPackage(readiness_score, employee_count) {
  if (readiness_score >= 70 && employee_count <= 100) {
    return "automated_workflows";
  }
  if (employee_count >= 20) {
    return "custom_ai_second_brain";
  }
  return "automated_workflows";
}

function generateGapAnalysis(current_tools, pain_points) {
  const gaps = [];
  
  if (!current_tools.some(t => t.includes("crm"))) {
    gaps.push("No CRM integration (AI can't access customer context)");
  }
  if (!current_tools.some(t => t.includes("email"))) {
    gaps.push("Email not integrated (manual email triage)");
  }
  if (pain_points.includes("no_decision_tracking")) {
    gaps.push("Decision tracking missing (no organizational memory)");
  }
  if (pain_points.includes("lost_knowledge")) {
    gaps.push("Knowledge not captured (no persistent intelligence layer)");
  }
  
  return gaps;
}

function generateRoadmap(package_type) {
  if (package_type === "automated_workflows") {
    return "Phase 1: Email triage (2 weeks), Phase 2: Knowledge base (3 weeks), Phase 3: Decision logging (2 weeks)";
  }
  return "Phase 1: Knowledge layer (4 weeks), Phase 2: System integrations (4 weeks), Phase 3: Custom tools (4 weeks)";
}

function getPricing(package_type, employee_count) {
  if (package_type === "automated_workflows") {
    if (employee_count <= 20) return "$25K-$35K";
    if (employee_count <= 50) return "$35K-$55K";
    return "$55K-$75K";
  }
  
  if (package_type === "custom_ai_second_brain") {
    if (employee_count <= 50) return "$150K-$180K";
    if (employee_count <= 100) return "$180K-$220K";
    return "$220K-$250K";
  }
  
  return "$25K-$75K";
}

function handleBookConsultation(args) {
  const { service_package, contact_name, contact_email, company_name, preferred_times, industry, employee_count } = args;
  const booking_id = `BOOK-${Date.now()}`;
  const confirmed_time = preferred_times && preferred_times[0] ? preferred_times[0] : "2026-03-26 10am";
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        booking_id,
        confirmed_time,
        contact_name,
        contact_email,
        service_package,
        company_name,
        industry,
        employee_count,
        meeting_link: `https://agencyai.me/consultation/${booking_id}`,
        pre_call_questionnaire: `https://agencyai.me/questionnaire/${booking_id}`,
        next_steps: [
          "Calendar invite sent to your email",
          "Complete pre-call questionnaire before meeting",
          "Prepare questions about AI operations"
        ],
        estimated_call_duration: "45 minutes"
      }, null, 2)
    }]
  };
}

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "get_service_offerings") {
    return handleGetServices(args);
  }
  if (name === "assess_ai_readiness") {
    return handleAssessReadiness(args);
  }
  if (name === "book_consultation") {
    return handleBookConsultation(args);
  }
  
  throw new Error(`Tool not found: ${name}`);
});

(async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agency AI MCP server running");
})();

module.exports = { server };
