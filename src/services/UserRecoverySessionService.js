'use strict';

import UnauthorizedHTTPException from '../exceptions/UnauthorizedHTTPException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import UserRecoverySession from '../models/UserRecoverySession.js';
import CryptoUtils from '../utils/CryptoUtils.js';
import Injector from '../facades/Injector.js';
import Service from './Service.js';

class UserRecoverySessionService extends Service {
    /**
     * Generates an instance of this class based on the user recovery session matching the given session token.
     *
     * @param {string} sessionToken
     * @param {boolean} [ignoreExpireDate=false]
     * @param {boolean} [ignoreRecovered=false]
     *
     * @returns {Promise<UserRecoverySessionService>}
     *
     * @throws {UnauthorizedHTTPException} If the user recovery session found has already been used.
     * @throws {UnauthorizedHTTPException} If no user matching the given session token is found.
     * @throws {UnauthorizedHTTPException} If the user recovery session found has expired.
     * @throws {IllegalArgumentException} If an invalid session token string is given.
     */
    static async makeFromSessionToken(sessionToken, ignoreExpireDate = false, ignoreRecovered = false){
        const userRecoverySessionService = new UserRecoverySessionService();
        await userRecoverySessionService.getUserRecoverySessionBySessionToken(sessionToken, ignoreExpireDate, ignoreRecovered);
        return userRecoverySessionService;
    }

    /**
     * @type {UserRecoverySessionRepository}
     */
    #userRecoverySessionRepository;

    /**
     * @type {?UserRecoverySession}
     */
    #userRecoverySession = null;

    /**
     * The class constructor.
     *
     * @param {?UserRecoverySession} [UserRecoverySession]
     */
    constructor(UserRecoverySession = null){
        super();

        this.#userRecoverySessionRepository = Injector.inject('UserRecoverySessionRepository');
        this.setUserRecoverySession(UserRecoverySession);
    }

    /**
     * Sets the user recovery session.
     *
     * @param {?UserRecoverySession} userRecoverySession
     *
     * @returns {UserRecoverySessionService}
     *
     * @throws {IllegalArgumentException} If an invalid user recovery session is given.
     */
    setUserRecoverySession(userRecoverySession){
        if ( userRecoverySession !== null && !( userRecoverySession instanceof UserRecoverySession ) ){
            throw new IllegalArgumentException('Invalid user recovery session.');
        }
        this.#userRecoverySession = userRecoverySession;
        return this;
    }

    /**
     * Returns the user recovery session defined.
     *
     * @returns {?UserRecoverySession}
     */
    getUserRecoverySession(){
        return this.#userRecoverySession;
    }

    /**
     * Creates a new user recovery session.
     *
     * @param {User} user
     * @param {ClientTrackingInfo} clientTrackingInfo
     * @param {number} [ttl=3600]
     *
     * @returns {Promise<UserRecoverySession>}
     *
     * @throws {IllegalArgumentException} If an invalid client tracking info object is given.
     * @throws {IllegalArgumentException} If an invalid TTL value is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async create(user, clientTrackingInfo, ttl = 3600){
        if ( ttl === null || isNaN(ttl) || ttl <= 0 ){
            throw new IllegalArgumentException('Invalid TTL value.');
        }
        const sessionToken = CryptoUtils.generateRandomString(UserRecoverySessionService.SESSION_TOKEN_STRING_LENGTH);
        const expireDate = new Date(new Date().getTime() + ( ttl * 1000 ));
        this.#userRecoverySession = await this.#userRecoverySessionRepository.create(user, sessionToken, expireDate, clientTrackingInfo);
        this._logger.info('Created a new recovery session for user ' + user.getID());
        return this.#userRecoverySession;
    }

    /**
     * Returns the user recovery session matching the given session token.
     *
     * @param {string} sessionToken
     * @param {boolean} [ignoreExpireDate=false]
     * @param {boolean} [ignoreRecovered=false]
     *
     * @returns {Promise<UserRecoverySession>}
     *
     * @throws {UnauthorizedHTTPException} If the user recovery session found has already been fulfilled.
     * @throws {UnauthorizedHTTPException} If no user matching the given session token is found.
     * @throws {UnauthorizedHTTPException} If the user recovery session found has expired.
     * @throws {IllegalArgumentException} If an invalid session token string is given.
     */
    async getUserRecoverySessionBySessionToken(sessionToken, ignoreExpireDate = false, ignoreRecovered = false){
        const userRecoverySession = await this.#userRecoverySessionRepository.findBySessionToken(sessionToken);
        if ( userRecoverySession === null || userRecoverySession.getUser() === null ){
            throw new UnauthorizedHTTPException('No such session token found.');
        }
        if ( ignoreExpireDate !== true && userRecoverySession.getExpiresAt() < new Date() ){
            throw new UnauthorizedHTTPException('Session token found has expired.');
        }
        if ( ignoreRecovered !== true && userRecoverySession.getFulfilled() === true ){
            throw new UnauthorizedHTTPException('Session token found has already been fulfilled.');
        }
        return this.#userRecoverySession = userRecoverySession;
    }

    /**
     * Marks the user recovery session defined as fulfilled.
     *
     * @param {boolean} [fulfilled=true]
     *
     * @returns {Promise<void>}
     */
    async markAsFulfilled(fulfilled = true){
        await this.#userRecoverySessionRepository.markAsFulfilled(this.#userRecoverySession, fulfilled);
        this._logger.info('Recovery session marked as fulfilled for user ' + this.#userRecoverySession.getUser().getID());
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(UserRecoverySessionService, 'SESSION_TOKEN_STRING_LENGTH', { value: 256, writable: false });

export default UserRecoverySessionService;
