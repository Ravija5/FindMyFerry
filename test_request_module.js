let axios = require('axios')
let config = require('./config')

exports.callApi = async function(req, res) {
    let API_KEY = config.API_KEY
    
    try {
        let response = await axios({
                            method: 'get',
                            url: 'https://api.transport.nsw.gov.au/v1/tp/trip/',
                            params: {
                                outputFormat: 'rapidJSON',
                                coordOutputFormat: 'EPSG%3A4326',
                                depArrMacro: 'dep',
                                itdDate: '20191230',
                                itdTime: '1640',
                                type_origin: 'any',
                                name_origin: '211033',
                                type_destination: 'any',
                                name_destination: '2000225',
                                calcNumberOfTrips: 6,
                                excludedMeans: 'checkbox',
                                exclMOT_1: '1',
                                exclMOT_4: '1',
                                exclMOT_5: '1',
                                exclMOT_7: '1',
                                exclMOT_11: '1',
                                TfNSWTR: 'true',
                                version: '10.2.1.42',
                            }, 
                            headers: {
                                'Authorization': 'apikey ' + API_KEY
                            }
                        })
        let data = await response.data
        data['journeys'].map(j => {
            console.log(j['legs'])
        })
    } catch (error) {
        console.log(error)
    }
}