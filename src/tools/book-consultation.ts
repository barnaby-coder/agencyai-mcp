export function handleBookConsultation(args: any) {
  const { service_package, contact_name, contact_email, company_name, preferred_times, industry, employee_count } = args;
  const booking_id = `BOOK-${Date.now()}`;
  
  // In production: Store in database, send calendar invite, email confirmation
  const confirmed_time = selectBestTime(preferred_times || []);
  
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

function selectBestTime(preferred_times: string[]): string {
  // Simple logic: pick first available time
  // Production: Check calendar availability
  return preferred_times[0] || "2026-03-26 10am";
}
