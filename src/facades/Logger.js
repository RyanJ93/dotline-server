'use strict';

import Injector from './Injector.js';
import Facade from './Facade.js';

class Logger extends Facade {
    /**
     * Returns the logger instance.
     *
     * @returns {winston.Logger}
     */
    static getLogger(){
        return Injector.inject('logger');
    }
}

export default Logger;
