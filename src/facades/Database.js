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
    static query(query, params = [], options = {}){
        Object.assign(options, { prepare: true });
        return Database.getConnection().execute(query, params, options);
    }
}

export default Database;
