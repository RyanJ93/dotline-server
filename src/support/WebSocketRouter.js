'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import NotFoundHTTPException from '../exceptions/NotFoundHTTPException.js';
import WebSocketMessage from '../DTOs/WebSocketMessage.js';

/**
 * @callback actionHandlerCallback
 */

class WebSocketRouter {
    /**
     * @type {Object.<string, actionHandlerCallback>}
     */
    #actions = Object.create(null);

    /**
     * Registers a new action.
     *
     * @param {string} name
     * @param {actionHandlerCallback} handler
     *
     * @returns {WebSocketRouter}
     *
     * @throws {IllegalArgumentException} If an invalid action handler function is given.
     * @throws {IllegalArgumentException} If an invalid action name is given.
     */
    addAction(name, handler){
        if ( name === '' || typeof name !== 'string' ){
            throw new IllegalArgumentException('Invalid action name.');
        }
        if ( typeof handler !== 'function' ){
            throw new IllegalArgumentException('Invalid action handler function.');
        }
        this.#actions[name] = handler;
        return this;
    }

    /**
     * Handles a WebSocket message.
     *
     * @param {string} name
     * @param {WebSocketMessage} webSocketMessage
     *
     * @returns {Promise<any>}
     *
     * @throws {NotFoundHTTPException} If no action matching the given name is found.
     * @throws {IllegalArgumentException} If an invalid WebSocket message is given.
     * @throws {IllegalArgumentException} If an invalid action name is given.
     */
    async handle(name, webSocketMessage){
        if ( !( webSocketMessage instanceof WebSocketMessage ) ){
            throw new IllegalArgumentException('Invalid web socket message instance.');
        }
        if ( name === '' || typeof name !== 'string' ){
            throw new IllegalArgumentException('Invalid action name.');
        }
        if ( typeof this.#actions[name] !== 'function' ){
            throw new NotFoundHTTPException('No such action found.');
        }
        return await this.#actions[name](webSocketMessage);
    }
}

export default WebSocketRouter;
