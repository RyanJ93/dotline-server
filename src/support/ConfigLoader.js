'use strict';

import MisconfigurationException from '../exceptions/MisconfigurationException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import fs from 'node:fs/promises';
import JSON5 from 'json5';

class ConfigLoader {
    /**
     * Returns the default config loader.
     *
         * @returns {ConfigLoader}
     */
    static getDefaultConfigLoader(){
        return new ConfigLoader(ConfigLoader.DEFAULT_CONFIG_FILE_PATH);
    }

    /**
     * @type {?string}
     */
    #configFilePath = null;

    /**
     * The class constructor.
     *
     * @param {string} configFilePath
     */
    constructor(configFilePath){
        this.setConfigFilePath(configFilePath);
    }

    /**
     * Sets the path to the configuration file.
     *
     * @param {string} configFilePath
     *
     * @returns {ConfigLoader}
     *
     * @throws {IllegalArgumentException} If an invalid file path is provided.
     */
    setConfigFilePath(configFilePath){
        if ( typeof configFilePath !== 'string' || configFilePath === '' ){
            throw new IllegalArgumentException('Invalid config file path.');
        }
        this.#configFilePath = configFilePath;
        return this;
    }

    /**
     * Returns the path to the configuration file.
     *
     * @returns {?string}
     */
    getConfigFilePath(){
        return this.#configFilePath;
    }

    /**
     * Loads configuration from the defined file.
     *
     * @returns {Promise<Object>}
     *
     * @throws {MisconfigurationException} If no configuration file is found.
     */
    async loadConfig(){
        try{
            const contents = await fs.readFile(this.#configFilePath);
            return JSON5.parse(contents.toString());
        }catch(ex){
            if ( ex.code === 'ENOENT' ){
                throw new MisconfigurationException('Configuration file not found in ' + this.#configFilePath);
            }
            throw ex;
        }
    }
}

/**
 * @constant {string}
 */
Object.defineProperty(ConfigLoader, 'DEFAULT_CONFIG_FILE_PATH', { value: './config/config.json', writable: false });

export default ConfigLoader;
