'use strict';

import UnauthorizedHTTPException from '../exceptions/UnauthorizedHTTPException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import AccessToken from '../models/AccessToken.js';
import CryptoUtils from '../utils/CryptoUtils.js';
import Injector from '../facades/Injector.js';
import User from '../models/User.js';
import Service from './Service.js';

class AccessTokenService extends Service {
    /**
     * Creates an instance of this class based on a given access token string.
     *
     * @param {string} accessTokenString
     *
     * @returns {Promise<?AccessTokenService>}
     */
    static async makeFromAccessToken(accessTokenString){
        const accessToken = await Injector.inject('AccessTokenRepository').getAccessToken(accessTokenString);
        return accessToken === null ? null : new AccessTokenService(accessToken);
    }

    /**
     * @type {WebSocketServerManager}
     */
    #webSocketServerManager;

    /**
     * @type {AccessTokenRepository}
     */
    #accessTokenRepository;

    /**
     * @type {?AccessToken}
     */
    #accessToken = null;

    /**
     * The class constructor.
     *
     * @param {?AccessToken} [accessToken]
     */
    constructor(accessToken = null){
        super();

        this.#webSocketServerManager = Injector.inject('WebSocketServerManager');
        this.#accessTokenRepository = Injector.inject('AccessTokenRepository');
        this.setAccessToken(accessToken);
    }

    /**
     * Sets the access token.
     *
     * @param {?AccessToken} accessToken
     *
     * @returns {AccessTokenService}
     *
     * @throws {IllegalArgumentException} If an invalid access token instance is given.
     */
    setAccessToken(accessToken){
        if ( accessToken !== null && !( accessToken instanceof AccessToken ) ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        this.#accessToken = accessToken;
        return this;
    }

    /**
     * Returns the access token.
     *
     * @returns {?AccessToken}
     */
    getAccessToken(){
        return this.#accessToken;
    }

    /**
     * Generates a new access token.
     *
     * @param {User} user
     * @param {ClientTrackingInfo} clientTrackingInfo
     *
     * @returns {Promise<AccessToken>}
     *
     * @throws {IllegalArgumentException} If an invalid client tracking info instance is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async generateAccessToken(user, clientTrackingInfo){
        const accessTokenString = CryptoUtils.generateRandomString(AccessTokenService.ACCESS_TOKEN_STRING_LENGTH);
        this._logger.info('New access token generated for user ID ' + user.getID());
        return this.#accessToken = await this.#accessTokenRepository.createAccessToken(user, accessTokenString, clientTrackingInfo);
    }

    /**
     * Returns the user the given access token string belongs to.
     *
     * @param {string} accessTokenString
     *
     * @returns {Promise<User>}
     *
     * @throws {UnauthorizedHTTPException} If no user matching the given access token is found.
     * @throws {IllegalArgumentException} If an invalid access token string is given.
     */
    async getUserByAccessToken(accessTokenString){
        const accessToken = await this.#accessTokenRepository.getAccessToken(accessTokenString);
        if ( accessToken === null || accessToken.getUser() === null ){
            throw new UnauthorizedHTTPException('No such token found.');
        }
        this.#accessToken = accessToken;
        return accessToken.getUser();
    }

    /**
     * Updates last access date for the defined access token.
     *
     * @returns {Promise<void>}
     */
    async updateLastAccess(){
        await this.#accessTokenRepository.updateLastAccess(this.#accessToken);
    }

    /**
     * Deletes an access token given its token string.
     *
     * @param {string} accessTokenString
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid access token string is given.
     */
    async deleteAccessToken(accessTokenString){
        if ( accessTokenString === '' || typeof accessTokenString !== 'string' ){
            throw new IllegalArgumentException('Invalid access token string.');
        }
        await this.#accessTokenRepository.deleteAccessTokenByString(accessTokenString);
    }

    /**
     * Deletes the access token defined.
     *
     * @returns {Promise<void>}
     */
    async delete(){
        const user = this.#accessToken.getUser(), accessToken = this.#accessToken.getAccessToken();
        // Disconnect all the active WebSocket clients authenticated though the access token being removed.
        this.#webSocketServerManager.disconnectByUser(user, accessToken, 1000, 'ERR_UNAUTHORIZED');
        await this.#accessTokenRepository.deleteAccessToken(this.#accessToken);
    }

    /**
     * Returns all the active access tokens for a given user.
     *
     * @param {User} user
     *
     * @returns {Promise<AccessToken[]>}
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async listByUser(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        return await this.#accessTokenRepository.listByUser(user);
    }

    /**
     * Deletes all the access tokens, except for the given one, associated to a given user.
     *
     * @param {User} user
     * @param {string} currentAccessTokenString
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid access token string is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async deleteUserTokens(user, currentAccessTokenString){
        if ( currentAccessTokenString === '' || typeof currentAccessTokenString !== 'string' ){
            throw new IllegalArgumentException('Invalid access token string.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        const accessTokenList = await this.#accessTokenRepository.listByUser(user), processes = [];
        this._logger.debug('Removing all the other access tokens for user ID ' + user.getID() + '...');
        accessTokenList.forEach((accessToken) => {
            // Remove every user's access tokens but the given one.
            if ( accessToken.getAccessToken() !== currentAccessTokenString ){
                // Disconnect all the active WebSocket clients authenticated though the access token being removed.
                this.#webSocketServerManager.disconnectByUser(user, accessToken.getAccessToken(), 1000, 'ERR_UNAUTHORIZED');
                this._logger.debug('Sent disconnection signal to all the active WebSocket clients for user ID ' + user.getID());
                processes.push(this.#accessTokenRepository.deleteAccessTokenByString(accessToken.getAccessToken()));
            }
        });
        await Promise.all(processes);
        this._logger.info('Removed all the other access tokens for user ID ' + user.getID());
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(AccessTokenService, 'ACCESS_TOKEN_STRING_LENGTH', { value: 256, writable: false });

export default AccessTokenService;
