let express = require('express')
let axios = require('axios')
let cors = require('cors')
let config = require('./config')
let helper = require('./helper_modules/realtime_data_to_json')
let app = express()

// CORS stuff
app.use(cors({
    origin: '*'
}));

app.get('/api/map_key', async function(req, res) {
    res.status(200).json(config.MAPS_API_KEY)
})

// Endpoint to get stop locations
app.get('/api/stop_locations', async function(req, res) {
    let db = config.pool

    try {
        let data = await db.query('select stop_name, stop_lat, stop_lon from stops')
        let rows =  data['rows']
        
        res.status(200).json(rows)

        // Have nodejs directly send the data to frontend
        // res.send(rows) // or render a html
    } catch (error) {
        console.log(error)
        res.status(500).json("Server error")
    }
})

app.get('/api/ferries', async function(req, res) {
    try {
        let response = await axios({
                            method: 'get',
                            url: 'https://api.transport.nsw.gov.au/v1/gtfs/vehiclepos/ferries/sydneyferries?debug=true',
                            headers: {
                                'Authorization': 'apikey ' + config.API_KEY
                            }
                        })
        let ferries = await response.data
        let jsonFerries = helper.convertToJson(ferries)
        res.status(200).json(jsonFerries)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
})


// Server
let server = app.listen(8081, function () {
    var port = server.address().port
    console.log("App listening at http://127.0.0.1:%s", port)
})