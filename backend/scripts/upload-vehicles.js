const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_URL = 'http://localhost:4000/api/vehicles';

async function uploadVehicles() {
  try {
    // Read the JSON file
    const jsonContent = await fs.readFile(
      path.join(__dirname, '../scripts/modificaciones_new.json'),
      'utf8',
    );
    const data = JSON.parse(jsonContent);

    // Transform data into array of vehicles
    const vehicles = [];
    for (const brand in data) {
      for (const model in data[brand]) {
        vehicles.push(data[brand][model]);
      }
    }

    console.log(`Found ${vehicles.length} vehicles to upload`);

    // Upload vehicles sequentially
    for (const vehicle of vehicles) {
      try {
        const response = await axios.post(API_URL, vehicle);
        console.log(`✅ Successfully uploaded ${vehicle.name}`);
      } catch (error) {
        console.error(
          `❌ Error uploading ${vehicle.name}:`,
          error.response?.data || error.message,
        );
      }
      // Small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('Upload process completed');
  } catch (error) {
    console.error('Script error:', error);
  }
}

uploadVehicles();
