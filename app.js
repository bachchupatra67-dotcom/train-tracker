// 1. Initialize Supabase
const SUPABASE_URL = 'https://lhsfeadlglxzqdihbdpw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoc2ZlYWRsZ2x4enFkaWhiZHB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NDU2MzcsImV4cCI6MjA5NDQyMTYzN30.tF9_JzHf3uro9QHb9AGn5GuJAxAS2hQkfF6WrnE_Fg0';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const trackBtn = document.getElementById('track-btn');
const statusText = document.getElementById('status');
let trackingId = null;

trackBtn.addEventListener('click', () => {
    if (trackingId) {
        // Stop tracking if already running
        navigator.geolocation.clearWatch(trackingId);
        trackingId = null;
        trackBtn.innerText = "Start Sharing Location";
        statusText.innerText = "Tracking stopped.";
        return;
    }

    if (!navigator.geolocation) {
        statusText.innerText = "Geolocation is not supported by your browser.";
        return;
    }

    statusText.innerText = "Requesting location permission...";
    
    // Start tracking
    trackingId = navigator.geolocation.watchPosition(
        handlePosition, 
        handleError, 
        { enableHighAccuracy: true, maximumAge: 0 }
    );

    trackBtn.innerText = "Stop Sharing Location";
    statusText.innerText = "Tracking active. Waiting for valid movement...";
});

async function handlePosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    const speed = position.coords.speed || 0; // Speed is in meters/second
    const trainId = trackBtn.getAttribute('data-train');

    // ANTI-MOCKING & VERIFICATION LOGIC
    // 1. Reject if accuracy is worse than 50 meters
    if (accuracy > 50) {
        console.log("Ignored: Poor accuracy", accuracy);
        return;
    }
    // 2. Reject if accuracy is suspiciously perfect (exactly 0)
    if (accuracy === 0) {
        console.log("Ignored: Suspicious accuracy (Mocking suspected)");
        return;
    }
    // 3. Reject if speed is less than 1.5 m/s (approx 5.4 km/h) - likely walking, not in train
    if (speed < 1.5) {
        statusText.innerText = `Train appears stopped or moving too slowly. (Speed: ${(speed * 3.6).toFixed(1)} km/h)`;
        return;
    }

    // If it passes all checks, push to Supabase
    statusText.innerText = `Sending live update... (Speed: ${(speed * 3.6).toFixed(1)} km/h)`;
    
    const { error } = await supabase
        .from('live_updates')
        .insert([
            { train_id: trainId, latitude: lat, longitude: lng, speed: speed }
        ]);

    if (error) {
        console.error("Supabase Error:", error);
        statusText.innerText = "Error sending data.";
    } else {
        statusText.innerText = `Location updated successfully! (Speed: ${(speed * 3.6).toFixed(1)} km/h)`;
    }
}

function handleError(error) {
    statusText.innerText = "Error getting location: " + error.message;
}
