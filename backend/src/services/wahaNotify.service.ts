import axios from 'axios';

export interface WahaNotifyResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

export function normalizeWhatsappNumber(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

export function buildLetterStatusMessage(params: {
  villageName: string;
  applicantName: string;
  letterType: string;
  trackingCode: string;
  status: string;
  letterNumber?: string | null;
  adminNotes?: string | null;
}): string {
  const statusLabel: Record<string, string> = {
    DIAJUKAN: 'Diterima & Menunggu Verifikasi',
    DIPROSES: 'Sedang Diproses Perangkat Desa',
    SELESAI: 'Selesai — Siap Diambil / Dicetak',
    DITOLAK: 'Ditolak / Perlu Perbaikan',
  };
  const lines = [
    `*${params.villageName} — Layanan Surat*`,
    `Halo ${params.applicantName},`,
    `Pengajuan surat Anda (${params.letterType}) dengan kode *${params.trackingCode}* berstatus: *${statusLabel[params.status] || params.status}*.`,
  ];
  if (params.letterNumber) {
    lines.push(`Nomor Surat: ${params.letterNumber}`);
  }
  if (params.adminNotes) {
    lines.push(`Catatan Petugas: ${params.adminNotes}`);
  }
  return lines.join('\n');
}

export async function sendWahaNotification(phone: string, text: string): Promise<WahaNotifyResult> {
  const baseUrl = (process.env.WAHA_BASE_URL || '').trim().replace(/\/+$/, '');
  const session = (process.env.WAHA_SESSION || 'default').trim();
  const apiKey = (process.env.WAHA_API_KEY || '').trim();
  if (!baseUrl) {
    return { sent: false, skipped: true };
  }
  const normalized = normalizeWhatsappNumber(phone);
  if (!normalized || normalized.length < 9) {
    return { sent: false, skipped: true };
  }
  try {
    await axios.post(
      `${baseUrl}/api/sendText`,
      {
        session,
        chatId: `${normalized}@c.us`,
        text,
      },
      {
        timeout: 8000,
        headers: apiKey ? { 'X-Api-Key': apiKey } : undefined,
      }
    );
    return { sent: true };
  } catch (err: any) {
    return { sent: false, error: err?.message || 'Gagal mengirim notifikasi WAHA' };
  }
}
