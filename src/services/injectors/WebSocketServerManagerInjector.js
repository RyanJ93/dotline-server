'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException.js';
import WebSocketServerManager from '../../support/WebSocketServerManager.js';
import Injector from './Injector.js';

class WebSocketServerManagerInjector extends Injector {
    /**
     * @type {WebSocketServerManager}
     */
    #webSocketServerManager;

    /**
     * Sets the web socket server manager instance.
     *
     * @param {WebSocketServerManager} webSocketServerManager
     *
     * @throws {IllegalArgumentException} If an invalid web socket server manager instance is given.
     */
    #setWebSocketServerManager(webSocketServerManager){
        if ( !( webSocketServerManager instanceof WebSocketServerManager ) ){
            throw new IllegalArgumentException('Invalid web socket server manager instance.');
        }
        this.#webSocketServerManager = webSocketServerManager;
    }

    /**
     * The class constructor.
     *
     * @param {WebSocketServerManager} webSocketServerManager
     */
    constructor(webSocketServerManager){
        super();

        this.#setWebSocketServerManager(webSocketServerManager);
    }

    /**
     * Injects the web socket server manager instance.
     *
     * @returns {WebSocketServerManager}
     */
    inject(){
        return this.#webSocketServerManager;
    }
}

export default WebSocketServerManagerInjector;
