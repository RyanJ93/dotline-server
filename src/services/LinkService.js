'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import OGProperties from '../DTOs/OGProperties.js';
import openGraphScraper from 'open-graph-scraper';
import Logger from '../facades/Logger.js';
import Service from './Service.js';

class LinkService extends Service {
    /**
     * Fetches Open Graph properties for a given link.
     *
     * @param {string} url
     *
     * @returns {Promise<?OGProperties>}
     *
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    async fetchLinkOGProperties(url){
        if ( url === '' || typeof url !== 'string' ){
            throw new IllegalArgumentException('Invalid URL.');
        }
        let result;
        try{
            result = await openGraphScraper({ url: url });
        }catch(ex){
            Logger.getLogger().info('Unable to fetch OG properties for URL ' + url);
            return null;
        }
        if ( result.error === true ){
            Logger.getLogger().info('Unable to fetch OG properties for URL ' + url);
            return null;
        }
        return OGProperties.makeFromOpenGraphScraperResult(result);
    }
}

export default LinkService;
