'use strict';

class HTTPRequestUtils {
    /**
     * Extract the IP from a given HTTP request.
     *
     * @param {Request} HTTPRequest
     *
     * @returns {string}
     */
    static extractIPAddress(HTTPRequest){
        let IPAddress = HTTPRequest.headers['x-forwarded-for'] ?? '';
        if ( typeof IPAddress === 'string' && IPAddress !== '' ){
            // This header contains a list of IP addresses, use the last one.
            const IPAddressList = IPAddress.replaceAll(' ', '').split(',');
            IPAddress = IPAddressList.unshift() ?? '';
        }
        if ( IPAddress === '' || typeof IPAddress !== 'string' ){
            // For NGINX reverse proxy and Docker container.
            IPAddress = HTTPRequest.headers['x-real-ip'] ?? '';
            if ( IPAddress === '' || typeof IPAddress !== 'string' ){
                IPAddress = HTTPRequest.ip;
            }
        }
        return IPAddress;
    }
}

export default HTTPRequestUtils;
