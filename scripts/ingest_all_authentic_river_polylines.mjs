import fs from 'fs';

const data = JSON.parse(fs.readFileSync('/tmp/ne_10m_rivers.geojson', 'utf8'));

// Helper: sample polyline down to maxPoints
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

const riverMap = {};

// 1. Narmada: Amarkantak [81.57, 22.75] -> Gulf of Khambhat [73.13, 21.75]
const narmada = data.features.find(f => f.properties.name === 'Narmada');
if (narmada) {
  riverMap['narmada-river'] = samplePolyline(toLatLng(narmada.geometry.coordinates[0]), 200);
}

// 2. Tapi: Betul [78.13, 21.70] -> Surat [72.72, 21.14]
const tapi = data.features.find(f => f.properties.name === 'Tapi');
if (tapi) {
  riverMap['tapi-river'] = samplePolyline(toLatLng(tapi.geometry.coordinates[0]), 150);
}

// 3. Godavari: Trimbakeshwar [73.65, 20.01] -> Bay of Bengal [82.34, 16.70]
const godavari = data.features.find(f => f.properties.name && f.properties.name.includes('God'));
if (godavari) {
  const full = [...godavari.geometry.coordinates[0], ...godavari.geometry.coordinates[1]];
  riverMap['godavari-river'] = samplePolyline(toLatLng(full), 250);
}

// 4. Krishna: Mahabaleshwar [73.79, 17.99] -> Hamsaladeevi [80.88, 16.01]
const krishna = data.features.filter(f => f.properties.name === 'Krishna');
if (krishna.length >= 2) {
  const full = [
    ...krishna[1].geometry.coordinates[0],
    ...krishna[0].geometry.coordinates[0],
    ...krishna[1].geometry.coordinates[1]
  ];
  riverMap['krishna-river'] = samplePolyline(toLatLng(full), 250);
}

// 5. Cauvery: Talakaveri [75.66, 12.33] -> Poompuhar [79.84, 10.90]
const cauvery = data.features.filter(f => f.properties.name === 'Cauvery');
if (cauvery.length >= 2) {
  const full = [
    ...cauvery[1].geometry.coordinates[1],
    ...cauvery[0].geometry.coordinates[0],
    ...cauvery[1].geometry.coordinates[0],
    ...cauvery[0].geometry.coordinates[1],
    ...cauvery[1].geometry.coordinates[2],
    ...cauvery[1].geometry.coordinates[4]
  ];
  riverMap['cauvery-river'] = samplePolyline(toLatLng(full), 200);
}

// 6. Mahanadi: Sihawa [80.62, 20.59] -> Paradeep [86.15, 20.14]
const mahanadi = data.features.filter(f => f.properties.name && f.properties.name.includes('Mahäna'));
if (mahanadi.length >= 2) {
  const full = [
    ...mahanadi[1].geometry.coordinates[1],
    ...[...mahanadi[0].geometry.coordinates[0]].reverse(),
    ...mahanadi[1].geometry.coordinates[0]
  ];
  riverMap['mahanadi-river'] = samplePolyline(toLatLng(full), 200);
}

// 7. Yamuna: Yamunotri [78.33, 30.91] -> Prayagraj [81.90, 25.41]
const yamuna = data.features.find(f => f.properties.name === 'Yamuna');
if (yamuna) {
  const full = [...yamuna.geometry.coordinates[0], ...yamuna.geometry.coordinates[2]];
  riverMap['yamuna-river'] = samplePolyline(toLatLng(full), 250);
}

// 8. Ganga: Gaumukh [79.84, 30.88] -> Bangladesh / Bay of Bengal [89.08, 23.97]
const ganga = data.features.find(f => f.properties.name === 'Ganges');
if (ganga) {
  riverMap['ganga-river'] = samplePolyline(toLatLng(ganga.geometry.coordinates[0]), 250);
}

// 9. Indus: Tibet/Ladakh border [79.43, 32.73] -> Arabian Sea [67.66, 24.10]
const indus = data.features.filter(f => f.properties.name === 'Indus');
if (indus.length >= 2) {
  const full = [
    ...indus[1].geometry.coordinates[1],
    ...indus[0].geometry.coordinates[0],
    ...indus[1].geometry.coordinates[0]
  ];
  riverMap['indus-river'] = samplePolyline(toLatLng(full), 300);
}

// 10. Jhelum: Verinag [75.36, 33.44] -> Trimmu / Chenab [72.13, 31.18]
const jhelum = data.features.filter(f => f.properties.name === 'Jhelum');
if (jhelum.length >= 2) {
  const full = [
    ...jhelum[1].geometry.coordinates[1],
    ...jhelum[0].geometry.coordinates[0],
    ...jhelum[1].geometry.coordinates[0],
    ...jhelum[0].geometry.coordinates[1],
    ...jhelum[1].geometry.coordinates[2]
  ];
  riverMap['jhelum-river'] = samplePolyline(toLatLng(full), 200);
}

// 11. Chenab: Tandi/Lahaul [77.43, 32.29] -> Panjnad [70.63, 29.03]
const chenab = data.features.find(f => f.properties.name === 'Chenab');
if (chenab) {
  const full = [...chenab.geometry.coordinates[0], ...chenab.geometry.coordinates[1]];
  riverMap['chenab-river'] = samplePolyline(toLatLng(full), 250);
}

// 12. Ravi: Bara Bangahal [76.82, 32.32] -> Chenab [71.77, 30.61]
const ravi = data.features.find(f => f.properties.name === 'Ravi');
if (ravi) {
  const full = [...ravi.geometry.coordinates[0], ...ravi.geometry.coordinates[1]];
  riverMap['ravi-river'] = samplePolyline(toLatLng(full), 200);
}

// 13. Beas: Beas Kund / Rohtang [77.19, 32.25] -> Harike [75.00, 31.17]
const beas = data.features.filter(f => f.properties.name === 'Beas');
if (beas.length >= 2) {
  const full = [
    ...beas[1].geometry.coordinates[0],
    ...beas[0].geometry.coordinates[0],
    ...beas[1].geometry.coordinates[1]
  ];
  riverMap['beas-river'] = samplePolyline(toLatLng(full), 150);
}

// 14. Sutlej: Rakshastal/Mansarovar [81.37, 30.75] -> Panjnad [71.02, 29.36]
const sutlej = data.features.filter(f => f.properties.name === 'Sutlej');
if (sutlej.length >= 2) {
  const full = [
    ...sutlej[1].geometry.coordinates[2],
    ...sutlej[0].geometry.coordinates[1],
    ...sutlej[1].geometry.coordinates[1],
    ...sutlej[0].geometry.coordinates[0],
    ...sutlej[1].geometry.coordinates[0]
  ];
  riverMap['sutlej-river'] = samplePolyline(toLatLng(full), 250);
}

// 15. Chambal: Janapav / Mhow [75.66, 22.47] -> Yamuna [79.24, 26.50]
const chambal = data.features.filter(f => f.properties.name === 'Chambal');
if (chambal.length >= 2) {
  const full = [
    ...chambal[1].geometry.coordinates[2],
    ...chambal[0].geometry.coordinates[1],
    ...chambal[1].geometry.coordinates[1],
    ...chambal[0].geometry.coordinates[0],
    ...chambal[1].geometry.coordinates[0]
  ];
  riverMap['chambal-river'] = samplePolyline(toLatLng(full), 200);
}

// 16. Betwa: Raisen [77.34, 23.24] -> Hamirpur / Yamuna [80.20, 25.91]
const betwa = data.features.find(f => f.properties.name === 'Betwa');
if (betwa) {
  riverMap['betwa-river'] = samplePolyline(toLatLng(betwa.geometry.coordinates[0]), 180);
}

// 17. Son: Amarkantak [82.04, 22.70] -> Patna / Ganga [84.87, 25.70]
const son = data.features.filter(f => f.properties.name === 'Son');
if (son.length > 0) {
  // Find the Indian Son river (lat ~22-26, lng ~81-85)
  const indianSon = son.find(f => {
    const coords = f.geometry.coordinates[0];
    return coords && coords[0][1] >= 20 && coords[0][1] <= 26 && coords[0][0] >= 80 && coords[0][0] <= 86;
  });
  if (indianSon) {
    riverMap['son-river'] = samplePolyline(toLatLng(indianSon.geometry.coordinates[0]), 200);
  }
}

// 18. Gandak: Tibet/Nepal border [83.96, 29.20] -> Sonpur / Ganga [85.18, 25.63]
const gandak = data.features.find(f => f.properties.name === 'Gandak');
if (gandak) {
  riverMap['gandak-river'] = samplePolyline(toLatLng(gandak.geometry.coordinates[0]), 180);
}

// 19. Ghaghara: Mapchachungo / Tibet [80.92, 30.55] -> Chhapra / Ganga [84.71, 25.74]
const ghaghara = data.features.find(f => f.properties.name && f.properties.name.includes('Ghäghara'));
if (ghaghara) {
  riverMap['ghaghara-river'] = samplePolyline(toLatLng(ghaghara.geometry.coordinates[0]), 200);
}

// 20. Kosi: Sapt Kosi [85.75, 28.55] -> Kursela / Ganga [87.75, 25.24]
const kosi = data.features.find(f => f.properties.name && f.properties.name.includes('Sapt'));
if (kosi) {
  riverMap['kosi-river'] = samplePolyline(toLatLng(kosi.geometry.coordinates[0]), 180);
}

// 21. Bhima: Bhimashankar [73.69, 19.00] -> Krishna [77.28, 16.41]
const bhima = data.features.find(f => f.properties.name === 'Bhima');
if (bhima) {
  riverMap['bhima-river'] = samplePolyline(toLatLng(bhima.geometry.coordinates[0]), 200);
}

// 22. Tungabhadra: Koodli [75.63, 13.71] -> Krishna / Alampur [78.23, 15.96]
const tungabhadra = data.features.filter(f => f.properties.name === 'Tungabhadra');
if (tungabhadra.length >= 2) {
  const full = [
    ...tungabhadra[1].geometry.coordinates[2],
    ...tungabhadra[0].geometry.coordinates[1],
    ...tungabhadra[1].geometry.coordinates[1],
    ...tungabhadra[0].geometry.coordinates[0],
    ...tungabhadra[1].geometry.coordinates[0]
  ];
  riverMap['tungabhadra-river'] = samplePolyline(toLatLng(full), 200);
}

// 23. Pennar: Nandi Hills [77.57, 13.40] -> Bay of Bengal [80.14, 14.56]
const pennar = data.features.find(f => f.properties.name === 'Penner');
if (pennar) {
  riverMap['pennar-river'] = samplePolyline(toLatLng(pennar.geometry.coordinates[0]), 180);
}

// 24. Palar: Kolar [77.90, 13.24] -> Bay of Bengal [80.14, 12.46]
const palar = data.features.find(f => f.properties.name === 'Palar');
if (palar) {
  riverMap['palar-river'] = samplePolyline(toLatLng(palar.geometry.coordinates[0]), 120);
}

// 25. Brahmani: Vedavyas [84.66, 22.26] -> Dhamra [86.94, 20.69]
const brahmani = data.features.find(f => f.properties.name === 'Brahmani');
if (brahmani) {
  riverMap['brahmani-river'] = samplePolyline(toLatLng(brahmani.geometry.coordinates[0]), 150);
}

// 26. Mahi: Vindhyas in MP [74.97, 22.72] -> Gulf of Khambhat [72.90, 22.27]
const mahi = data.features.find(f => f.properties.name === 'Mahi');
if (mahi) {
  // Mahi in dataset runs from mouth to source, so reverse it to run source to mouth
  const coords = [...mahi.geometry.coordinates[0]].reverse();
  riverMap['mahi-river'] = samplePolyline(toLatLng(coords), 150);
}

console.log(`Successfully prepared ${Object.keys(riverMap).length} authentic GIS river polylines!`);

// Load static-mapping-data.js and update matching river nodes
import { CURATED_MAPPING_NODES } from '../src/lib/static-mapping-data.js';

let updatedCount = 0;
CURATED_MAPPING_NODES.forEach(node => {
  if (riverMap[node.slug]) {
    node.shape = riverMap[node.slug];
    updatedCount++;
    console.log(`[UPDATED] ${node.slug} (${node.id}) -> ${node.shape.length} GIS points (Source: [${node.shape[0]}] -> Mouth: [${node.shape[node.shape.length-1]}])`);
  }
});

const fileHeader = `/**\n * Clean, single-feature GIS nodes for Static Mapping (India & World) and IR Mapping.\n * Every node has 100% verified PYQ IDs from mapping_pyqs (covering UPSC CSE 2011–2026 & CDS 2014–2023)\n * and bidirectional neural links to canonical Geography, Environment, and History Issue nodes.\n */\n\nexport const CURATED_MAPPING_NODES = `;

fs.writeFileSync(
  'src/lib/static-mapping-data.js',
  fileHeader + JSON.stringify(CURATED_MAPPING_NODES, null, 2) + ';\n'
);

console.log(`\nAll done! Successfully updated ${updatedCount} major Indian river nodes with high-density authentic GIS polylines!`);
