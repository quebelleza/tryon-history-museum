import { createClient } from "./client";

/**
 * Client-side hook-style function to check member access.
 * Returns { isLoggedIn, isActiveMember, tier, donorClass, donorLevel, expirationDate, member }
 */
export async function getMemberAccess() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isLoggedIn: false,
      isActiveMember: false,
      tier: null,
      donorClass: null,
      donorLevel: null,
      expirationDate: null,
      member: null,
    };
  }

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!member) {
    return {
      isLoggedIn: true,
      isActiveMember: false,
      tier: null,
      donorClass: null,
      donorLevel: null,
      expirationDate: null,
      member: null,
    };
  }

  const isActiveMember =
    member.status === "active" || member.status === "expiring_soon";

  return {
    isLoggedIn: true,
    isActiveMember,
    tier: member.effective_access_tier,
    donorClass: member.donor_class,
    donorLevel: member.donor_level || member.donor_class,
    expirationDate: member.expiration_date,
    member,
  };
}
