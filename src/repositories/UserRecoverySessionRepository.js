'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import UserRecoverySession from '../models/UserRecoverySession.js';
import ClientTrackingInfo from '../DTOs/ClientTrackingInfo.js';
import CassandraRepository from './CassandraRepository.js';
import DateUtils from '../utils/DateUtils.js';
import User from '../models/User.js';

class UserRecoverySessionRepository extends CassandraRepository {
    /**
     * Creates a new user recovery session.
     *
     * @param {User} user
     * @param {string} sessionToken
     * @param {Date} expireDate
     * @param {ClientTrackingInfo} clientTrackingInfo
     *
     * @returns {Promise<UserRecoverySession>}
     *
     * @throws {IllegalArgumentException} If an invalid client tracking info object is given.
     * @throws {IllegalArgumentException} If an invalid session token is given.
     * @throws {IllegalArgumentException} If an invalid expire date is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async create(user, sessionToken, expireDate, clientTrackingInfo){
        if ( !( clientTrackingInfo instanceof ClientTrackingInfo ) ){
            throw new IllegalArgumentException('Invalid client tracking info.');
        }
        if ( sessionToken === '' || typeof sessionToken !== 'string' ){
            throw new IllegalArgumentException('Invalid session token.');
        }
        if ( !DateUtils.isDate(expireDate) ){
            throw new IllegalArgumentException('Invalid expire date.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        const userRecoverySession = new UserRecoverySession();
        userRecoverySession.setBrowserName(clientTrackingInfo.getBrowserName());
        userRecoverySession.setUserAgent(clientTrackingInfo.getUserAgent());
        userRecoverySession.setLocation(clientTrackingInfo.getLocation());
        userRecoverySession.setOSName(clientTrackingInfo.getOSName());
        userRecoverySession.setIP(clientTrackingInfo.getIP());
        userRecoverySession.setSessionToken(sessionToken);
        userRecoverySession.setCreatedAt(new Date());
        userRecoverySession.setExpiresAt(expireDate);
        userRecoverySession.setFulfilled(false);
        userRecoverySession.setUser(user);
        await userRecoverySession.save();
        return userRecoverySession;
    }

    /**
     * Finds a user recovery session by the associated session token.
     *
     * @param {string} sessionToken
     *
     * @returns {Promise<?UserRecoverySession>}
     *
     * @throws {IllegalArgumentException} If an invalid session token is given.
     */
    async findBySessionToken(sessionToken){
        if ( sessionToken === '' || typeof sessionToken !== 'string' ){
            throw new IllegalArgumentException('Invalid session token.');
        }
        return await UserRecoverySession.findOne({
            sessionToken: sessionToken
        });
    }

    /**
     * Marks the given user recovery session as fulfilled.
     *
     * @param {UserRecoverySession} userRecoverySession
     * @param {boolean} [fulfilled=true]
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid user recovery session is given.
     */
    async markAsFulfilled(userRecoverySession, fulfilled = true){
        if ( !( userRecoverySession instanceof UserRecoverySession ) ){
            throw new IllegalArgumentException('Invalid user recovery session.');
        }
        userRecoverySession.setFulfilled(fulfilled);
        await userRecoverySession.save();
    }
}

export default UserRecoverySessionRepository;
