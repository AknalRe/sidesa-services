export interface StudentIdentityInput {
  nim: string;
  studentName: string;
  university: string;
  studyProgram?: string;
}

export interface StudentVerificationResult {
  checked: boolean;
  verified: boolean;
  status: 'AKTIF' | 'NON_AKTIF' | 'NOT_FOUND' | 'MANUAL_REVIEW';
  message: string;
  matchedRecord?: {
    nama?: string;
    nim?: string;
    perguruanTinggi?: string;
    prodi?: string;
    statusMahasiswa?: string;
  };
}

function normalize(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 6000): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ReneoSIDesa-StudentVerifier/1.0',
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyStudentPddikti(input: StudentIdentityInput): Promise<StudentVerificationResult> {
  const nim = String(input.nim || '').trim();
  const studentName = String(input.studentName || '').trim();
  const university = String(input.university || '').trim();
  const studyProgram = String(input.studyProgram || '').trim();

  if (!nim || nim.length < 4 || !studentName || !university) {
    return {
      checked: false,
      verified: false,
      status: 'NOT_FOUND',
      message: 'NIM, Nama Lengkap Mahasiswa, dan Perguruan Tinggi wajib diisi untuk Paket Mahasiswa KKN.',
    };
  }

  const query = encodeURIComponent(`${nim} ${studentName}`);
  const normNim = normalize(nim);
  const normName = normalize(studentName);
  const normUni = normalize(university);

  // 1. Coba API PDDikti terbaru (kemdiktisaintek.go.id)
  const v2Data = await fetchJsonWithTimeout(`https://api-pddikti.kemdiktisaintek.go.id/pencarian/mhs/${query}`);
  if (Array.isArray(v2Data) && v2Data.length > 0) {
    const match = v2Data.find((item: any) => {
      const itemNim = normalize(item?.nim || '');
      const itemName = normalize(item?.nama || '');
      const itemPt = normalize(item?.nama_pt || '');
      return itemNim === normNim && (itemName.includes(normName.slice(0, 6)) || itemPt.includes(normUni.slice(0, 5)));
    });

    if (match) {
      let statusMhs = 'Terdaftar di PDDikti';
      let isInactive = false;

      if (match.id) {
        const detail = await fetchJsonWithTimeout(
          `https://api-pddikti.kemdiktisaintek.go.id/mhs/detail/${encodeURIComponent(match.id)}`
        );
        const st = String(
          detail?.status_saat_ini || detail?.dataumum?.ket_keluar || detail?.status || ''
        ).trim();
        if (st) {
          statusMhs = st;
          const lower = st.toLowerCase();
          if (
            lower.includes('lulus') ||
            lower.includes('keluar') ||
            lower.includes('drop out') ||
            lower.includes('non-aktif') ||
            lower.includes('non aktif') ||
            lower.includes('mengundurkan')
          ) {
            isInactive = true;
          }
        }
      }

      if (isInactive) {
        return {
          checked: true,
          verified: false,
          status: 'NON_AKTIF',
          message: `Data mahasiswa pada PDDikti berstatus "${statusMhs}". Paket KKN hanya berlaku untuk mahasiswa aktif.`,
          matchedRecord: {
            nama: match.nama,
            nim: match.nim,
            perguruanTinggi: match.nama_pt,
            prodi: match.nama_prodi || studyProgram,
            statusMahasiswa: statusMhs,
          },
        };
      }

      return {
        checked: true,
        verified: true,
        status: 'AKTIF',
        message: `Terverifikasi di PDDikti: ${match.nama} (${match.nim}) — ${match.nama_pt} (${statusMhs}).`,
        matchedRecord: {
          nama: match.nama,
          nim: match.nim,
          perguruanTinggi: match.nama_pt,
          prodi: match.nama_prodi || studyProgram,
          statusMahasiswa: statusMhs,
        },
      };
    }
  }

  // 2. Fallback API PDDikti frontend lama (kemdikbud.go.id)
  const v1Data = await fetchJsonWithTimeout(`https://api-frontend.kemdikbud.go.id/hit_mhs/${query}`);
  const listV1: any[] = Array.isArray(v1Data?.mahasiswa) ? v1Data.mahasiswa : [];
  if (listV1.length > 0) {
    const match = listV1.find((m: any) => {
      const txt = normalize(m?.text || '');
      return txt.includes(normNim) && (txt.includes(normName.slice(0, 6)) || txt.includes(normUni.slice(0, 5)));
    });
    if (match) {
      return {
        checked: true,
        verified: true,
        status: 'AKTIF',
        message: `Terverifikasi di PDDikti: ${match.text}`,
        matchedRecord: {
          nama: studentName,
          nim,
          perguruanTinggi: university,
          prodi: studyProgram,
          statusMahasiswa: 'Terdaftar di PDDikti',
        },
      };
    }
  }

  // 3. Jika API PDDikti tidak dapat dijangkau / rate-limited, tandai MANUAL_REVIEW untuk verifikasi KTM oleh Superadmin
  return {
    checked: false,
    verified: false,
    status: 'MANUAL_REVIEW',
    message:
      'Data mahasiswa dicatat dan menunggu verifikasi KTM/PDDikti oleh Superadmin saat konfirmasi pembayaran (server PDDikti tidak merespons atau data belum sinkron).',
    matchedRecord: {
      nama: studentName,
      nim,
      perguruanTinggi: university,
      prodi: studyProgram,
      statusMahasiswa: 'Menunggu Verifikasi Superadmin',
    },
  };
}
