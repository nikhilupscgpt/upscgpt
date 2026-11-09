import fs from 'fs';

const data = JSON.parse(fs.readFileSync('/tmp/ne_10m_rivers.geojson', 'utf8'));

// Helper: simplify polyline to approx maxPoints using Ramer-Douglas-Peucker or uniform sampling
function samplePolyline(points, maxPoints = 250) {
  if (points.length <= maxPoints) return points;
  const step = (points.length - 1) / (maxPoints - 1);
  const sampled = [];
  for (let i = 0; i < maxPoints - 1; i++) {
    sampled.push(points[Math.round(i * step)]);
  }
  sampled.push(points[points.length - 1]);
  return sampled;
}

// Helper: convert [lng, lat] to [lat, lng] rounded to 4 decimals
function toLatLng(coords) {
  return coords.map(([lng, lat]) => [
    Math.round(lat * 10000) / 10000,
    Math.round(lng * 10000) / 10000
  ]);
}

const extractedRivers = {};

// 1. Narmada
const narmada = data.features.find(f => f.properties.name === 'Narmada');
if (narmada) {
  const coords = narmada.geometry.coordinates[0];
  // from Amarkantak [81.57, 22.75] to Gulf of Khambhat [73.13, 21.75]
  extractedRivers['narmada-river'] = samplePolyline(toLatLng(coords), 200);
}

// 2. Tapi
const tapi = data.features.find(f => f.properties.name === 'Tapi');
if (tapi) {
  const coords = tapi.geometry.coordinates[0];
  // from Betul [78.13, 21.70] to Surat [72.72, 21.14]
  extractedRivers['tapi-river'] = samplePolyline(toLatLng(coords), 150);
}

// 3. Godavari
const godavari = data.features.find(f => f.properties.name && f.properties.name.includes('God'));
if (godavari) {
  // Seg 0 is Trimbakeshwar [73.65, 20.01] to Rajahmundry [81.71, 16.31]
  // Seg 1 continues to Yanam delta mouth [82.34, 16.70]
  const seg0 = godavari.geometry.coordinates[0];
  const seg1 = godavari.geometry.coordinates[1];
  const full = [...seg0, ...seg1];
  extractedRivers['godavari-river'] = samplePolyline(toLatLng(full), 250);
}

// 4. Krishna
const krishnaFeatures = data.features.filter(f => f.properties.name === 'Krishna');
if (krishnaFeatures.length >= 2) {
  // krishnaFeatures[1].coordinates[0]: Mahabaleshwar [73.79, 17.99] to [78.99, 16.23]
  // krishnaFeatures[0].coordinates[0]: [78.99, 16.23] to [79.31, 16.57]
  // krishnaFeatures[1].coordinates[1]: [79.31, 16.57] to Hamsaladeevi [80.88, 16.01]
  const part1 = krishnaFeatures[1].geometry.coordinates[0];
  const part2 = krishnaFeatures[0].geometry.coordinates[0];
  const part3 = krishnaFeatures[1].geometry.coordinates[1];
  const full = [...part1, ...part2, ...part3];
  extractedRivers['krishna-river'] = samplePolyline(toLatLng(full), 250);
}

// 5. Cauvery
const cauveryFeatures = data.features.filter(f => f.properties.name === 'Cauvery');
if (cauveryFeatures.length >= 2) {
  // Cauvery 1 Seg 1 (62 pts): Talakaveri [75.66, 12.33] to [76.43, 12.51]
  // Cauvery 0 Seg 0 (13 pts): [76.43, 12.51] to [76.57, 12.42]
  // Cauvery 1 Seg 0 (75 pts): [76.57, 12.42] to [77.67, 11.97]
  // Cauvery 0 Seg 1 (15 pts): [77.67, 11.97] to [77.81, 11.81]
  // Cauvery 1 Seg 2 (66 pts): [77.81, 11.81] to [78.67, 10.86]
  // Cauvery 1 Seg 3 (8 pts) + Seg 4 (37 pts) to Poompuhar [79.84, 10.90]
  const c1_1 = cauveryFeatures[1].geometry.coordinates[1];
  const c0_0 = cauveryFeatures[0].geometry.coordinates[0];
  const c1_0 = cauveryFeatures[1].geometry.coordinates[0];
  const c0_1 = cauveryFeatures[0].geometry.coordinates[1];
  const c1_2 = cauveryFeatures[1].geometry.coordinates[2];
  const c1_4 = cauveryFeatures[1].geometry.coordinates[4];
  const full = [...c1_1, ...c0_0, ...c1_0, ...c0_1, ...c1_2, ...c1_4];
  extractedRivers['cauvery-river'] = samplePolyline(toLatLng(full), 200);
}

// 6. Mahanadi
const mahanadiFeatures = data.features.filter(f => f.properties.name && f.properties.name.includes('Mahäna'));
if (mahanadiFeatures.length >= 2) {
  // Mahanadi 1 Seg 1 (172 pts): Sihawa [80.62, 20.59] to [83.29, 21.69]
  // Mahanadi 0 Seg 0 (30 pts, reverse): [83.29, 21.69] to [83.85, 21.52] (Hirakud)
  // Mahanadi 1 Seg 0 (113 pts): [83.85, 21.52] to False Point / Paradeep [86.15, 20.14]
  const seg1 = mahanadiFeatures[1].geometry.coordinates[1];
  const seg0 = [...mahanadiFeatures[0].geometry.coordinates[0]].reverse();
  const seg2 = mahanadiFeatures[1].geometry.coordinates[0];
  const full = [...seg1, ...seg0, ...seg2];
  extractedRivers['mahanadi-river'] = samplePolyline(toLatLng(full), 200);
}

// 7. Yamuna
const yamuna = data.features.find(f => f.properties.name === 'Yamuna');
if (yamuna) {
  // Yamuna Seg 0 (150 pts): Yamunotri [78.33, 30.91] to Delhi [77.22, 28.69]
  // Yamuna Seg 2 (496 pts): Delhi [77.22, 28.69] to Prayagraj [81.90, 25.41]
  const seg0 = yamuna.geometry.coordinates[0];
  const seg2 = yamuna.geometry.coordinates[2];
  const full = [...seg0, ...seg2];
  extractedRivers['yamuna-river'] = samplePolyline(toLatLng(full), 250);
}

// 8. Ganga
const ganga = data.features.find(f => f.properties.name === 'Ganges');
if (ganga) {
  // Ganga Seg 0 (798 pts): Gaumukh [79.84, 30.88] past Haridwar, Kanpur, Prayagraj, Varanasi, Patna to Farakka / Bangladesh [89.08, 23.97]
  // Ganga Seg 1 (149 pts) + Seg 9 (87 pts): Farakka [87.93, 24.80] down Hooghly to Sagar Island [88.07, 22.23]
  // We can include the main stem through Farakka down to the delta mouth / Hooghly
  const seg0 = ganga.geometry.coordinates[0];
  extractedRivers['ganga-river'] = samplePolyline(toLatLng(seg0), 250);
}

// 9. Indus
const indusFeatures = data.features.filter(f => f.properties.name === 'Indus');
if (indusFeatures.length >= 2) {
  // Indus 1 Seg 1 (350 pts): Tibet/Ladakh border [79.43, 32.73] past Leh to Tarbela [72.78, 34.62]
  // Indus 0 Seg 0 (27 pts): [72.78, 34.62] to [72.70, 34.08]
  // Indus 1 Seg 0 (742 pts): [72.70, 34.08] down Punjab/Sindh to Arabian Sea [67.66, 24.10]
  const seg1 = indusFeatures[1].geometry.coordinates[1];
  const seg0 = indusFeatures[0].geometry.coordinates[0];
  const seg2 = indusFeatures[1].geometry.coordinates[0];
  const full = [...seg1, ...seg0, ...seg2];
  extractedRivers['indus-river'] = samplePolyline(toLatLng(full), 300);
}

console.log('--- Extracted Phase 1 Rivers ---');
Object.entries(extractedRivers).forEach(([slug, shape]) => {
  console.log(`${slug}: ${shape.length} points | Start: [${shape[0]}] | End: [${shape.slice(-1)[0]}]`);
});
