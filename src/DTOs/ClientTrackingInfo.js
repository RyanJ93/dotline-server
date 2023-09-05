'use strict';

/**
 * @typedef ClientTrackingInfoProperties
 *
 * @property {GeoLocation} location
 * @property {string} browserName
 * @property {string} userAgent
 * @property {string} OSName
 * @property {string} ip
 */

class ClientTrackingInfo {
    /**
     * @type {string}
     */
    #browserName;

    /**
     * @type {string}
     */
    #userAgent;

    /**
     * @type {GeoLocation}
     */
    #location;

    /**
     * @type {string}
     */
    #OSName;

    /**
     * @type {string}
     */
    #ip;

    /**
     * The class constructor.
     *
     * @param {ClientTrackingInfoProperties} properties
     */
    constructor(properties){
        this.#browserName = properties.browserName;
        this.#userAgent = properties.userAgent;
        this.#location = properties.location;
        this.#OSName = properties.OSName;
        this.#ip = properties.ip;
    }

    /**
     * Returns the tracked client's browser name.
     *
     * @returns {string}
     */
    getBrowserName(){
        return this.#browserName;
    }

    /**
     * Returns the tracked client's browser user-agent string.
     *
     * @returns {string}
     */
    getUserAgent(){
        return this.#userAgent;
    }

    /**
     * Returns the tracked client's location.
     *
     * @returns {GeoLocation}
     */
    getLocation(){
        return this.#location;
    }

    /**
     * Returns the tracked client's OS name.
     *
     * @returns {string}
     */
    getOSName(){
        return this.#OSName;
    }

    /**
     * Returns the tracked client's IP address.
     *
     * @returns {string}
     */
    getIP(){
        return this.#ip;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {ClientTrackingInfoProperties}
     */
    toJSON(){
        return {
            browserName: this.#browserName,
            location: this.#location,
            OSName: this.#OSName,
            ip: this.#ip
        };
    }
}

export default ClientTrackingInfo;
