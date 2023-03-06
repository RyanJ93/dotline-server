'use strict';

import InvalidInputException from '../exceptions/InvalidInputException.js';
import HTTPException from '../exceptions/HTTPException.js';
import Exception from '../exceptions/Exception.js';
import Logger from '../facades/Logger.js';
import App from '../facades/App.js';

/**
 * @callback middlewareErrorClosure Represents the closure function used to invoke the middleware.
 *
 * @param {Error} error
 * @param {Request} request
 * @param {Response} response
 * @param {Function} next
 *
 * @returns {Promise<void>}
 */

/**
 * @typedef ErrorResponseProperties
 *
 * @property {Date} timestamp
 * @property {string} status
 * @property {number} code
 * @property {string} [stacktrace]
 */

class ErrorHandlerMiddleware {
    /**
     * Returns the closure function used to invoke this middleware.
     *
     * @returns {middlewareErrorClosure}
     */
    static getClosure(){
        return async (error, request, response, next) => {
            return await ( new this().handle(error, request, response, next) );
        };
    }

    /**
     * Sets the response properties according to the given error type.
     *
     * @param {Error} error
     * @param {ErrorResponseProperties} responseProperties
     */
    static #setResponsePropertiesByError(error, responseProperties){
        if ( error instanceof InvalidInputException ){
            responseProperties.errors = error.getErrorMessageBag().getAll();
            responseProperties.status = 'ERR_INVALID_FORM';
        }else if ( error instanceof HTTPException ){
            responseProperties.status = error.getStatus();
            responseProperties.code = error.getCode();
        }else if ( error instanceof Exception ){
            responseProperties.status = error.getStatus();
        }
    }

    /**
     * Builds and sends the error response.
     *
     * @param {Error} error
     * @param {Request} request
     * @param {Response} response
     * @param {Function} next
     *
     * @returns {Promise<void>}
     */
    async handle(error, request, response, next){
        let responseProperties = { timestamp: new Date(), status: 'ERROR', code: 400 }, HTTPStatusCode = 400;
        ErrorHandlerMiddleware.#setResponsePropertiesByError(error, responseProperties);
        Logger.getLogger().error(error);
        if ( App.getDebug() ){
            responseProperties.stacktrace = error.stack;
        }
        response.status(HTTPStatusCode).send(responseProperties);
    }
}

export default ErrorHandlerMiddleware;
