'use strict';

import NotCallableException from '../exceptions/NotCallableException.js';
import RuntimeException from '../exceptions/RuntimeException.js';

/**
 * @callback middlewareClosure Represents the closure function used to invoke the middleware.
 *
 * @param {Request} request
 * @param {Response} response
 * @param {Function} next
 *
 * @returns {Promise<void>}
 */

/**
 * @abstract
 */
/* abstract */ class Middleware {
    /**
     * Returns the closure function used to invoke this middleware.
     *
     * @returns {middlewareClosure}
     */
    static getClosure(){
        return async (request, response, next) => {
            return await ( new this().handle(request, response, next) );
        };
    }

    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        if ( this.constructor === Middleware ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     * Implements the middleware logic.
     *
     * @param {Request} request
     * @param {Response} response
     * @param {Function} next
     *
     * @returns {Promise<void>}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    async handle(request, response, next){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }
}

export default Middleware;
