import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateDemographics,
  formatOfficialLetterNumber,
  generateTrackingCode,
  slugifyTitle,
  summarizeApbdes,
} from '../lib/helpers';
import { buildLetterStatusMessage, normalizeWhatsappNumber } from '../services/wahaNotify.service';

test('formatOfficialLetterNumber follows Permendagri 109/2019 registration codes', () => {
  const dt = new Date('2026-03-15T00:00:00Z');
  assert.equal(
    formatOfficialLetterNumber('SKTM', 7, '35.22.13.2001', dt),
    '401/007/35.22.13.2001/III/2026'
  );
  assert.equal(
    formatOfficialLetterNumber('SKU', 12, 'DESA', dt),
    '503/012/DESA/III/2026'
  );
});

test('generateTrackingCode produces structured tracking codes', () => {
  assert.match(generateTrackingCode('SRT'), /^SRT-\d{4}-[0-9A-F]{6}$/);
  assert.match(generateTrackingCode('ADU'), /^ADU-\d{4}-[0-9A-F]{6}$/);
  assert.match(generateTrackingCode('PPID'), /^PPID-\d{4}-[0-9A-F]{6}$/);
});

test('aggregateDemographics computes active residents, households, voters and groupings', () => {
  const demo = aggregateDemographics([
    { kkNumber: 'KK1', gender: 'L', birthDate: '1985-01-01', dusun: 'Krajan', education: 'SLTA', occupation: 'Petani', religion: 'Islam', maritalStatus: 'Kawin', isVoter: true, status: 'AKTIF' },
    { kkNumber: 'KK1', gender: 'P', birthDate: '1988-05-01', dusun: 'Krajan', education: 'SLTA', occupation: 'IRT', religion: 'Islam', maritalStatus: 'Kawin', isVoter: true, status: 'AKTIF' },
    { kkNumber: 'KK2', gender: 'L', birthDate: '2015-03-01', dusun: 'Ngasem', education: 'SD', occupation: 'Pelajar', religion: 'Islam', maritalStatus: 'Belum Kawin', isVoter: false, status: 'AKTIF' },
    { kkNumber: 'KK3', gender: 'L', birthDate: '1960-01-01', dusun: 'Ngasem', education: 'SD', occupation: 'Petani', religion: 'Islam', maritalStatus: 'Kawin', isVoter: true, status: 'MENINGGAL' },
  ]);
  assert.equal(demo.totalResidents, 3);
  assert.equal(demo.totalHouseholds, 2);
  assert.equal(demo.male, 2);
  assert.equal(demo.female, 1);
  assert.equal(demo.voters, 2);
  assert.equal(demo.byDusun[0].label, 'Krajan');
  assert.equal(demo.byDusun[0].total, 2);
});

test('summarizeApbdes calculates budget, realization, and surplus/deficit accurately', () => {
  const summary = summarizeApbdes([
    { fiscalYear: 2026, category: 'PENDAPATAN', subCategory: 'DD', label: 'Dana Desa', budgetAmount: 1000, realizedAmount: 800 },
    { fiscalYear: 2026, category: 'BELANJA', subCategory: 'Pembangunan', label: 'Jalan', budgetAmount: 900, realizedAmount: 650 },
    { fiscalYear: 2025, category: 'PENDAPATAN', subCategory: 'DD', label: 'Dana Desa 2025', budgetAmount: 950, realizedAmount: 950 },
  ], 2026);
  assert.equal(summary.fiscalYear, 2026);
  assert.equal(summary.pendapatan.realized, 800);
  assert.equal(summary.belanja.realized, 650);
  assert.equal(summary.surplusDeficit, 150);
  assert.deepEqual(summary.availableYears, [2026, 2025]);
});

test('WAHA notification helpers normalize Indonesian phone numbers and build status message', () => {
  assert.equal(normalizeWhatsappNumber('0812-3456-7890'), '6281234567890');
  assert.equal(normalizeWhatsappNumber('+62 813 1111 2222'), '6281311112222');
  const msg = buildLetterStatusMessage({
    villageName: 'Desa Sugihwaras',
    applicantName: 'Budi',
    letterType: 'SKTM',
    trackingCode: 'SRT-2611-ABC123',
    status: 'SELESAI',
    letterNumber: '401/001/35.22/XI/2026',
  });
  assert.ok(msg.includes('Desa Sugihwaras'));
  assert.ok(msg.includes('401/001/35.22/XI/2026'));
  assert.equal(slugifyTitle('Musyawarah Desa Tahun 2026!'), 'musyawarah-desa-tahun-2026');
});
