'use strict';

import ProviderManager from '../support/ProviderManager.js';
import Facade from './Facade.js';
import Logger from './Logger.js';

class App extends Facade {
    /**
     * @type {boolean}
     */
    static #debug = false;

    /**
     * Sets if debug should be enabled or not.
     *
     * @param {boolean} debug
     */
    static setDebug(debug){
        App.#debug = debug === true;
    }

    /**
     * Returns if debug has been turned on.
     *
     * @returns {boolean}
     */
    static getDebug(){
        return App.#debug;
    }

    /**
     * Bootstrap the application and runs all the registered providers.
     *
     * @param {boolean} [silent=false]
     *
     * @returns {Promise<void>}
     */
    static async bootstrap(silent = false){
        if ( silent !== true ){
            console.log('Bootstrapping application...');
        }
        await ProviderManager.getInstance().runProviders();
        process.emit('applicationReady');
        if ( silent !== true ){
            console.log('Application started!');
        }
    }

    /**
     * Handles an uncaught error.
     *
     * @param {Error} error
     */
    static handleFatalError(error){
        const logger = Logger.getLogger();
        if ( logger === null ){
            return console.error(error);
        }
        logger.error(error.message + '\n' + error.stack);
    }

    /**
     * Shuts the application down.
     */
    static shutdown(){
        console.log('Shutting down the application...');
        process.emit('applicationShutdown');
        console.log('Application stopped!');
        process.exit();
    }
}

export default App;
