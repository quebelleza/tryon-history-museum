export const VOLUNTEER_STATUSES = ["new", "contacted", "active", "inactive"];
export const VOLUNTEER_AREAS = ["docent", "exhibits", "coordination", "visitor_center", "events", "other"];
export const CONTACT_METHODS = ["email", "phone", "text"];
export const AVAILABILITY_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const AVAILABILITY_TIMES = ["morning", "afternoon", "evening"];

const text = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function validateVolunteerInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Invalid volunteer record." };
  const fullName = text(body.full_name, 150);
  const email = text(body.email, 254).toLowerCase();
  const phone = text(body.phone, 50);
  const status = body.status || "new";
  const preferredContact = body.preferred_contact || null;
  const areas = Array.isArray(body.volunteer_areas)
    ? [...new Set(body.volunteer_areas.filter((area) => VOLUNTEER_AREAS.includes(area)))]
    : [];

  if (!fullName || !email || !phone) return { error: "Name, email, and phone are required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please provide a valid email address." };
  if (!VOLUNTEER_STATUSES.includes(status)) return { error: "Please select a valid status." };
  if (preferredContact && !CONTACT_METHODS.includes(preferredContact)) return { error: "Please select a valid contact preference." };
  if (areas.length === 0) return { error: "Select at least one volunteer area." };

  const availability = {};
  if (body.availability && typeof body.availability === "object" && !Array.isArray(body.availability)) {
    for (const day of AVAILABILITY_DAYS) {
      const slots = {};
      for (const time of AVAILABILITY_TIMES) {
        if (body.availability[day]?.[time] === true) slots[time] = true;
      }
      if (Object.keys(slots).length > 0) availability[day] = slots;
    }
  }

  const comfort = body.public_comfort_level === "" || body.public_comfort_level == null
    ? null
    : Number(body.public_comfort_level);
  if (comfort !== null && (!Number.isInteger(comfort) || comfort < 1 || comfort > 5)) {
    return { error: "Public comfort level must be between 1 and 5." };
  }

  return {
    data: {
      full_name: fullName,
      email,
      phone,
      preferred_contact: preferredContact,
      interest_reason: text(body.interest_reason, 5000) || null,
      prior_experience: typeof body.prior_experience === "boolean" ? body.prior_experience : null,
      volunteer_areas: areas,
      availability: Object.keys(availability).length > 0 ? availability : null,
      hours_per_month: text(body.hours_per_month, 100) || null,
      public_comfort_level: comfort,
      status,
    },
  };
}
