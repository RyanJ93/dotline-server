'use strict';

import MalformedWebSocketMessageException from '../exceptions/MalformedWebSocketMessageException.js';
import RequestNotAcceptableHTTPException from '../exceptions/RequestNotAcceptableHTTPException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import WebSocketMessage from '../DTOs/WebSocketMessage.js';
import Exception from '../exceptions/Exception.js';
import WebSocketRouter from './WebSocketRouter.js';
import Logger from '../facades/Logger.js';
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
    async #handleClientError(error, client, transactionID){
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
                Logger.getLogger().warn('Invalid WebSocket request action received: ' + action);
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
        const { authenticatedUserID, uuid } = client;
        if ( typeof this.#connectionIndex[authenticatedUserID] === 'object' ){
            Logger.getLogger().debug('Detached WebSocket client ' + uuid + ' owned by user ' + authenticatedUserID + ' from connection index.');
            delete this.#connectionIndex[authenticatedUserID][uuid];
            if ( Object.keys(this.#connectionIndex[authenticatedUserID]).length === 0 ){
                delete this.#connectionIndex[authenticatedUserID];
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
            client.on('pong', () => client.isAlive = true);
            client.uuid = crypto.randomUUID();
            client.connectionDate = new Date();
            Logger.getLogger().debug('WebSocket connection request received (' + client.uuid + ')');
        });
    }

    /**
     * Starts periodical client connection heartbeat check.
     */
    #setupHeartbeatChecker(){
        this.#heartbeatCheckerIntervalID = setInterval(() => {
            this.runHeartbeatCheck();
        }, WebSocketServerManager.HEARTHBEAT_INTERVAL_DELAY);
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
     * Registers a client within the connection index.
     *
     * @param {Client} client
     * @param {User} user
     * @param {string} accessToken
     *
     * @returns {WebSocketServerManager}
     *
     * @throws {IllegalArgumentException} If an invalid access token is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    registerClient(client, user, accessToken){
        if ( accessToken === '' || typeof accessToken !== 'string' ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        if ( typeof this.#connectionIndex[user.getID()] !== 'object' ){
            this.#connectionIndex[user.getID()] = Object.create(null);
        }
        const { uuid } = client, userID = user.getID(), logger = Logger.getLogger();
        logger.debug('Registered WebSocket client ' + uuid + ' owned by user ' + userID);
        this.#connectionIndex[userID][uuid] = client;
        client.authenticatedUserAccessToken = accessToken;
        client.authenticatedUserID = userID;
        client.authenticatedUser = user;
        return this;
    }

    /**
     * Checks if a given user has at least one open connection.
     *
     * @param {string} userID
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
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
        const currentTimestamp = new Date().getTime(), logger = Logger.getLogger();
        this.#webSocketServer.clients.forEach((client) => {
            if ( typeof client.authenticatedUserAccessToken !== 'string' ){
                const timeDiff = currentTimestamp - client.connectionDate.getTime();
                if ( timeDiff > WebSocketServerManager.AUTHENTICATION_WAIT_TIMEOUT ){
                    logger.info('Disconnecting WebSocket client ' + client.uuid + ', authentication timeout.');
                    this.#detachClient(client);
                    return client.terminate();
                }
            }
            if ( client.isAlive === false ){
                logger.debug('Disconnecting WebSocket client ' + client.uuid + ', heartbeat check failed.');
                this.#detachClient(client);
                return client.terminate();
            }
            client.isAlive = false;
            client.ping();
        });
        return this;
    }

    /**
     * Disconnects all the connections belonging to a given user.
     *
     * @param {User} user
     * @param {?string} [accessToken]
     * @param {number} [code=1000]
     * @param {string} [reason=""]
     *
     * @throws {IllegalArgumentException} If an invalid access token is given.
     * @throws {IllegalArgumentException} If an invalid reason is given.
     * @throws {IllegalArgumentException} If an invalid code is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    disconnectByUser(user, accessToken = null, code = 1000, reason = ''){
        if ( accessToken !== null && ( accessToken === '' || typeof accessToken !== 'string' ) ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        if ( reason === '' || typeof reason !== 'string' ){
            throw new IllegalArgumentException('Invalid reason.');
        }
        if ( code === null || isNaN(code) ){
            throw new IllegalArgumentException('Invalid code.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        const userID = user.getID(), logger = Logger.getLogger();
        logger.debug('Disconnecting WebSocket clients authenticated as user ' + userID);
        if ( typeof this.#connectionIndex[userID] === 'object' ){
            if ( typeof accessToken === 'string' ){
                for ( const clientID in this.#connectionIndex[userID] ){
                    if ( this.#connectionIndex[userID][clientID].authenticatedUserAccessToken === accessToken ){
                        this.#connectionIndex[userID][clientID].close(code, reason);
                    }
                }
            }else{
                for ( const clientID in this.#connectionIndex[userID] ){
                    this.#connectionIndex[userID][clientID].close(code, reason);
                }
            }
        }
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(WebSocketServerManager, 'AUTHENTICATION_WAIT_TIMEOUT', { value: 60000, writable: false });

/**
 * @constant {number}
 */
Object.defineProperty(WebSocketServerManager, 'HEARTHBEAT_INTERVAL_DELAY', { value: 30000, writable: false });

export default WebSocketServerManager;
