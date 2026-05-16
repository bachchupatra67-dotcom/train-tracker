async function getTimetable() {
    const trainNo = document.getElementById('train-no').value;
    const container = document.getElementById('route-container');
    const loading = document.getElementById('loading');

    if (!trainNo) {
        alert("Please enter a train number.");
        return;
    }

    // Clear previous results and show loading
    container.innerHTML = '';
    loading.style.display = 'block';

    // 1. Setup your RapidAPI credentials
    const apiKey = '6b06c79150msh1746447c4f588a6p181ffbjsn91f13673c5ea'; 
    const apiHost = 'indian-railway-irctc.p.rapidapi.com'; // Replace with your chosen API host

    // 2. Fetch data from RapidAPI
    const url = `https://${apiHost}/api/v1/getTrainSchedule?trainNo=${trainNo}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        loading.style.display = 'none';

        // 3. Check if the API returned valid data
        if (result.status === "success" && result.data.route) {
            
            // Loop through every station in the route array
            result.data.route.forEach(station => {
                const stationDiv = document.createElement('div');
                stationDiv.className = 'station';
                
                // Display Station Name, Arrival, and Departure times
                stationDiv.innerHTML = `
                    <h3>${station.station_name} (${station.station_code})</h3>
                    <p>Day ${station.day} | Distance: ${station.distance} km</p>
                    <p>
                        Arrives: <span class="time">${station.arrival_time}</span> | 
                        Departs: <span class="time">${station.departure_time}</span>
                    </p>
                `;
                container.appendChild(stationDiv);
            });
            
        } else {
            container.innerHTML = '<p>Train not found or data unavailable.</p>';
        }

    } catch (error) {
        console.error("Error fetching timetable:", error);
        loading.style.display = 'none';
        container.innerHTML = '<p>Error fetching timetable. Please try again.</p>';
    }
}
