'use strict';

import MalformedWebSocketMessageException from '../exceptions/MalformedWebSocketMessageException.js';
import RequestNotAcceptableHTTPException from '../exceptions/RequestNotAcceptableHTTPException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import WebSocketMessage from '../DTOs/WebSocketMessage.js';
import Exception from '../exceptions/Exception.js';
import WebSocketRouter from './WebSocketRouter.js';
import { setInterval } from 'node:timers';
import Injectable from './Injectable.js';
import User from '../models/User.js';
import { WebSocketServer } from 'ws';
import crypto from 'node:crypto';

class WebSocketServerManager extends Injectable {
    /**
     * @type {Object.<string, Object.<string, Client>>}
     */
    #connectionIndex = Object.create(null);

    /**
     * @type {?number}
     */
    #heartbeatCheckerIntervalID = null;

    /**
     * @type {WebSocketServer}
     */
    #webSocketServer;

    /**
     * @type {WebSocketRouter}
     */
    #webSocketRouter;

    /**
     * Handles errors thrown by clients and controllers.
     *
     * @param {Error} error
     * @param {Client} client
     * @param {?string} transactionID
     *
     * @returns {Promise<void>}
     */
    async #handleClientError(error, client, transactionID){console.log(error);
        let responseProperties = { timestamp: new Date(), status: 'ERROR', code: 400 };
        if ( transactionID !== '' && typeof transactionID === 'string' ){
            responseProperties.transactionID = transactionID;
        }
        if ( error instanceof Exception ){
            responseProperties.status = error.getStatus();
        }
        client.send(JSON.stringify(responseProperties));
    }

    /**
     * Handles client responses.
     *
     * @param {any} payload
     * @param {Client} client
     * @param {?string} transactionID
     *
     * @returns {Promise<void>}
     */
    async #handleClientResponse(payload, client, transactionID){
        let responseProperties = { code: 200, status: 'SUCCESS', timestamp: new Date() };
        if ( transactionID !== '' && typeof transactionID === 'string' ){
            responseProperties.transactionID = transactionID;
        }
        if ( payload !== null && typeof payload !== 'undefined' ){
            responseProperties.payload = payload;
        }
        client.send(JSON.stringify(responseProperties));
    }

    /**
     * Builds a webSocket message instance based on the incoming data.
     *
     * @param {Client} client
     * @param {string} data
     *
     * @returns {WebSocketMessage}
     *
     * @throws {MalformedWebSocketMessageException} If the received message is a malformed JSON string.
     */
    #makeWebSocketMessageObject(client, data){
        try{
            const message = JSON.parse(data.toString());
            return new WebSocketMessage({
                transactionID: ( message.transactionID ?? null ),
                payload: ( message.payload ?? {} ),
                action: ( message.action ?? null ),
                webSocketServerManager: this,
                message: message,
                client: client
            });
        }catch(ex){
            throw new MalformedWebSocketMessageException('Malformed JSON message.', 0, ex);
        }
    }

    /**
     * Handles incoming client messages.
     *
     * @param {Client} client
     * @param {string} data
     *
     * @returns {Promise<void>}
     *
     * @throws {MalformedWebSocketMessageException} If the received message is a malformed JSON string.
     * @throws {RequestNotAcceptableHTTPException} If an invalid action is provided.
     */
    async #handleClientMessage(client, data){
        let webSocketMessage = null;
        try{
            webSocketMessage = this.#makeWebSocketMessageObject(client, data);
            const action = webSocketMessage.getAction();
            if ( action === '' || typeof action !== 'string' ){
                throw new RequestNotAcceptableHTTPException('Invalid action provided.');
            }
            const responsePayload = await this.#webSocketRouter.handle(action, webSocketMessage);
            await this.#handleClientResponse(responsePayload, client, webSocketMessage.getTransactionID());
        }catch(ex){
            const transactionID = webSocketMessage?.getTransactionID() ?? null;
            await this.#handleClientError(ex, client, transactionID);
        }
    }

    /**
     * Removes the given client from the connection index.
     *
     * @param {Client} client
     */
    #detachClient(client){
        if ( typeof this.#connectionIndex[client.authenticatedUserID] === 'object' ){
            delete this.#connectionIndex[client.authenticatedUserID][client.uuid];
            if ( Object.keys(this.#connectionIndex[client.authenticatedUserID]).length === 0 ){
                delete this.#connectionIndex[client.authenticatedUserID];
            }
        }
    }

    /**
     * Attaches event listeners to the defined WebSocket server.
     */
    #addEventListeners(){
        this.#webSocketServer.on('connection', (client) => {
            client.on('message', (data) => this.#handleClientMessage(client, data));
            client.on('close', () => this.#detachClient(client));
            client.uuid = crypto.randomUUID();
        });
    }

    /**
     * Starts periodical client connection heartbeat check.
     */
    #setupHeartbeatChecker(){
        this.#heartbeatCheckerIntervalID = setInterval(() => {
            this.runHeartbeatCheck();
        }, 10000);
    }

    /**
     * The class constructor.
     *
     * @param {WebSocketServer} webSocketServer
     * @param {WebSocketRouter} webSocketRouter
     */
    constructor(webSocketServer, webSocketRouter) {
        super();

        this.setWebSocketServer(webSocketServer);
        this.setWebSocketRouter(webSocketRouter);
    }

    /**
     * Sets the web socket server to use.
     *
     * @param {WebSocketServer} webSocketServer
     *
     * @returns {WebSocketServerManager}
     *
     * @throws {IllegalArgumentException} If an invalid web socket server instance is given.
     */
    setWebSocketServer(webSocketServer){
        if ( !( webSocketServer instanceof WebSocketServer ) ){
            throw new IllegalArgumentException('Invalid web socket server instance.');
        }
        this.#webSocketServer = webSocketServer;
        this.#setupHeartbeatChecker();
        this.#addEventListeners();
        return this;
    }

    /**
     * Returns the web socket server being used.
     *
     * @returns {WebSocketServer}
     */
    getWebSocketServer(){
        return this.#webSocketServer;
    }

    /**
     * Sets the router used to handles WebSocket requests.
     *
     * @param {WebSocketRouter} webSocketRouter
     *
     * @returns {WebSocketServerManager}
     *
     * @throws {IllegalArgumentException} If an invalid router instance is given.
     */
    setWebSocketRouter(webSocketRouter){
        if ( !( webSocketRouter instanceof WebSocketRouter ) ){
            throw new IllegalArgumentException('Invalid web socket router instance.');
        }
        this.#webSocketRouter = webSocketRouter;
        return this;
    }

    /**
     * Returns the router being used to handles WebSocket requests.
     *
     * @returns {exports}
     */
    getWebSocketRouter(){
        return this.#webSocketServer;
    }

    /**
     *
     *
     * @param {Client} client
     * @param {User} user
     *
     * @returns {WebSocketServerManager}
     */
    registerClient(client, user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        if ( typeof this.#connectionIndex[user.getID()] !== 'object' ){
            this.#connectionIndex[user.getID()] = Object.create(null);
        }
        this.#connectionIndex[user.getID()][client.uuid] = client;
        client.authenticatedUserID = user.getID();
        client.authenticatedUser = user;
        return this;
    }

    /**
     *
     *
     * @param {string} userID
     *
     * @returns {boolean}
     */
    hasSession(userID){
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        return typeof this.#connectionIndex[userID] === 'object';
    }

    /**
     * Sends a message to the clients connected to the web socket server defined.
     *
     * @param {Object} message
     * @param {string[]} targetUserIDList
     *
     * @returns {WebSocketServerManager}
     *
     * @throws {IllegalArgumentException} if an invalid target user ID list is given.
     * @throws {IllegalArgumentException} if an invalid message is given.
     */
    send(message, targetUserIDList){
        if ( !Array.isArray(targetUserIDList) ){
            throw new IllegalArgumentException('Invalid target user ID list.');
        }
        const serializedMessage = JSON.stringify(message);
        targetUserIDList.forEach((targetUserID) => {
            if ( typeof this.#connectionIndex[targetUserID] === 'object' ){
                for ( const clientID in this.#connectionIndex[targetUserID] ){
                    this.#connectionIndex[targetUserID][clientID].send(serializedMessage);
                }
            }
        });
        return this;
    }

    /**
     * Performs a check across all the connected clients and then disconnects dead ones.
     *
     * @returns {WebSocketServerManager}
     */
    runHeartbeatCheck(){
        this.#webSocketServer.clients.forEach((client) => {
            if ( client.isAlive === false ){
                this.#detachClient(client);
                return client.terminate();
            }
            client.isAlive = false;
            client.ping();
        });
        return this;
    }
}

export default WebSocketServerManager;
