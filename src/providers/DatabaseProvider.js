'use strict';

import MisconfigurationException from '../exceptions/MisconfigurationException.js';
import DatabaseInjector from '../services/injectors/DatabaseInjector.js';
import InjectionManager from '../support/InjectionManager.js';
import Config from '../facades/Config.js';
import cassandra from 'cassandra-driver';
import Provider from './Provider.js';

/**
 * @typedef DatabaseCredentialsConfig
 *
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef DatabaseCloudConfig
 *
 * @property {string} secureConnectBundle
 */

/**
 * @typedef DatabaseConfig
 *
 * @property {string[]} contactPoints
 * @property {string} localDataCenter
 * @property {string} keyspace
 * @property {?DatabaseCredentialsConfig} credentials
 * @property {?DatabaseCloudConfig} cloud
 */

class DatabaseProvider extends Provider {
    /**
     * Returns database configuration.
     *
     * @returns {DatabaseConfig}
     *
     * @throws {MisconfigurationException} If no database configuration has been defined.
     */
    static #getDatabaseConfig(){
        const config = Config.getConfig();
        if ( typeof config.database !== 'object' || config.database === null ){
            throw new MisconfigurationException('No valid database configuration defined.');
        }
        return config.database;
    }

    /**
     * Performs database connection.
     *
     * @returns {Promise<void>}
     */
    async run(){
        const databaseConfig = DatabaseProvider.#getDatabaseConfig();
        const client = new cassandra.Client(databaseConfig);
        await client.connect();
        InjectionManager.getInstance().register('database', new DatabaseInjector(client));
    }
}

export default DatabaseProvider;
