'use strict';

import Injector from './Injector.js';

class RedisInjector extends Injector {
    /**
     * @type {?Object}
     */
    #client = null;

    /**
     * Sets the database client instance.
     *
     * @param {Object} client
     *
     * @throws {IllegalArgumentException} If an invalid database client is given.
     */
    #setClient(client){
        this.#client = client;
    }

    /**
     * The class constructor.
     *
     * @param {Object} client
     */
    constructor(client){
        super();

        this.#setClient(client);
    }

    /**
     * Injects the defined database client instance.
     *
     * @returns {?Object}
     */
    inject(){
        // TODO: Fix type
        return this.#client;
    }
}

export default RedisInjector;
