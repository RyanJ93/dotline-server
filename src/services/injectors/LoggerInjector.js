'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException.js';
import Injector from './Injector.js';
import winston from 'winston';

class LoggerInjector extends Injector {
    /**
     * @type {winston.Logger}
     */
    #logger;

    /**
     * Sets the logger instance.
     *
     * @param {winston.Logger} logger
     *
     * @throws {IllegalArgumentException} If an invalid logger instance is given.
     */
    #setLogger(logger){
        // TODO: check this.
        // if ( !( logger instanceof winston.Logger ) ){
        //     throw new IllegalArgumentException('Invalid logger instance.');
        // }
        this.#logger = logger;
    }

    /**
     * The class constructor.
     *
     * @param {winston.Logger} logger
     */
    constructor(logger){
        super();

        this.#setLogger(logger);
    }

    /**
     * Injects the logger instance.
     *
     * @returns {winston.Logger}
     */
    inject(){
        // TODO: Fix type.
        return this.#logger;
    }
}

export default LoggerInjector;
