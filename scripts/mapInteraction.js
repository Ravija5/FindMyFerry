let map
let mapInteractionScriptTag = document.createElement('script');
let ferryMarkers = {} // Object to hold current ferry markers

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
        center: {lat: -33.85, lng: 151.15},
        zoom: 12,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        options: {
          gestureHandling: 'greedy'
        },  // To disable ctrl+scroll zooming (which automatically appears if there's another html element alongside map) 
        streetViewControl: false,
        fullscreenControl: false
    });

    // Properties for ferry icon
    let stopIcon = {
        url: "../images/ferry.png",
        scaledSize: new google.maps.Size(22, 22), // scaled size
    }

    // Stops and their Locations
    try {
        // Fetching stops data from database
        let stops = await getStopsAndLocations()

        // Iterating over stops and adding a marker at the stop location
        stops.map(stop => {
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(stop['stop_lat'], stop['stop_lon']),
                icon: stopIcon,
                title: stop['stop_name'],
                id: stop['stop_name'],
                map: map
        	})

            // Testing function - shows which stop was clicked in console
            marker.addListener('click', function() { console.log(marker.id) })
		})
    } catch (error) {
        console.log(error)
	}
	
	// Show Ferries at their positions
	displayFerries()
}

async function displayFerries() {
	try {
		// List holding up-to-date trip IDs (for use in removing markers for completed ferries)
		let tripIdsList = []

        // Fetching ferry positions
        let ferries = await getFerryRealtimePositions()
		// console.log(ferries)

        ferries.map(f => {
			let ferryPos = f['entity']['vehicle']['position']
			let tripId = f['entity']['vehicle']['trip']['trip_id']
			let ferryLabel = f['entity']['vehicle']['vehicle']['label']
			
			if (!(tripIdsList.includes(tripId))) { tripIdsList.push(tripId) }
			// Get correct ferry icon
			let ferryIcon = getFerryIcon(ferryPos['bearing'])
			// Creating new ferry marker
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(ferryPos['latitude'], ferryPos['longitude']),
                icon: ferryIcon,
                title: ferryLabel,
                id: tripId
			})
			
			// Checking if ferry already exists on map
			// If yes, only update it's position and bearing
			// If no, add a new marker on map
			if (tripId in ferryMarkers) {
				// Get correct ferry icon according to new bearing
				currFerry = ferryMarkers[tripId]
				ferryIcon = getFerryIcon(ferryPos['bearing'])

				// Set proper co-ordinates and icon
				// currFerry.setPosition(new google.maps.LatLng(ferryPos['latitude'], ferryPos['longitude']))
				let diffLat = (ferryPos['latitude'] - currFerry.position.lat()) / 100
				let diffLng = (ferryPos['longitude'] - currFerry.position.lng()) / 100
				currFerry.setIcon(ferryIcon)

				// Update ferry position (smoothly)
				moveFerry(0, tripId, currFerry.position.lat(), currFerry.position.lng(), diffLat, diffLng)
			}
			else { 
				ferryMarkers[tripId] = marker
				marker.addListener('click', function() { console.log(marker.id) })
				marker.setMap(map)
			}
		})

		// Removing ferry markers corresponding to completed ferry trips
		for (let trip in ferryMarkers) {
			if (!tripIdsList.includes(trip)) {
				ferryMarkers[trip].setMap(null)
				delete ferryMarkers[trip]
			}
		}
		tripIdsList = []
		
    } catch (error) {
        console.log(error)
	} 
	finally {
		setTimeout(displayFerries, 10000)
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

// Returns ferry icon according to bearing
function getFerryIcon(bearing) {
	let ferryIconFacingEast = {
		path: getFerrySvgFacingEast(),
		anchor: new google.maps.Point(25,25),
		strokeWeight: 1,
		fillOpacity: 1,
		fillColor: '#FF5850',
		scale: .45,
		rotation: 0
	}
	
	// Ferry Icon for ferries with bearing between 180-359
	let ferryIconFacingWest = {
		path: getFerrySvgFacingWest(),
		anchor: new google.maps.Point(25,25),
		strokeWeight: 1,
		fillOpacity: 1,
		fillColor: '#FF5850',
		scale: .45,
		rotation: 0
	}

	// Setting ferry icon based on bearing
	if (bearing >= 0 && bearing <= 179) { 
		ferryIconFacingEast.rotation = bearing
		ferryIcon = ferryIconFacingEast
	}
	else {
		ferryIconFacingWest.rotation = bearing
		ferryIcon = ferryIconFacingWest
	}

	return ferryIcon
}


// SVG Helper Functions
function getFerrySvgFacingEast() {
  return `M 44.00,62.00
  C 44.00,58.00 46.00,58.00 46.00,54.00
    46.00,50.00 44.00,50.00 44.00,46.00M 44.00,46.00
  C 44.00,42.00 46.00,42.00 46.00,38.00
    46.00,34.00 44.00,34.00 44.00,30.00M 44.00,30.00
  C 44.00,26.00 46.00,26.00 46.00,22.00
    46.00,18.00 44.00,18.00 44.00,14.00M 44.00,14.00
  C 44.00,10.00 46.00,10.00 46.00,6.00
    46.00,5.94 46.00,5.88 46.00,5.81
    46.00,4.43 45.64,3.12 45.00,2.00M 30.00,12.00
  C 30.00,12.00 30.00,27.08 30.00,27.08
    30.00,27.08 22.00,32.12 22.00,32.12M 44.44,9.18
  C 44.44,9.18 36.30,1.07 36.30,1.07
    36.30,1.07 34.34,1.60 32.98,3.22
    32.98,3.22 30.00,12.00 30.00,12.00
    30.00,12.00 22.00,18.00 22.00,18.00
    22.00,18.00 22.00,42.00 22.00,42.00
    22.00,42.00 32.00,36.00 32.00,36.00
    32.00,36.00 32.00,61.00 32.00,61.00
    32.00,61.00 46.00,55.00 46.00,55.00`
}

function getFerrySvgFacingWest() {
  return `M 20.00,62.00
  C 20.00,58.00 18.00,58.00 18.00,54.00
    18.00,50.00 20.00,50.00 20.00,46.00M 20.00,46.00
  C 20.00,42.00 18.00,42.00 18.00,38.00
    18.00,34.00 20.00,34.00 20.00,30.00M 20.00,30.00
  C 20.00,26.00 18.00,26.00 18.00,22.00
    18.00,18.00 20.00,18.00 20.00,14.00M 20.00,14.00
  C 20.00,10.00 18.00,10.00 18.00,6.00
    18.00,5.94 18.00,5.88 18.00,5.81
    18.00,4.43 18.36,3.12 19.00,2.00M 34.00,12.00
  C 34.00,12.00 34.00,27.08 34.00,27.08
    34.00,27.08 42.00,32.12 42.00,32.12M 19.56,9.18
  C 19.56,9.18 27.70,1.07 27.70,1.07
    27.70,1.07 29.66,1.60 31.02,3.22
    31.02,3.22 34.00,12.00 34.00,12.00
    34.00,12.00 42.00,18.00 42.00,18.00
    42.00,18.00 42.00,42.00 42.00,42.00
    42.00,42.00 32.00,36.00 32.00,36.00
    32.00,36.00 32.00,61.00 32.00,61.00
    32.00,61.00 18.00,55.00 18.00,55.00`
}

// Moves ferry marker smoothly to latest position
function moveFerry(i, tripId, currLat, currLng, diffLat, diffLng) {
	currLat += diffLat
	currLng += diffLng
	ferryMarkers[tripId].setPosition(new google.maps.LatLng(currLat, currLng))

	if (i != 100) {
		i++;
		setTimeout(moveFerry.bind(this, i, tripId, currLat, currLng, diffLat, diffLng), 50)
	}
}