
// One of the most atrocious things I've ever written...

// Converts text/plain format of /ferries/sydneyferries response to valid JSON
exports.convertToJson = function(ferries) {
    ferries = ferries.replace(/entity/g, 'entity:')
    ferries = ferries.replace(/vehicle/g, 'vehicle:')
    ferries = ferries.replace(/trip /g, 'trip:')
    ferries = ferries.replace(/position/g, 'position:')
    ferries = ferries.replace(/header/g, 'header:')
    ferries = ferries.replace(/([A-Za-z\_]+):/g, `"$1":`)
    ferries = ferries.replace(/: ([A-Z\_]+)/g, ': "$1"')
    ferries = ferries.replace(/\n.*\n.*\n.*\n.*/, '')
    ferries = ferries.replace(/"header": {\n/, '')
    ferries = ferries.replace(/}\n"ent/g, `}\n},{"ent`)
    ferries = ferries.replace(`"ent`, `{"ent`)
    ferries = ferries + "}"
    ferries = ferries.replace(/\n/g, ",\n")
    ferries = ferries.replace(/{,/g, "{")
    ferries = ferries.replace(/\",\n}/g, `\"\n}`)
    ferries = ferries.replace(/"route_id": "([A-Za-z0-9\-]+)",\n/g, `"route_id": "$1"\n`)
    ferries = ferries.replace(/"speed": ([0-9\.]+),\n/g, `"speed": $1\n`)
    ferries = ferries.replace(/"license_plate": "([.]*)",\n/g, `"license_plate": "$1"\n`)
    ferries = ferries.replace(/},\n/g, `}\n`)
    ferries = ferries.replace(/}\n\s+\"/g, `},\n \"`)
    ferries = "[" + ferries + "]"
    
    return JSON.parse(ferries)
}