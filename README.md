# gravity

NodeJS utility servers

## gravity-generic.js

Generic gravity server designed to pull a resource from a remote server and deliver it to the client, customized to the client's request.

### Server configuration

Configuration is performed via the `CONFIG` const at the head of the file.

```javascript
const CONFIG = {
    'log_level': 'warn', 
    // Default HTTP listen port
    'http_port': 5050,
    // Validate content type header from the remote resource
    'content_type_validate': true,
    // String content type to match to the remote resource
    'content_type': 'video/mp4',
    // RegExp to match against content type of the remote resource
    'content_type_re': /^video\/mp4/,
    // Fallback user agent (default is client requestor)
    'user_agent_default': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:91.0) Gecko/20100101 Firefox/91.0',
    // Client configuration URL parameter keys
    'param_keys': {
        // URL of the remote resource
        'targetUrl': 'u',
        // Referer for the request to the remote resource
        'pageRef': 'p',
        // File name to be sent back to the client 
        'fileName': 'fn',
    }
}
```

### Client runtime configuration options

Runtime configuration is performed via URL search parameters. The parameter keys are specified in the server config setting `param_keys`:

#### `targetUrl`

URL of the remote resource to be retrieved and sent back to the client.

#### `pageRef`

Referer which will be provided in the request to the remote resource. Useful if you need to specify a referer *different* than the one you're linking from.

#### `fileName`

File name to be sent back to the client.

**NOTE:** specifying a value here will cause the `Content-Disposition: attachment` header to be sent in the response to the client. In most/all browsers, this will trigger a download rather than loading the content in the browser environment directly.

### Example

Examples coming soon
