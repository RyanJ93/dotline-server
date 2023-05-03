'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import UDTImplementation from './UDTImplementation.js';

/**
 * @typedef HMACSigningParametersUDTProperties
 *
 * @property {string} hash_name
 */

/**
 * @typedef HMACSigningParametersProperties
 *
 * @property {string} hashName
 */

class HMACSigningParameters extends UDTImplementation {
    /**
     * Generates an instance of this class based on the given properties obtained from an UDT object from the database.
     *
     * @param {HMACSigningParametersUDTProperties} properties
     *
     * @returns {HMACSigningParameters}
     *
     * @throws {IllegalArgumentException} If an invalid properties object is given.
     */
    static makeFromUDT(properties){
        if ( properties === null || typeof properties !== 'object' ){
            throw new IllegalArgumentException('Invalid properties object.');
        }
        return new HMACSigningParameters({
            hashName: properties.hash_name
        });
    }

    /**
     * Generates an instance of this class based on the fields sent thought a given HTTP request.
     *
     * @param {Request} request
     * @param {string} [prefix=""]
     *
     * @returns {HMACSigningParameters}
     *
     * @throws {IllegalArgumentException} If an invalid prefix is given.
     */
    static makeFromHTTPRequest(request, prefix = ''){
        if ( prefix === null || typeof prefix !== 'string' ){
            throw new IllegalArgumentException('Invalid prefix.');
        }
        return new HMACSigningParameters({
            hashName: request.body[prefix + 'HashName']
        });
    }

    /**
     * @type {string}
     */
    #hashName;

    /**
     * The class constructor.
     *
     * @param {HMACSigningParametersProperties} properties
     */
    constructor(properties){
        super(properties);

        this.#hashName = properties.hashName;
    }

    /**
     * Returns the name of the hashing to use in HMAC hashing process.
     *
     * @returns {string}
     */
    getHashName(){
        return this.#hashName;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {HMACSigningParametersProperties}
     */
    toJSON(){
        return {
            hashName: this.#hashName
        };
    }

    /**
     * Returns a database serializable representation of this class.
     *
     * @returns {HMACSigningParametersUDTProperties}
     */
    toUDT(){
        return {
            hash_name: this.#hashName
        };
    }
}

export default HMACSigningParameters;
