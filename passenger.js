// 1. Initialize Supabase
const SUPABASE_URL = 'https://YOUR_PROJECT_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Initialize the Map (Default view over India)
const map = L.map('map').setView([22.5726, 88.3639], 6); // Starts near West Bengal

// Add the street map layer (Free OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Create an empty train marker
let trainMarker = null;
const infoText = document.getElementById('info');

// 3. Fetch Latest Location from Supabase
async function fetchTrainLocation() {
    const trainId = '12345'; // The ID we used in the collector app

    // Get the most recent update for this train
    const { data, error } = await supabase
        .from('live_updates')
        .select('*')
        .eq('train_id', trainId)
        .order('updated_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching data:", error);
        infoText.innerText = "Error loading live data.";
        return;
    }

    if (data && data.length > 0) {
        const latestLocation = data[0];
        const lat = latestLocation.latitude;
        const lng = latestLocation.longitude;
        const speedKmh = (latestLocation.speed * 3.6).toFixed(1);

        infoText.innerText = `Train is moving at ${speedKmh} km/h. Last updated: Just now.`;

        // Update map marker
        if (trainMarker) {
            trainMarker.setLatLng([lat, lng]);
        } else {
            // Create marker if it doesn't exist
            trainMarker = L.marker([lat, lng]).addTo(map);
            trainMarker.bindPopup(`<b>Train ${trainId}</b><br>Speed: ${speedKmh} km/h`).openPopup();
        }

        // Center map on the train
        map.setView([lat, lng], 14);
    } else {
        infoText.innerText = "No live data available for this train right now.";
    }
}

// Fetch immediately, then check for updates every 5 seconds
fetchTrainLocation();
setInterval(fetchTrainLocation, 5000);
