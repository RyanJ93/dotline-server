'use strict';

import RuntimeException from '../exceptions/RuntimeException.js';

/**
 * @callback controllerClosure Represents the closure function used to invoke the given MVC controller.
 *
 * @param {Request} request
 * @param {Response} response
 *
 * @returns {Promise<void>}
 */

/**
 * @abstract
 */
/* abstract */ class Controller {
    /**
     * Returns the closure function used to invoke the given MVC controller.
     *
     * @param {string} methodName
     *
     * @returns {controllerClosure}
     */
    static getClosure(methodName){
        return async (request, response) => {
            const controller = new this(request, response);
            return await controller[methodName]();
        };
    }

    /**
     * @type {Response}
     *
     * @protected
     */
    _response = null;

    /**
     * @type {Request}
     *
     * @protected
     */
    _request = null;

    /**
     * Returns to the client a success response.
     *
     * @param {number} [code=200]
     * @param {string} [status=SUCCESS]
     * @param {?Object} [additionalFields]
     *
     * @protected
     */
    _sendSuccessResponse(code = 200, status = 'SUCCESS', additionalFields = null){
        let responseParams = { code: code, status: status, timestamp: new Date() };
        if ( typeof additionalFields === 'object' && additionalFields !== null ){
            responseParams = Object.assign(responseParams, additionalFields);
        }
        this._response.status(200).send(responseParams);
    }

    /**
     * Returns to the client an error response.
     *
     * @param {number} [code=400]
     * @param {number} [HTTPStatus=400]
     * @param {string} [status=ERROR]
     *
     * @protected
     */
    _sendErrorResponse(code = 400, HTTPStatus = 400, status = 'ERROR'){
        const responseParams = { code: code, status: status, timestamp: new Date() };
        this._response.status(HTTPStatus).send(responseParams);
    }

    /**
     * The class constructor.
     *
     * @param {Request} request
     * @param {Response} response
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(request, response){
        if ( this.constructor === Controller ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }

        this._response = response;
        this._request = request;
    }
}

export default Controller;
