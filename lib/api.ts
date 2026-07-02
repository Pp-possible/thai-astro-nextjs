export const N8N_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://thai-astro-api-735955113943.asia-southeast1.run.app";

/**
 * Fetch the user's profile and balance
 */
export async function fetchUserProfile(userId: string) {
  try {
    const res = await fetch(`${N8N_API_URL}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return await res.json();
  } catch (error) {
    console.error("fetchUserProfile Error:", error);
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser(userId: string, displayName: string, pictureUrl: string) {
  try {
    const res = await fetch(`${N8N_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, displayName, pictureUrl }),
    });
    return res.ok;
  } catch (error) {
    console.error("registerUser Error:", error);
    return false;
  }
}

/**
 * Verify slip payment
 */
export async function verifySlip(userId: string, slipPayload: any) {
  try {
    const res = await fetch(`${N8N_API_URL}/verify-slip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, slipPayload }),
    });
    if (!res.ok) throw new Error("Slip verification failed");
    return await res.json();
  } catch (error) {
    console.error("verifySlip Error:", error);
    throw error;
  }
}

/**
 * Get prediction data
 */
export async function getPrediction(txnId: string) {
  try {
    const res = await fetch(`${N8N_API_URL}/get-prediction/${txnId}`);
    if (!res.ok) throw new Error("Failed to fetch prediction");
    return await res.json();
  } catch (error) {
    console.error("getPrediction Error:", error);
    return null;
  }
}

/**
 * Follow-up chat for interactive mode
 */
export async function chatFollowup(userId: string, txnId: string, message: string) {
  try {
    const res = await fetch(`${N8N_API_URL}/chat-followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, txnId, message }),
    });
    if (!res.ok) throw new Error("Chat failed");
    return await res.json();
  } catch (error) {
    console.error("chatFollowup Error:", error);
    throw error;
  }
}
