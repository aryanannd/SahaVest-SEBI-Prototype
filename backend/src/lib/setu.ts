import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const SETU_BASE_URL = 'https://fiu-sandbox.setu.co/v2';

export interface ConsentRequestPayload {
  fip_list?: string[];
  data_types?: string[];
  purpose?: string;
}

/**
 * Creates a consent request with Setu Sandbox.
 */
export async function createSetuConsent(payload: ConsentRequestPayload) {
  const clientId = process.env.SETU_CLIENT_ID;
  const clientSecret = process.env.SETU_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === 'your_setu_client_id') {
    throw new Error('Missing or invalid Setu credentials');
  }

  // Simulated Setu payload structure
  const setuPayload = {
    Detail: {
      consentStart: new Date().toISOString(),
      consentExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      Customer: { id: "user@vua" },
      FIDataRange: {
        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
      DataLife: { unit: "MONTH", value: 6 },
      DataConsumer: { type: "FIU" },
      Purpose: {
        code: "101",
        refUri: "https://api.rebit.org.in/aa/purpose/101.xml",
        text: payload.purpose || "Wealth management",
        Category: { type: "string" },
      },
      fiTypes: payload.data_types || ["DEPOSIT", "TERM_DEPOSIT", "MUTUAL_FUNDS"],
      ConsentMode: "STORE",
      ConsentTypes: ["VIEW", "STORE", "PROFILE"],
      fetchType: "ONETIME",
    },
    context: [
      { key: "accounttype", value: payload.fip_list?.join(',') || "MULTIPLE" }
    ],
    redirectUrl: "http://localhost:5173/onboarding/aa-success"
  };

  try {
    const response = await fetch(`${SETU_BASE_URL}/consents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "client-id": clientId,
        "client-secret": clientSecret
      },
      body: JSON.stringify(setuPayload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Setu Consent Error Response:", err);
      throw new Error(`Setu API returned ${response.status}: ${err}`);
    }

    const data = await response.json();
    return {
      consentId: data.id,
      url: data.url // The webview URL where user approves consent
    };
  } catch (error) {
    console.error("Setu API error:", error);
    throw error;
  }
}

/**
 * Checks the status of a specific consent ID.
 */
export async function getSetuConsentStatus(consentId: string) {
  const clientId = process.env.SETU_CLIENT_ID;
  const clientSecret = process.env.SETU_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === 'your_setu_client_id') {
    throw new Error('Missing or invalid Setu credentials');
  }

  const response = await fetch(`${SETU_BASE_URL}/consents/${consentId}`, {
    method: "GET",
    headers: {
      "client-id": clientId,
      "client-secret": clientSecret
    }
  });

  if (!response.ok) {
    throw new Error(`Setu API returned ${response.status}`);
  }

  const data = await response.json();
  return data.status; // e.g., 'ACTIVE', 'PENDING', 'REJECTED'
}
