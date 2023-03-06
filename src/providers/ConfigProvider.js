'use strict';

import ConfigInjector from '../services/injectors/ConfigInjector.js';
import InjectionManager from '../support/InjectionManager.js';
import ConfigLoader from '../support/ConfigLoader.js';
import Provider from './Provider.js';

class ConfigProvider extends Provider {
    /**
     * Loads the configuration file into the application.
     *
     * @returns {Promise<void>}
     */
    async run(){
        const configLoader = ConfigLoader.getDefaultConfigLoader();
        const config = await configLoader.loadConfig();
        InjectionManager.getInstance().register('config', new ConfigInjector(config));
    }
}

export default ConfigProvider;
