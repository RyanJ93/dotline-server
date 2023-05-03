'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import ClientTrackingInfo from '../DTOs/ClientTrackingInfo.js';
import CassandraRepository from './CassandraRepository.js';
import AccessToken from '../models/AccessToken.js';
import User from '../models/User.js';

class AccessTokenRepository extends CassandraRepository {
    /**
     * Creates a new unique access token.
     *
     * @param {User} user
     * @param {string} accessTokenString
     * @param {ClientTrackingInfo} clientTrackingInfo
     *
     * @returns {Promise<AccessToken>}
     *
     * @throws {IllegalArgumentException} If an invalid access token is given.
     * @throws {IllegalArgumentException} If an invalid client tracking info instance is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async createAccessToken(user, accessTokenString, clientTrackingInfo){
        if ( accessTokenString === '' || typeof accessTokenString !== 'string' ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        if ( !( clientTrackingInfo instanceof ClientTrackingInfo ) ){
            throw new IllegalArgumentException('Invalid client tracking info instance.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        const accessToken = new AccessToken();
        accessToken.setBrowserName(clientTrackingInfo.getBrowserName());
        accessToken.setLocation(clientTrackingInfo.getLocation());
        accessToken.setIP(clientTrackingInfo.getIP());
        accessToken.setAccessToken(accessTokenString);
        accessToken.setFirstAccess(new Date());
        accessToken.setLastAccess(new Date());
        accessToken.setUser(user);
        await accessToken.save();
        return accessToken;
    }

    /**
     * Updates last access date for a given access token.
     *
     * @param {AccessToken} accessToken
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid access token instance is given.
     */
    async updateLastAccess(accessToken){
        if ( !( accessToken instanceof AccessToken ) ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        accessToken.setLastAccess(new Date());
        await accessToken.save();
    }

    /**
     * Returns an access token model instance given the unique access token string.
     *
     * @param {string} accessToken
     *
     * @returns {Promise<?AccessToken>}
     *
     * @throws {IllegalArgumentException} If an invalid access token is given.
     */
    async getAccessToken(accessToken){
        if ( accessToken === '' || typeof accessToken !== 'string' ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        return await AccessToken.findOne({ accessToken: accessToken });
    }

    /**
     * Removes an access token given its token string.
     *
     * @param {string} accessToken
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid access token is given.
     */
    async deleteAccessTokenByString(accessToken){
        if ( accessToken === '' || typeof accessToken !== 'string' ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        await AccessToken.findAndDelete({ accessToken: accessToken });
    }

    /**
     * Removes a given access token.
     *
     * @param {AccessToken} accessToken
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid access token instance is given.
     */
    async deleteAccessToken(accessToken){
        if ( !( accessToken instanceof AccessToken ) ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        await accessToken.delete();
    }
}

export default AccessTokenRepository;
