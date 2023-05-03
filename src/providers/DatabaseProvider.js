'use strict';

import MisconfigurationException from '../exceptions/MisconfigurationException.js';
import DatabaseInjector from '../services/injectors/DatabaseInjector.js';
import RedisInjector from '../services/injectors/RedisInjector.js';
import InjectionManager from '../support/InjectionManager.js';
import Config from '../facades/Config.js';
import cassandra from 'cassandra-driver';
import { createClient } from 'redis';
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
     *
     *
     * @returns {string}
     */
    static #getRedisConnectionURL(){
        const config = Config.getConfig();
        if ( typeof config.redis !== 'object' || config.redis === null ){
            throw new MisconfigurationException('No valid redis configuration defined.');
        }
        let url = 'redis://';
        if ( typeof config.redis?.username === 'string' && typeof config.redis?.password === 'string' ){
            url += config.redis?.username + ':' + config.redis?.password + '@';
        }
        url += ( config.redis?.hostname ?? '127.0.0.1' ) + ':';
        url += ( config.redis?.port ?? 6380 ) + '/';
        url += config.redis?.database ?? 0;
        return url;
    }

    /**
     * Performs database connection.
     *
     * @returns {Promise<void>}
     */
    async run(){
        const redisConnectionURL = DatabaseProvider.#getRedisConnectionURL();
        const databaseConfig = DatabaseProvider.#getDatabaseConfig();
        const client = new cassandra.Client(databaseConfig);
        await client.connect();
        const redisClient = createClient({ url: redisConnectionURL });
        await redisClient.connect();
        InjectionManager.getInstance().register('database', new DatabaseInjector(client));
        InjectionManager.getInstance().register('redis', new RedisInjector(redisClient));
    }
}

export default DatabaseProvider;
