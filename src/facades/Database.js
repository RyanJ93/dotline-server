'use strict';

import Injector from './Injector.js';
import Facade from './Facade.js';

class Database extends Facade {
    /**
     * Returns the connection to the database.
     *
     * @returns {cassandra.Client}
     */
    static getConnection(){
        return Injector.inject('database');
    }

    /**
     * Runs a single query on the database.
     *
     * @param {string} query
     * @param {any[]} [params=[]]
     * @param {Object} [options={}]
     *
     * @returns {Promise<any[]>}
     */
    static async query(query, params = [], options = {}){
        Object.assign(options, { prepare: true });
        return await Database.getConnection().execute(query, params, options);
    }

    /**
     * Runs multiple queries as a single batch.
     *
     * @param {Object[]} queries
     * @param {Object} [options={}]
     *
     * @returns {Promise<any[]>}
     */
    static async batch(queries, options = {}){
        Object.assign(options, { prepare: true });
        return await Database.getConnection().batch(queries, options);
    }
}

export default Database;
