/* Gravity server config CDN artifacts */
var http = require('http'),
https = require('https');

const DEBUG_FLAG = false;
const CONFIG = {
    'log_level': 'warn',
    'http_port': 5050,
    'content_type_validate': true,
    'content_type': 'video/mp4',
    'content_type_re': /^video\/mp4/,
    'user_agent_default': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:91.0) Gecko/20100101 Firefox/91.0',
    'param_keys': {
        'targetUrl': 'u',
        'pageRef': 'p',
        'fileName': 'fn',
    }
}
const CONTENT_TYPE = CONFIG.content_type;
const CONTENT_TYPERE = CONFIG.content_type_re;
const HTTP_PORT = 5050;
var log = ( message , level ) => {
    level = level || CONFIG.log_level;
    var c = console.debug;
    switch( level ){
        case "info":
            c = console.info;
            break;
        case "warn":
            c = console.warn;
            break;
        case "error":
            c = console.error;
    }
    c(message);
}
var server = http.createServer(function(req, res) {
    // You can define here your custom logic to handle the request
    // and then proxy the request.
    if(req.method == "HEAD"){
        // health check
        res.writeHead(200,'OK');
        res.end();
    }
    else if(req.method == "GET"){
        var ref = req.headers.referer || "";
        var ua = req.headers['user-agent'] || CONFIG.user_agent_default;
        // get host and path from request
        const myURL = new URL(req.url, `http://${req.headers.host}`);
        
        // URL of target
        const target = myURL.searchParams.get( CONFIG.param_keys.targetUrl );
        // Referer to be set (default: Referer of Request)
        const pageRef = myURL.searchParams.get( CONFIG.param_keys.pageRef ) || ref;
        // Filename to be returned
        const fileName = myURL.searchParams.get( CONFIG.param_keys.fileName ) || false;
        // Content type to be returned
        //const contentType = myURL.searchParams.get('ct') || CONTENT_TYPE;
        
        // set up the response
        //res.setHeader('Access-Control-Allow-Origin', '*' );
        
        if(DEBUG_FLAG == true){
            console.log("Referer: " + JSON.stringify(ref));
            console.log("req.url is " + req.url);
            console.log(`user-agent: ${ua}`);
            console.log("url searchParams is " + myURL.searchParams.get('u'));
            console.log(`Target: ${target}`);
            console.log(`PageReferrer: ${pageRef}`);
            console.log(`File name: ${fileName}`);
            
            res.statusCode = 400;
            res.end('No more data');
            return;
        }
        // sanity checks
        // is the target a valid URL?
        // is the pageRef a sane value (i.e. a valid URL) (or empty?)
        // is the fileName a sane value? 
        // is contentType something reasonable? (maybe match /\w+\/[\w\d]{1,5}/)
        
        // run the request to the target server
        https.get(target , {headers: {'Referer': pageRef, 'User-Agent': ua}}, (remote) => {
            const { statusCode } = remote;
            const contentType = remote.headers['content-type'];
            
            let error;
            // Any 2xx status code signals a successful response but
            // here we're only checking for 200.
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
            } else if (!CONTENT_TYPERE.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                `Expected ${CONTENT_TYPERE} but received ${contentType}`);
            }
            if (error) {
                console.error(error.message);
                // Consume response data to free up memory
                remote.resume();
                return;
            }
            
            // set downloaded filename if requested
            var dispo = remote.headers['content-disposition'];
            if( fileName ){
                dispo = `attachment; filename="${fileName}"`;
            }
            res.setHeader('content-disposition', dispo);
            res.setHeader('content-type', remote.headers['content-type']);
            // pipe the remote's response into the local response
            remote.pipe(res);
        })
    } else {
        // method not supported
        res.writeHead(405, "Method not supported");
        res.end('No more data');
    }
});

console.log(`Listening on port ${CONFIG.http_port}`);
server.listen(CONFIG.http_port);