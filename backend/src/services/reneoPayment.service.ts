export interface ReneoPaymentMethod {
  id?: string;
  type?: string;
  label?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  qrisImageUrl?: string;
  instructions?: string;
  [key: string]: any;
}

export interface ReneoOrderResult {
  publicId: string;
  invoiceNumber: string;
  uniqueCode: number;
  amountTotal: number;
  status: string;
  paymentMethods: ReneoPaymentMethod[];
}

function getReneoConfig() {
  const panelUrl = String(process.env.RENEO_PANEL_URL || '').trim().replace(/\/+$/, '');
  const appToken = String(process.env.RENEO_APP_TOKEN || '').trim();
  return { panelUrl, appToken, enabled: Boolean(panelUrl && appToken) };
}

export function isReneoPaymentEcosystemEnabled(): boolean {
  return getReneoConfig().enabled;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 6000): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function createReneoEcosystemOrder(input: {
  planCode: string;
  planName: string;
  durationMonths: number;
  amountList: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  paymentMethod?: string;
}): Promise<ReneoOrderResult | null> {
  const cfg = getReneoConfig();
  if (!cfg.enabled) return null;

  const data = await fetchWithTimeout(`${cfg.panelUrl}/api/v1/app-catalog/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Reneo-App-Token': cfg.appToken,
    },
    body: JSON.stringify({
      catalogId: 'reneo-sidesa',
      planSlug: `sidesa-${input.planCode.toLowerCase()}-${input.durationMonths}m`,
      planName: `${input.planName} (${input.durationMonths} Bulan)`,
      months: input.durationMonths,
      amountList: input.amountList,
      quantity: 1,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      buyerPhone: input.buyerPhone || '',
      paymentMethod: (input.paymentMethod || 'transfer').toLowerCase(),
    }),
  });

  if (!data?.ok || !data?.order?.publicId) return null;
  return {
    publicId: String(data.order.publicId),
    invoiceNumber: String(data.order.invoiceNumber || ''),
    uniqueCode: Number(data.order.uniqueCode || 0),
    amountTotal: Number(data.order.amountTotal || input.amountList),
    status: String(data.order.status || 'pending'),
    paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods : [],
  };
}

export async function getReneoEcosystemOrder(publicId: string): Promise<ReneoOrderResult | null> {
  const cfg = getReneoConfig();
  if (!cfg.enabled || !publicId) return null;

  const data = await fetchWithTimeout(`${cfg.panelUrl}/api/v1/app-catalog/orders/${encodeURIComponent(publicId)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-Reneo-App-Token': cfg.appToken,
    },
  });

  if (!data?.ok || !data?.order) return null;
  return {
    publicId: String(data.order.publicId || publicId),
    invoiceNumber: String(data.order.invoiceNumber || ''),
    uniqueCode: Number(data.order.uniqueCode || 0),
    amountTotal: Number(data.order.amountTotal || 0),
    status: String(data.order.status || 'pending'),
    paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods : [],
  };
}
