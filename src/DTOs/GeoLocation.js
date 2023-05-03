'use strict';

import UDTImplementation from './UDTImplementation.js';

/**
 * @typedef GeoLocationUDTProperties
 *
 * @property {string} longitude
 * @property {string} latitude
 * @property {string} text
 */

/**
 * @typedef GeoLocationProperties
 *
 * @property {string} longitude
 * @property {string} latitude
 * @property {string} text
 */

class GeoLocation extends UDTImplementation {
    /**
     * Generates an instance of this class based on the given properties obtained from an UDT object from the database.
     *
     * @param {GeoLocationUDTProperties} properties
     *
     * @returns {GeoLocation}
     */
    static makeFromUDT(properties){
        return new GeoLocation(properties);
    }

    /**
     * @type {string}
     */
    #longitude;

    /**
     * @type {string}
     */
    #latitude;

    /**
     * @type {string}
     */
    #text;

    /**
     * The class constructor.
     *
     * @param {GeoLocationProperties} properties
     */
    constructor(properties){
        super(properties);

        this.#longitude = properties.longitude;
        this.#latitude = properties.latitude;
        this.#text = properties.text;
    }

    /**
     * Returns the position's longitude.
     *
     * @returns {string}
     */
    getLongitude(){
        return this.#longitude;
    }

    /**
     * Returns the position's latitude.
     *
     * @returns {string}
     */
    getLatitude(){
        return this.#latitude;
    }

    /**
     * Returns the position text description.
     *
     * @returns {string}
     */
    getText(){
        return this.#text;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {GeoLocationUDTProperties}
     */
    toJSON(){
        return {
            longitude: this.#longitude,
            latitude: this.#latitude,
            text: this.#text
        };
    }

    /**
     * Returns a database serializable representation of this class.
     *
     * @returns {GeoLocationUDTProperties}
     */
    toUDT(){
        return this.toJSON();
    }
}

export default GeoLocation;
