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
    let ferryIcon = {
        url: "../images/ferry.png",
        scaledSize: new google.maps.Size(25, 25), // scaled size
    };

    try {
        // Fetching data from database
        let res = await getStopsAndLocations()

        // Iterating over stops and adding a marker at the stop location
        for (var i = 0; i < res.length; i++) {
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(res[i]['stop_lat'], res[i]['stop_lon']),
                icon: ferryIcon,
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

    try {
        let ferries = await getFerryRealtimePositions()
        console.log(ferries)
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

async function getFerryRealtimePositions() {
    try {
        let data = await fetch("http://127.0.0.1:8081/api/ferries")
        let response = await data.json()

        return response
    } catch (error) {
        console.log(error)
    }
}