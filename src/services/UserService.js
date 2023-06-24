'use strict';

import DuplicatedUsernameException from '../exceptions/DuplicatedUsernameException.js';
import UnauthorizedHTTPException from '../exceptions/UnauthorizedHTTPException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import NotFoundHTTPException from '../exceptions/NotFoundHTTPException.js';
import AESEncryptionParameters from '../DTOs/AESEncryptionParameters.js';
import ClientTrackingService from './ClientTrackingService.js';
import AccessTokenService from './AccessTokenService.js';
import PasswordUtils from '../utils/PasswordUtils.js';
import Injector from '../facades/Injector.js';
import User from '../models/User.js';
import Service from './Service.js';

class UserService extends Service {
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
     * Checks if a given username has been taken by some user.
     *
     * @param {string} username
     *
     * @returns {Promise<boolean>}
     *
     * @throws {IllegalArgumentException} If an invalid username is given.
     */
    async isUsernameAvailable(username){
        // TODO: validate username format.
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        return ( await this.#userRepository.getUserByUsername(username) ) === null;
    }

    /**
     * Signs a user up.
     *
     * @param {string} username
     * @param {string} password
     * @param {string} RSAPublicKey
     * @param {string} RSAPrivateKey
     * @param {AESEncryptionParameters} RSAPrivateKeyEncryptionParameters
     *
     * @returns {Promise<User>}
     *
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     * @throws {IllegalArgumentException} If an invalid RSA public key is given.
     * @throws {IllegalArgumentException} If an invalid RSA private key is given.
     * @throws {IllegalArgumentException} If an invalid AES encryption parameters object is given.
     * @throws {DuplicatedUsernameException} If the given username has been taken by someone else.
     */
    async signup(username, password, RSAPublicKey, RSAPrivateKey, RSAPrivateKeyEncryptionParameters){
        // TODO: validate username format.
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        if ( RSAPublicKey === '' || typeof RSAPublicKey !== 'string' ){
            throw new IllegalArgumentException('Invalid RSA public key.');
        }
        if ( RSAPrivateKey === '' || typeof RSAPrivateKey !== 'string' ){
            throw new IllegalArgumentException('Invalid RSA private key.');
        }
        if ( !( RSAPrivateKeyEncryptionParameters instanceof AESEncryptionParameters ) ){
            throw new IllegalArgumentException('Invalid AES encryption parameters.');
        }
        const isUsernameAvailable = await this.isUsernameAvailable(username);
        if ( !isUsernameAvailable ){
            throw new DuplicatedUsernameException('This username has already been taken.');
        }
        const passwordCocktail = PasswordUtils.preparePasswordCocktail(password);
        return this.#userRepository.create(username, passwordCocktail, RSAPublicKey, RSAPrivateKey, RSAPrivateKeyEncryptionParameters);
    }

    /**
     * Authenticates a user.
     *
     * @param {string} username
     * @param {string} password
     *
     * @returns {Promise<User>}
     *
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     * @throws {NotFoundHTTPException} If no user matching the given username is found.
     * @throws {UnauthorizedHTTPException} If the given password doesn't match the user's one.
     */
    async authenticateWithCredentials(username, password){
        // TODO: validate username format.
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        const user = await this.#userRepository.getUserByUsername(username);
        if ( user === null ){
            throw new NotFoundHTTPException('No such user found.');
        }
        if ( !PasswordUtils.comparePassword(password, user.getPassword()) ){
            throw new UnauthorizedHTTPException('Password mismatch.');
        }
        return user;
    }

    /**
     * Generates a new access token for a given user.
     *
     * @param {User} user
     * @param {Request} HTTPRequest
     *
     * @returns {Promise<AccessToken>}
     *
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async generateAccessToken(user, HTTPRequest){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        const clientTrackingInfo = await new ClientTrackingService().getClientTrackingInfoByHTTPRequest(HTTPRequest);
        return await new AccessTokenService().generateAccessToken(user, clientTrackingInfo);
    }

    /**
     * Returns all the users matching the given username.
     *
     * @param {string} username
     * @param {number} [limit=10]
     *
     * @returns {Promise<User[]>}
     *
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
        if ( !Array.isArray(userIDList) ){
            throw new IllegalArgumentException('Invalid user IDs.');
        }
        return await this.#userRepository.getMultipleUser(userIDList);
    }

    /**
     * Finds and return the user matching the given ID.
     *
     * @param {string} id
     *
     * @returns {Promise<?User>}
     *
     * @throws {IllegalArgumentException} If an invalid ID is given.
     */
    async find(id){
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid ID.');
        }
        return this.#user = await this.#userRepository.findOne(id);
    }

    /**
     * Updates the defined user.
     *
     * @param {string} username
     * @param {string} name
     * @param {string} surname
     *
     * @returns {Promise<void>}
     *
     * @throws {DuplicatedUsernameException} If the given username has already been taken.
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid surname is given.
     * @throws {IllegalArgumentException} If an invalid name is given.
     */
    async edit(username, name, surname){
        if ( surname !== null && ( surname === '' || typeof surname !== 'string' ) ){
            throw new IllegalArgumentException('Invalid surname.');
        }
        if ( name !== null && ( name === '' || typeof name !== 'string' ) ){
            throw new IllegalArgumentException('Invalid name.');
        }
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        await this.#userRepository.updateOptionalInfo(this.#user, surname, name);
        if ( this.#user.getUsername() !== username ){
            const otherUser = await this.#userRepository.getUserByUsername(surname);
            if ( otherUser !== null ){
                throw new DuplicatedUsernameException('Username already taken.');
            }
            await this.#userRepository.updateUsername(this.#user, username);
        }
    }

    /**
     * Changes the user's password.
     *
     * @param {string} currentPassword
     * @param {string} newPassword
     * @param {string} RSAPrivateKey
     * @param {AESEncryptionParameters} RSAPrivateKeyEncryptionParameters
     *
     * @returns {Promise<User>}
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
        if ( newPassword === '' || typeof newPassword !== 'string' ){
            throw new IllegalArgumentException('Invalid new password.');
        }
        if ( !PasswordUtils.comparePassword(currentPassword, this.#user.getPassword()) ){
            throw new UnauthorizedHTTPException('Password mismatch.');
        }
        const passwordCocktail = PasswordUtils.preparePasswordCocktail(newPassword);
        return this.#userRepository.changePassword(this.#user, passwordCocktail, RSAPrivateKey, RSAPrivateKeyEncryptionParameters);
    }
}

export default UserService;
