import crypto from 'crypto';
import dotenv from 'dotenv';
import { supabase } from './supabase';

dotenv.config();

export interface ConsentRequestParams {
  user_id: string;
  customer_vua?: string;
  fip_list?: string[];
  data_types?: string[];
  purpose?: string;
  redirect_url?: string;
}

export interface SetuConsentResponse {
  consentId: string;
  url: string;
  status: string;
}

export interface SetuWebhookPayload {
  type?: string;
  event?: string;
  timestamp?: string;
  data?: {
    consentId?: string;
    status?: string;
    detail?: {
      accounts?: Array<{
        maskedAccNumber?: string;
        accType?: string;
        fipId?: string;
        fiType?: string;
        linkRefNumber?: string;
      }>;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

function getSetuConfig() {
  const baseUrl = (process.env.SETU_BASE_URL || 'https://fiu-sandbox.setu.co/v2').replace(/\/$/, '');
  const clientId = process.env.SETU_CLIENT_ID;
  const clientSecret = process.env.SETU_CLIENT_SECRET;
  const productInstanceId = process.env.SETU_PRODUCT_INSTANCE_ID;
  const webhookSecret = process.env.SETU_WEBHOOK_SECRET || clientSecret;

  return {
    baseUrl,
    clientId,
    clientSecret,
    productInstanceId,
    webhookSecret,
  };
}

function getSetuHeaders() {
  const { clientId, clientSecret, productInstanceId } = getSetuConfig();

  if (!clientId || !clientSecret) {
    throw new Error('Missing Setu credentials in environment (SETU_CLIENT_ID, SETU_CLIENT_SECRET)');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-client-id': clientId,
    'x-client-secret': clientSecret,
  };

  if (productInstanceId) {
    headers['x-product-instance-id'] = productInstanceId;
  }

  return headers;
}

/**
 * Creates a real consent request with Setu AA API.
 */
export async function createSetuConsentRequest(params: ConsentRequestParams): Promise<SetuConsentResponse> {
  const { baseUrl } = getSetuConfig();
  const headers = getSetuHeaders();

  const redirectUrl = params.redirect_url || 'http://localhost:5173/onboarding/linking';
  const customerId = params.customer_vua || '9999999999@onemoney';

  const consentPayload = {
    Detail: {
      consentStart: new Date().toISOString(),
      consentExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      Customer: {
        id: customerId,
      },
      FIDataRange: {
        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
      ConsentMode: 'STORE',
      ConsentTypes: ['VIEW', 'STORE', 'PROFILE'],
      fetchType: 'ONETIME',
      Frequency: {
        unit: 'MONTH',
        value: 1,
      },
      DataLife: {
        unit: 'MONTH',
        value: 1,
      },
      DataConsumer: {
        id: 'setu-fiu-id',
      },
      Purpose: {
        code: '101',
        refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
        text: params.purpose || 'Wealth management and portfolio consolidation',
        Category: {
          type: 'string',
        },
      },
      fiTypes: params.data_types || [
        'DEPOSIT',
        'TERM_DEPOSIT',
        'MUTUAL_FUNDS',
        'EQUITIES',
        'BONDS',
        'SIP',
      ],
    },
    context: [
      { key: 'accounttype', value: params.fip_list?.join(',') || 'MULTIPLE' },
    ],
    redirectUrl,
  };

  console.log(`[Setu AA] Creating consent request at ${baseUrl}/consents...`);
  const response = await fetch(`${baseUrl}/consents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(consentPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Setu AA] Consent creation failed:', response.status, errorText);
    throw new Error(`Setu API returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return {
    consentId: data.id || data.consentId,
    url: data.url || data.redirectUrl,
    status: data.status || 'PENDING',
  };
}

/**
 * Checks the status of a specific consent ID directly from Setu API.
 */
export async function getSetuConsentStatus(consentId: string): Promise<string> {
  const { baseUrl } = getSetuConfig();
  const headers = getSetuHeaders();

  const response = await fetch(`${baseUrl}/consents/${consentId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Setu status API returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.status || 'UNKNOWN';
}

/**
 * Verifies webhook HMAC-SHA256 signature safely with buffer length guards.
 */
export function verifySetuWebhook(rawBody: string, signature: string | undefined, secret?: string): boolean {
  const webhookSecret = secret || getSetuConfig().webhookSecret;
  if (!signature || !webhookSecret || !rawBody) {
    return false;
  }

  try {
    const sigBuffer = Buffer.from(signature.trim());

    const computedBase64 = Buffer.from(
      crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('base64')
    );
    const computedHex = Buffer.from(
      crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
    );

    const matchBase64 =
      sigBuffer.length === computedBase64.length &&
      crypto.timingSafeEqual(sigBuffer, computedBase64);

    const matchHex =
      sigBuffer.length === computedHex.length &&
      crypto.timingSafeEqual(sigBuffer, computedHex);

    return matchBase64 || matchHex;
  } catch (err) {
    console.error('[Setu AA] Webhook signature verification error:', err);
    return false;
  }
}

/**
 * Initiates an FI data session for an approved consent.
 */
export async function createSetuDataSession(consentId: string): Promise<string> {
  const { baseUrl } = getSetuConfig();
  const headers = getSetuHeaders();

  const sessionPayload = {
    consentId,
    DataRange: {
      from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    },
    format: 'json',
  };

  console.log(`[Setu AA] Creating data session for consent ${consentId}...`);
  const response = await fetch(`${baseUrl}/sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(sessionPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Setu data session (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.id || data.sessionId;
}

/**
 * Fetches standardized FI data payload for an active session.
 */
export async function fetchSetuDataSession(sessionId: string): Promise<any> {
  const { baseUrl } = getSetuConfig();
  const headers = getSetuHeaders();

  console.log(`[Setu AA] Fetching data session ${sessionId}...`);
  const response = await fetch(`${baseUrl}/sessions/${sessionId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Setu data session (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Idempotently parses and stores standardized FI data into linked_accounts and holdings tables.
 */
export async function processAndStoreFIData(params: {
  user_id: string;
  consent_id: string;
  fi_data: any;
}): Promise<{ linkedAccountsCount: number; holdingsCount: number }> {
  const { user_id, consent_id, fi_data } = params;

  // Retrieve consent record UUID for foreign key association
  const { data: consentRecord } = await supabase
    .from('aa_consents')
    .select('id')
    .eq('consent_id', consent_id)
    .single();

  const dbConsentId = consentRecord?.id || null;

  let linkedAccountsCount = 0;
  let holdingsCount = 0;

  // Setu returns data in payload array (or payload.Payload / payload.data)
  const payloads = Array.isArray(fi_data?.Payload)
    ? fi_data.Payload
    : Array.isArray(fi_data?.data)
    ? fi_data.data
    : [fi_data];

  for (const item of payloads) {
    if (!item) continue;

    const fipId = item.fipId || item.fip_id || 'SETU_FIP';
    const accounts = Array.isArray(item.data) ? item.data : [item];

    for (const accWrapper of accounts) {
      const account = accWrapper?.decryptedFI?.account || accWrapper?.account || accWrapper;
      if (!account) continue;

      const maskedAccNumber = account.maskedAccNumber || account.masked_acc_number || 'XXXXXXXX0000';
      const accType = (account.type || account.accType || 'BANK').toUpperCase();
      const linkRefNumber = account.linkRefNumber || accWrapper.linkRefNumber || null;

      // 1. Idempotently find or create linked_account
      let linkedAccountId: string | null = null;
      const { data: existingAccount } = await supabase
        .from('linked_accounts')
        .select('id')
        .eq('user_id', user_id)
        .eq('masked_account_ref', maskedAccNumber)
        .maybeSingle();

      if (existingAccount) {
        linkedAccountId = existingAccount.id;
        await supabase
          .from('linked_accounts')
          .update({
            consent_id: dbConsentId,
            fip_type: accType,
            provider_name: fipId,
            account_link_ref: linkRefNumber,
            last_synced_at: new Date().toISOString(),
            sync_status: 'SUCCESS',
          })
          .eq('id', linkedAccountId);
      } else {
        const { data: newAccount, error: accErr } = await supabase
          .from('linked_accounts')
          .insert({
            user_id,
            consent_id: dbConsentId,
            fip_type: accType,
            provider_name: fipId,
            masked_account_ref: maskedAccNumber,
            account_link_ref: linkRefNumber,
            last_synced_at: new Date().toISOString(),
            sync_status: 'SUCCESS',
          })
          .select('id')
          .single();

        if (accErr) {
          console.error('[Setu AA] Error inserting linked_account:', accErr);
          continue;
        }
        linkedAccountId = newAccount.id;
      }

      linkedAccountsCount++;

      // 2. Clear old holdings for this specific linked_account before inserting fresh snapshot
      if (linkedAccountId) {
        await supabase
          .from('holdings')
          .delete()
          .eq('user_id', user_id)
          .eq('linked_account_id', linkedAccountId)
          .eq('data_source', 'SETU_AA');

        // 3. Process Account Balance / Deposit as a Holding item
        const summary = account.summary || account.accountSummary;
        if (summary?.currentBalance !== undefined) {
          const balance = parseFloat(summary.currentBalance);
          await supabase.from('holdings').insert({
            user_id,
            linked_account_id: linkedAccountId,
            asset_class: 'CASH_EQUIVALENT',
            instrument_name: `${fipId} Savings / Current Balance`,
            isin_or_scheme_code: `ACC_${maskedAccNumber.slice(-4)}`,
            quantity: 1,
            avg_cost: balance,
            current_value: balance,
            currency: 'INR',
            data_source: 'SETU_AA',
            last_updated: new Date().toISOString(),
            sector: 'Banking & Cash',
          });
          holdingsCount++;
        }

        // 4. Process Holdings array (Equities / Mutual Funds / Term Deposits)
        const holdingList = account.holdings || account.Holdings?.holding || [];
        if (Array.isArray(holdingList)) {
          for (const h of holdingList) {
            const assetClass = (h.assetClass || h.type || 'MUTUAL_FUND').toUpperCase();
            const instrumentName = h.issuerName || h.instrumentName || h.name || 'Financial Asset';
            const isin = h.isin || h.schemeCode || h.isin_or_scheme_code || null;
            const quantity = parseFloat(h.units || h.quantity || '1') || 1;
            const avgCost = parseFloat(h.purchasePrice || h.avg_cost || h.nav || '0') || 0;
            const currentValue = parseFloat(h.currentValue || h.current_value || (quantity * avgCost).toString()) || (quantity * avgCost);
            const sector = h.sector || 'General';

            await supabase.from('holdings').insert({
              user_id,
              linked_account_id: linkedAccountId,
              asset_class: assetClass,
              instrument_name: instrumentName,
              isin_or_scheme_code: isin,
              quantity,
              avg_cost: avgCost,
              current_value: currentValue,
              currency: 'INR',
              data_source: 'SETU_AA',
              last_updated: new Date().toISOString(),
              sector,
            });
            holdingsCount++;
          }
        }
      }
    }
  }

  console.log(`[Setu AA] Processed ${linkedAccountsCount} accounts and ${holdingsCount} holdings for consent ${consent_id}`);
  return { linkedAccountsCount, holdingsCount };
}
