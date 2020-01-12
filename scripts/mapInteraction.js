let map
let mapInteractionScriptTag = document.createElement('script');

fetch("http://127.0.0.1:8081/api/map_key")
.then(res => {
    return res.json()
})
.then(MAPS_API_KEY => {
    mapInteractionScriptTag.setAttribute('src','https://maps.googleapis.com/maps/api/js?key='+MAPS_API_KEY+'&callback=initMap');
    document.head.appendChild(mapInteractionScriptTag)
})

// Function which initialises Map 
async function initMap() {
    // Map properties 
    // (refer to https://developers.google.com/maps/documentation/javascript/controls
    // and https://developers.google.com/maps/documentation/javascript/events)
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -33.85, lng: 151.2},
        zoom: 12,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        streetViewControl: false,
        fullscreenControl: false
    });

    // Properties for ferry icon
    let stopIcon = {
        url: "../images/ferry.png",
        scaledSize: new google.maps.Size(25, 25), // scaled size
    }

    // Icon styles need to be discussed (color, size, etc.)
    // Ferry Icon for ferries with bearing between 0-179
    let ferryIconDefault = {
        path: `M 2.00,44.00
        C 6.00,44.00 6.00,46.00 10.00,46.00
          14.00,46.00 14.00,44.00 18.00,44.00M 18.00,44.00
        C 22.00,44.00 22.00,46.00 26.00,46.00
          30.00,46.00 30.00,44.00 34.00,44.00M 34.00,44.00
        C 38.00,44.00 38.00,46.00 42.00,46.00
          46.00,46.00 46.00,44.00 50.00,44.00M 50.00,44.00
        C 54.00,44.00 54.00,46.00 58.00,46.00
          58.06,46.00 58.12,46.00 58.19,46.00
          59.57,46.00 60.88,45.64 62.00,45.00M 52.00,30.00
        C 52.00,30.00 36.92,30.00 36.92,30.00
          36.92,30.00 31.88,22.00 31.88,22.00M 54.82,44.44
        C 54.82,44.44 62.93,36.30 62.93,36.30
          62.93,36.30 62.40,34.34 60.78,32.98
          60.78,32.98 52.00,30.00 52.00,30.00
          52.00,30.00 46.00,22.00 46.00,22.00
          46.00,22.00 22.00,22.00 22.00,22.00
          22.00,22.00 28.00,32.00 28.00,32.00
          28.00,32.00 3.00,32.00 3.00,32.00
          3.00,32.00 9.00,46.00 9.00,46.00`,
        anchor: new google.maps.Point(25,25),
        strokeWeight: 1,
        fillOpacity: 1,
        fillColor: '#FF5850',
        scale: .45,
        rotation: 0
    }

    // Ferry Icon for ferries with bearing between 180-359
    let ferryIconMirror = {
        path: `M 62.00,44.00
        C 58.00,44.00 58.00,46.00 54.00,46.00
          50.00,46.00 50.00,44.00 46.00,44.00M 46.00,44.00
        C 42.00,44.00 42.00,46.00 38.00,46.00
          34.00,46.00 34.00,44.00 30.00,44.00M 30.00,44.00
        C 26.00,44.00 26.00,46.00 22.00,46.00
          18.00,46.00 18.00,44.00 14.00,44.00M 14.00,44.00
        C 10.00,44.00 10.00,46.00 6.00,46.00
          5.94,46.00 5.88,46.00 5.81,46.00
          4.43,46.00 3.12,45.64 2.00,45.00M 12.00,30.00
        C 12.00,30.00 27.08,30.00 27.08,30.00
          27.08,30.00 32.12,22.00 32.12,22.00M 9.18,44.44
        C 9.18,44.44 1.07,36.30 1.07,36.30
          1.07,36.30 1.60,34.34 3.22,32.98
          3.22,32.98 12.00,30.00 12.00,30.00
          12.00,30.00 18.00,22.00 18.00,22.00
          18.00,22.00 42.00,22.00 42.00,22.00
          42.00,22.00 36.00,32.00 36.00,32.00
          36.00,32.00 61.00,32.00 61.00,32.00
          61.00,32.00 55.00,46.00 55.00,46.00`,
        anchor: new google.maps.Point(25,25),
        strokeWeight: 1,
        fillOpacity: 1,
        fillColor: '#FF5850',
        scale: .45,
        rotation: 0
    }

    // TODO - Needs to be more concise, well named variable (use map perhaps?)
    // Stops and their Locations
    try {
        // Fetching stops data from database
        let res = await getStopsAndLocations()

        // Iterating over stops and adding a marker at the stop location
        for (var i = 0; i < res.length; i++) {
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(res[i]['stop_lat'], res[i]['stop_lon']),
                icon: stopIcon,
                title: res[i]['stop_name'],
                id: res[i]['stop_name'],
                map: map
            })

            // Testing function - shows which stop was clicked in console
            marker.addListener('click', function() { console.log(marker.id) })
        }
    } catch (error) {
        console.log(error)
    }

    // Ferries and their Locations
    try {
        // Fetching ferry positions
        let ferries = await getFerryRealtimePositions()
        console.log(ferries)

        ferries.map(f => {
            ferryPos = f['entity']['vehicle']['position']
            let ferryIcon

            // Setting correct ferry icon based on bearing
            if (ferryPos['bearing'] >= 0 && ferryPos['bearing'] <= 179) { 
                ferryIconDefault.rotation = ferryPos['bearing'] - 90
                ferryIcon = ferryIconDefault
            }
            else {
                ferryIconMirror.rotation = ferryPos['bearing'] - 270
                ferryIcon = ferryIconMirror
            }

            // Adding ferry marker to map
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(ferryPos['latitude'], ferryPos['longitude']),
                icon: ferryIcon,
                title: f['entity']['vehicle']['vehicle']['label'],
                id: f['entity']['vehicle']['vehicle']['label'],
                map: map
            })
        })

    } catch (error) {
        console.log(error)
    }
}


// Helper functions

// Fetches stop location data from database
async function getStopsAndLocations() {
    try {
        let data = await fetch("http://127.0.0.1:8081/api/stop_locations")
        let response = await data.json()
        
        return response
    } catch (error) {
        console.log(error)
    }
}

// Fetches ferry realtime positions
async function getFerryRealtimePositions() {
    try {
        let data = await fetch("http://127.0.0.1:8081/api/ferries")
        let response = await data.json()

        return response
    } catch (error) {
        console.log(error)
    }
}