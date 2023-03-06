'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException.js';
import cassandra from 'cassandra-driver';
import Injector from './Injector.js';

class DatabaseInjector extends Injector {
    /**
     * @type {?cassandra.Client}
     */
    #client = null;

    /**
     * Sets the database client instance.
     *
     * @param {cassandra.Client} client
     *
     * @throws {IllegalArgumentException} If an invalid database client is given.
     */
    #setClient(client){
        if ( !( client instanceof cassandra.Client ) ){
            throw new IllegalArgumentException('Invalid database client instance.');
        }
        this.#client = client;
    }

    /**
     * The class constructor.
     *
     * @param {cassandra.Client} client
     */
    constructor(client){
        super();

        this.#setClient(client);
    }

    /**
     * Injects the defined database client instance.
     *
     * @returns {?cassandra.Client}
     */
    inject(){
        // TODO: Fix type
        return this.#client;
    }
}

export default DatabaseInjector;
