export function handleAssessReadiness(args: any) {
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

function calculateReadinessScore(current_tools: string[], pain_points: string[]): number {
  let score = 50; // Base score
  
  // Tools integration
  if (current_tools.includes("salesforce") || current_tools.includes("hubspot")) score += 10;
  if (current_tools.includes("slack") || current_tools.includes("teams")) score += 10;
  if (current_tools.includes("notion") || current_tools.includes("confluence")) score += 10;
  
  // Pain points
  if (pain_points.includes("no_decision_tracking")) score -= 15;
  if (pain_points.includes("manual_data_entry")) score -= 15;
  if (pain_points.includes("lost_knowledge")) score -= 10;
  if (pain_points.includes("email_overload")) score -= 10;
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

function recommendPackage(readiness_score: number, employee_count: number): string {
  if (readiness_score >= 70 && employee_count <= 100) {
    return "automated_workflows";
  }
  if (employee_count >= 20) {
    return "custom_ai_second_brain";
  }
  return "automated_workflows"; // Default
}

function generateGapAnalysis(current_tools: string[], pain_points: string[]): string[] {
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

function generateRoadmap(package_type: string): string {
  if (package_type === "automated_workflows") {
    return "Phase 1: Email triage (2 weeks), Phase 2: Knowledge base (3 weeks), Phase 3: Decision logging (2 weeks)";
  }
  return "Phase 1: Knowledge layer (4 weeks), Phase 2: System integrations (4 weeks), Phase 3: Custom tools (4 weeks)";
}

function getPricing(package_type: string, employee_count: number): string {
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
