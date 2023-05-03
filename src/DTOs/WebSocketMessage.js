'use strict';

/**
 * @typedef WebSocketMessageProperties
 *
 * @property {WebSocketServerManager} webSocketServerManager
 * @property {string} transactionID
 * @property {string} message
 * @property {string} payload
 * @property {string} action
 * @property {Client} client
 */

class WebSocketMessage {
    /**
     * @type {WebSocketServerManager}
     */
    #webSocketServerManager;

    /**
     * @type {string}
     */
    #transactionID;

    /**
     * @type {string}
     */
    #message;

    /**
     * @type {string}
     */
    #payload;

    /**
     * @type {string}
     */
    #action;

    /**
     * @type {Client}
     */
    #client;

    /**
     * The class constructor.
     *
     * @param {WebSocketMessageProperties} properties
     */
    constructor(properties){
        this.#webSocketServerManager = properties.webSocketServerManager;
        this.#transactionID = properties.transactionID;
        this.#message = properties.message;
        this.#payload = properties.payload;
        this.#action = properties.action;
        this.#client = properties.client;
    }

    /**
     * Returns the WebSocket server manager.
     *
     * @returns {WebSocketServerManager}
     */
    getWebSocketServerManager(){
        return this.#webSocketServerManager;
    }

    /**
     * Returns the transaction ID.
     *
     * @returns {string}
     */
    getTransactionID(){
        return this.#transactionID;
    }

    /**
     * Returns the message content.
     *
     * @returns {string}
     */
    getMessage(){
        return this.#message;
    }

    /**
     * Returns the message payload.
     *
     * @returns {string}
     */
    getPayload(){
        return this.#payload;
    }

    /**
     * Returns the action.
     *
     * @returns {string}
     */
    getAction(){
        return this.#action;
    }

    /**
     * Returns the client the message has been sent by.
     *
     * @returns {Client}
     */
    getClient(){
        return this.#client;
    }
}

export default WebSocketMessage;
