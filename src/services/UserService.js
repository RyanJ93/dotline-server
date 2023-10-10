'use strict';

import UserRecoveryInitializationParameters from '../DTOs/UserRecoveryInitializationParameters.js';
import DuplicatedUsernameException from '../exceptions/DuplicatedUsernameException.js';
import UnauthorizedHTTPException from '../exceptions/UnauthorizedHTTPException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import EntityNotFoundException from '../exceptions/EntityNotFoundException.js';
import NotFoundHTTPException from '../exceptions/NotFoundHTTPException.js';
import UserRecoverySessionService from './UserRecoverySessionService.js';
import AccessTokenService from './AccessTokenService.js';
import PasswordUtils from '../utils/PasswordUtils.js';
import Injector from '../facades/Injector.js';
import User from '../models/User.js';
import Service from './Service.js';

class UserService extends Service {
    /**
     * Generates an instance of this class based on the given entity's username.
     *
     * @param {string} username
     *
     * @returns {Promise<UserService>}
     *
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
     * @throws {EntityNotFoundException} If no user matching the given username is found.
     * @throws {IllegalArgumentException} If an invalid username is given.
     */
    static async makeFromEntity(username){
        const userService = new UserService();
        await userService.getUserByUsername(username);
        if ( userService.getUser() === null ){
            throw new EntityNotFoundException('No user matching the given username found.');
        }
        return userService;
    }

    /**
     * @type {UserRepository}
     */
    #userRepository;

    /**
     * @type {?User}
     */
    #user = null;

    /**
     * The class constructor.
     *
     * @param {?User} [user]
     */
    constructor(user = null){
        super();

        this.#userRepository = Injector.inject('UserRepository');
        this.setUser(user);
    }

    /**
     * Sets the user.
     *
     * @param {User} user
     *
     * @returns {UserService}
     *
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    setUser(user){
        if ( user !== null && !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        this.#user = user;
        return this;
    }

    /**
     * Returns the user.
     *
     * @returns {?User}
     */
    getUser(){
        return this.#user;
    }

    /**
     * Returns the user matching the given ID.
     *
     * @param {string} userID
     *
     * @returns {Promise<?User>}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    async getUserByID(userID){
        return this.#user = await this.#userRepository.findByID(userID);
    }

    /**
     * Returns the user matching the given username.
     *
     * @param {string} username
     *
     * @returns {Promise<?User>}
     *
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
     * @throws {IllegalArgumentException} If an invalid username is given.
     */
    async getUserByUsername(username){
        return this.#user = await this.#userRepository.getUserByUsername(username);
    }

    /**
     * Checks if a given username has been taken by some user.
     *
     * @param {string} username
     *
     * @returns {Promise<boolean>}
     *
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
     * @throws {IllegalArgumentException} If an invalid username is given.
     */
    async isUsernameAvailable(username){
        return ( await this.getUserByUsername(username) ) === null;
    }

    /**
     * Signs a user up.
     *
     * @param {string} username
     * @param {string} password
     * @param {UserCompositeRSAParameters} userCompositeRSAParameters
     *
     * @returns {Promise<User>}
     *
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
     * @throws {IllegalArgumentException} If some invalid user composite RSA parameters are given.
     * @throws {DuplicatedUsernameException} If the given username has been taken by someone else.
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    async signup(username, password, userCompositeRSAParameters){
        if ( !( await this.isUsernameAvailable(username) ) ){
            throw new DuplicatedUsernameException('This username has already been taken.');
        }
        this.#user = await this.#userRepository.create(username, password, userCompositeRSAParameters);
        this._logger.info('Created new user account with username "' + username + '" and ID ' + this.#user.getID());
        return this.#user;
    }

    /**
     * Authenticates a user.
     *
     * @param {string} username
     * @param {string} password
     *
     * @returns {Promise<User>}
     *
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
     * @throws {UnauthorizedHTTPException} If the given password doesn't match the user's one.
     * @throws {NotFoundHTTPException} If no user matching the given username is found.
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    async authenticateWithCredentials(username, password){
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        if ( ( await this.getUserByUsername(username) ) === null ){
            throw new NotFoundHTTPException('No such user found.');
        }
        if ( !PasswordUtils.comparePassword(password, this.#user.getPassword()) ){
            this._logger.warn('Authentication attempt with credentials failed for user ' + this.#user.getID());
            throw new UnauthorizedHTTPException('Password mismatch.');
        }
        this._logger.info('Authentication process completed for user ' + this.#user.getID());
        return this.#user;
    }

    /**
     * Generates a new access token for the defined user.
     *
     * @param {ClientTrackingInfo} clientTrackingInfo
     *
     * @returns {Promise<AccessToken>}
     *
     * @throws {IllegalArgumentException} If an invalid client tracking info instance is given.
     */
    async generateAccessToken(clientTrackingInfo){
        const accessToken = await new AccessTokenService().generateAccessToken(this.#user, clientTrackingInfo);
        this._logger.info('New access token generated for user ' + this.#user.getID());
        return accessToken;
    }

    /**
     * Returns all the users matching the given username.
     *
     * @param {string} username
     * @param {number} [limit=10]
     *
     * @returns {Promise<User[]>}
     *
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid limit is given.
     */
    async searchByUsername(username, limit = 10){
        return await this.#userRepository.searchByUsername(username, limit);
    }

    /**
     * Updates user's last access date.
     *
     * @returns {Promise<void>}
     */
    async updateLastAccess(){
        await this.#userRepository.updateLastAccess(this.#user);
    }

    /**
     * Finds multiple user given their IDs.
     *
     * @param {string[]} userIDList
     *
     * @returns {Promise<User[]>}
     *
     * @throws {IllegalArgumentException} If an invalid user IDs array is given.
     */
    async findMultipleUsers(userIDList){
        return await this.#userRepository.getMultipleUser(userIDList);
    }

    /**
     * Updates the defined user.
     *
     * @param {?string} username
     * @param {?string} name
     * @param {string} surname
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
     * @throws {DuplicatedUsernameException} If the given username has already been taken.
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid surname is given.
     * @throws {IllegalArgumentException} If an invalid name is given.
     */
    async edit(username, name, surname){
        await this.#userRepository.updateOptionalInfo(this.#user, surname, name);
        if ( this.#user.getUsername() !== username ){
            const otherUser = await this.getUserByUsername(username);
            if ( otherUser !== null ){
                throw new DuplicatedUsernameException('Username already taken.');
            }
            await this.#userRepository.updateUsername(this.#user, username);
            this._logger.info('User ' + this.#user.getID() + ' updated.');
        }
    }

    /**
     * Checks if the given current password matches, if so updates the user's password.
     *
     * @param {string} currentPassword
     * @param {string} newPassword
     * @param {string} RSAPrivateKey
     * @param {AESEncryptionParameters} RSAPrivateKeyEncryptionParameters
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid AES encryption parameters object is given.
     * @throws {UnauthorizedHTTPException} If the given password doesn't match the user's one.
     * @throws {IllegalArgumentException} If an invalid current password is given.
     * @throws {IllegalArgumentException} If an invalid RSA private key is given.
     * @throws {IllegalArgumentException} If an invalid new password is given.
     */
    async changePassword(currentPassword, newPassword, RSAPrivateKey, RSAPrivateKeyEncryptionParameters){
        if ( currentPassword === '' || typeof currentPassword !== 'string' ){
            throw new IllegalArgumentException('Invalid current password.');
        }
        if ( !PasswordUtils.comparePassword(currentPassword, this.#user.getPassword()) ){
            throw new UnauthorizedHTTPException('Password mismatch.');
        }
        await this.updatePassword(newPassword, RSAPrivateKey, RSAPrivateKeyEncryptionParameters);
    }

    /**
     * Updates the user's password.
     *
     * @param {string} password
     * @param {string} RSAPrivateKey
     * @param {AESEncryptionParameters} RSAPrivateKeyEncryptionParameters
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid AES encryption parameters object is given.
     * @throws {IllegalArgumentException} If an invalid RSA private key is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    async updatePassword(password, RSAPrivateKey, RSAPrivateKeyEncryptionParameters){
        await this.#userRepository.changePassword(this.#user, password, RSAPrivateKey, RSAPrivateKeyEncryptionParameters);
        this._logger.info('Updated password for user ' + this.#user.getID());
    }

    /**
     * Updates the user's recovery key.
     *
     * @param {AESEncryptionParameters} recoveryRSAPrivateKeyEncryptionParameters
     * @param {string} recoveryRSAPrivateKey
     * @param {string} recoveryKey
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If some invalid recovery AES encryption parameters are given.
     * @throws {IllegalArgumentException} If an invalid recovery RSA private key is given.
     * @throws {IllegalArgumentException} If an invalid recovery key is given.
     */
    async regenerateRecoveryKey(recoveryRSAPrivateKeyEncryptionParameters, recoveryRSAPrivateKey, recoveryKey){
        await this.#userRepository.regenerateRecoveryKey(this.#user, recoveryRSAPrivateKeyEncryptionParameters, recoveryRSAPrivateKey, recoveryKey);
        this._logger.info('Regenerated recovery key for user ' + this.#user.getID());
    }

    /**
     * Returns the user's account recovery parameters.
     *
     * @returns {?UserRecoveryInitializationParameters}
     */
    getRecoveryParameters(){
        return this.#user === null ? null : new UserRecoveryInitializationParameters({
            recoveryRSAPrivateKeyEncryptionParameters: this.#user.getRecoveryRSAPrivateKeyEncryptionParameters(),
            recoveryRSAPrivateKey: this.#user.getRecoveryRSAPrivateKey()
        });
    }

    /**
     * Initializes a new user recovery session.
     *
     * @param {string} recoveryKey
     * @param {ClientTrackingInfo} clientTrackingInfo
     * @param {number} [ttl=3600]
     *
     * @returns {Promise<UserRecoverySession>}
     *
     * @throws {IllegalArgumentException} If an invalid client tracking info object is given.
     * @throws {IllegalArgumentException} If an invalid recovery key is given.
     * @throws {IllegalArgumentException} If an invalid TTL value is given.
     */
    async initUserRecoverySession(recoveryKey, clientTrackingInfo, ttl = 3600){
        if ( recoveryKey === '' || typeof recoveryKey !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        if ( !PasswordUtils.comparePassword(recoveryKey, this.#user.getRecoveryKey()) ){
            throw new UnauthorizedHTTPException('Recovery key mismatch.');
        }
        const userRecoverySession = await new UserRecoverySessionService().create(this.#user, clientTrackingInfo, ttl);
        this._logger.info('Recovery session initialized for user ' + this.#user.getID());
        return userRecoverySession;
    }
}

export default UserService;
