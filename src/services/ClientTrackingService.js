'use strict';

import ClientTrackingInfo from '../DTOs/ClientTrackingInfo.js';
import Geolocation from '../DTOs/GeoLocation.js';
import Logger from '../facades/Logger.js';
import UAParser from 'ua-parser-js';
import Service from './Service.js';
import axios from 'axios';

class ClientTrackingService extends Service {
    async #lookupGeoLocationByIP(ip){
        const url = 'http://ip-api.com/json/' + ip, locationComponents = [];
        const response = await axios.get(url);
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

    async getClientTrackingInfoByHTTPRequest(HTTPRequest){
        const auParser = new UAParser(HTTPRequest.headers['user-agent'] ?? '');
        const browserName = ( auParser.getBrowser().name ?? '' ), OSName = ( auParser.getOS().name ?? '' );
        const location = await this.#lookupGeoLocationByIP(HTTPRequest.ip);
        return new ClientTrackingInfo({
            browserName: browserName,
            ip: HTTPRequest.ip,
            location: location,
            OSName: OSName,
        });
    }
}

export default ClientTrackingService;
