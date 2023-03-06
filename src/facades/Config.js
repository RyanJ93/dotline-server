'use strict';

import Injector from './Injector.js';
import Facade from './Facade.js';

class Config extends Facade {
    /**
     * Returns the loaded configuration.
     *
     * @returns {Object}
     */
    static getConfig(){
        return Injector.inject('config');
    }
}

export default Config;
