import services from "../../data/services.json";

export function handleGetServices(args: any) {
  const { industry, company_size, pain_points } = args;
  let recommended_services = services.services;
  
  // Filter by industry if specified
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
    
    const normalized_industry = industry_map[industry as keyof typeof industry_map] || industry;
    recommended_services = recommended_services.filter((s: any) => 
      s.industries.includes(normalized_industry)
    );
  }
  
  // Filter by company size
  if (company_size) {
    recommended_services = recommended_services.filter((s: any) => {
      const [min, max] = s.target_company_size.split('-').map((n: string) => parseInt(n));
      return company_size >= min && company_size <= max;
    });
  }
  
  // Add fit reasoning
  const enriched_services = recommended_services.map((service: any) => ({
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

function getFitReason(service: any, pain_points: string[]): string {
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
