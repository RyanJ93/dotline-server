'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException.js';
import Injector from './Injector.js';

/**
 * @typedef DatabaseConfigObject
 *
 * @property {string} username
 * @property {string} password
 * @property {string} database
 * @property {string} host
 * @property {number} port
 */

/**
 * @typedef CredentialsConfigObject
 *
 * @property {string} username
 * @property {string} password
 * @property {string} email
 */

/**
 * @typedef ConfigObject
 *
 * @property {DatabaseConfigObject} database
 * @property {CredentialsConfigObject} credentials
 * @property {string} sentryDSN
 * @property {number} port
 * @property {boolean} visualDebug
 * @property {boolean} debug
 */

class ConfigInjector extends Injector {
    /**
     * @type {ConfigObject}
     */
    #config;

    /**
     * Sets the loaded configuration.
     *
     * @param {ConfigObject} config
     *
     * @throws {IllegalArgumentException} If an invalid configuration object is given.
     */
    #setConfig(config){
        if ( config === null || typeof config !== 'object' ){
            throw new IllegalArgumentException('Invalid config object.');
        }
        this.#config = config;
    }

    /**
     * The class constructor.
     *
     * @param {ConfigObject} config
     */
    constructor(config){
        super();

        this.#setConfig(config);
    }

    /**
     * Injects the loaded configuration.
     *
     * @returns {ConfigObject}
     */
    inject(){
        // TODO: Fix type
        return this.#config;
    }
}

export default ConfigInjector;
