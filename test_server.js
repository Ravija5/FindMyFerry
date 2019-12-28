let test = require('./test_request_module')
let http = require('http')

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('Hello World!')
    console.log('Hello')
    test.callApi()
}).listen(8080)