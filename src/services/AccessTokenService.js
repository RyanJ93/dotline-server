'use strict';

import UnauthorizedHTTPException from '../exceptions/UnauthorizedHTTPException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import ClientTrackingInfo from '../DTOs/ClientTrackingInfo.js';
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
        const accessTokenRepository = Injector.inject('AccessTokenRepository');
        const accessToken = await accessTokenRepository.getAccessToken(accessTokenString);
        return accessToken === null ? null : new AccessTokenService(accessToken);
    }

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
        if ( !( clientTrackingInfo instanceof ClientTrackingInfo ) ){
            throw new IllegalArgumentException('Invalid client tracking info.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        const accessTokenString = CryptoUtils.generateRandomString(256);
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
        if ( accessTokenString === '' || typeof accessTokenString !== 'string' ){
            throw new IllegalArgumentException('Invalid access token string.');
        }
        const accessToken = await this.#accessTokenRepository.getAccessToken(accessTokenString);
        if ( accessToken === null || accessToken.getUser() === null ){
            throw new UnauthorizedHTTPException('No such token found.');
        }
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
        await this.#accessTokenRepository.deleteAccessToken(this.#accessToken);
    }
}

export default AccessTokenService;
