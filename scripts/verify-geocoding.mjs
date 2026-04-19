import 'dotenv/config';
import { batchGeocode } from '../src/lib/geocoder.js';

async function runTests() {
  console.log("🚀 STARTING GEOCODING PIPELINE VERIFICATION\n");

  const testCases = [
    { 
      name: "Paris", 
      continent: "Europe",
      expectedSource: "GIS"
    },
    { 
      name: "UnknownPlace123", 
      continent: "Africa", 
      admRegion: "West Africa",
      expectedSource: "Regional Fallback"
    },
    {
      name: "Strait of Hormuz",
      continent: "Middle East",
      expectedSource: "GIS"
    }
  ];

  console.log(`[Test] Processing ${testCases.length} test scenarios...`);
  
  try {
    const results = await batchGeocode(testCases, 'GEOPOLITICAL');
    
    console.log("\n📊 TEST RESULTS:");
    console.log("------------------------------------------");
    
    results.forEach((res, i) => {
      const status = (res.lat !== 0 || res.lon !== 0) ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} | Input: ${res.name}`);
      console.log(`       -> Coords: ${res.lat}, ${res.lon}`);
      console.log(`       -> Source: ${res.geocodeSource}`);
      console.log(`       -> Group:  ${res.geoGroup || 'None'}`);
      console.log(`       -> Region: ${res.admRegion}`);
      console.log("------------------------------------------");
    });

  } catch (error) {
    console.error("❌ CRITICAL TEST FAILURE:", error.message);
  }
}

runTests().then(() => process.exit(0));
