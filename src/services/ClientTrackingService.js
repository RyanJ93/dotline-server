'use strict';

import ClientTrackingInfo from '../DTOs/ClientTrackingInfo.js';
import HTTPRequestUtils from '../utils/HTTPRequestUtils.js';
import Geolocation from '../DTOs/GeoLocation.js';
import Logger from '../facades/Logger.js';
import UAParser from 'ua-parser-js';
import Service from './Service.js';
import axios from 'axios';

class ClientTrackingService extends Service {
    /**
     * Looks up location based on a given IP address.
     *
     * @param {string} ip
     *
     * @returns {Promise<?GeoLocation>}
     */
    async #lookupGeoLocationByIP(ip){
        const url = ClientTrackingService.GEO_LOCATION_SERVICE_ENDPOINT_URL.replace('[IP]', ip);
        const locationComponents = [], response = await axios.get(url);
        if ( response.status !== 200 || response.data.status !== 'success' ){
            Logger.getLogger().warn('Cannot get geo location for IP ' + ip);
            return null;
        }
        if ( response.data.city !== '' ){
            locationComponents.push(response.data.city);
        }
        if ( response.data.regionName !== '' ){
            locationComponents.push(response.data.regionName);
        }
        if ( response.data.country !== '' ){
            locationComponents.push(response.data.country);
        }
        return new Geolocation({
            text: locationComponents.join(', '),
            longitude: response.data.lon,
            latitude: response.data.lat
        });
    }

    /**
     * Returns client tracking information based on the given client request.
     *
     * @param {Request} HTTPRequest
     *
     * @returns {Promise<ClientTrackingInfo>}
     */
    async getClientTrackingInfoByHTTPRequest(HTTPRequest){
        const auParser = new UAParser(HTTPRequest.headers['user-agent'] ?? '');
        const IPAddress = HTTPRequestUtils.extractIPAddress(HTTPRequest);
        const location = await this.#lookupGeoLocationByIP(IPAddress);
        const browserName = ( auParser.getBrowser().name ?? '' );
        const OSName = ( auParser.getOS().name ?? '' );
        return new ClientTrackingInfo({
            userAgent: ( HTTPRequest.headers['user-agent'] ?? '' ),
            browserName: browserName,
            location: location,
            OSName: OSName,
            ip: IPAddress
        });
    }
}

/**
 * @constant {string}
 */
Object.defineProperty(ClientTrackingService, 'GEO_LOCATION_SERVICE_ENDPOINT_URL', {
    value: 'http://ip-api.com/json/[IP]',
    writable: false
});

export default ClientTrackingService;
