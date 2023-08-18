'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import AESEncryptionParameters from '../DTOs/AESEncryptionParameters.js';
import PasswordCocktail from '../DTOs/PasswordCocktail.js';
import CassandraRepository from './CassandraRepository.js';
import cassandra from 'cassandra-driver';
import User from '../models/User.js';

class UserRepository extends CassandraRepository {
    /**
     * Creates a new user.
     *
     * @param {string} username
     * @param {PasswordCocktail} passwordCocktail
     * @param {string} RSAPublicKey
     * @param {string} RSAPrivateKey
     * @param {AESEncryptionParameters} RSAPrivateKeyEncryptionParameters
     *
     * @returns {Promise<User>}
     *
     * @throws {IllegalArgumentException} If some invalid RSA private key encryption parameters are given.
     * @throws {IllegalArgumentException} If an invalid password cocktail is given.
     * @throws {IllegalArgumentException} If an invalid RSA private key is given.
     * @throws {IllegalArgumentException} If an invalid RSA public key is given.
     * @throws {IllegalArgumentException} If an invalid username is given.
     */
    async create(username, passwordCocktail, RSAPublicKey, RSAPrivateKey, RSAPrivateKeyEncryptionParameters){
        if ( !( RSAPrivateKeyEncryptionParameters instanceof AESEncryptionParameters ) ){
            throw new IllegalArgumentException('Invalid RSA private key encryption parameters.');
        }
        if ( RSAPrivateKey === '' || typeof RSAPrivateKey !== 'string' ){
            throw new IllegalArgumentException('Invalid RSA private key.');
        }
        if ( RSAPublicKey === '' || typeof RSAPublicKey !== 'string' ){
            throw new IllegalArgumentException('Invalid RSA public key.');
        }
        if ( !( passwordCocktail instanceof PasswordCocktail ) ){
            throw new IllegalArgumentException('Invalid password cocktail.');
        }
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        const user = new User(), createdAt = new Date();
        user.setRSAPrivateKeyEncryptionParameters(RSAPrivateKeyEncryptionParameters);
        user.setRSAPrivateKey(RSAPrivateKey).setRSAPublicKey(RSAPublicKey);
        user.setUsername(username).setPassword(passwordCocktail);
        user.setCreatedAt(createdAt).setUpdatedAt(createdAt);
        user.setID(cassandra.types.TimeUuid.now());
        await user.save();
        return user;
    }

    /**
     * Updates user's last access date.
     *
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async updateLastAccess(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        user.setLastAccess(new Date());
        await user.save();
    }

    /**
     * Finds and returns a user matching the given username.
     *
     * @param {string} username
     *
     * @returns {Promise<?User>}
     *
     * @throws {IllegalArgumentException} If an invalid username is given.
     */
    async getUserByUsername(username){
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        return await User.findOne({ username: username });
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
    async getMultipleUser(userIDList){
        if ( !Array.isArray(userIDList) ){
            throw new IllegalArgumentException('Invalid user IDs.');
        }
        return await User.find({ id: userIDList });
    }

    /**
     * Finds all the users having a username close enough to the given one.
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
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        if ( limit === null || isNaN(limit) || limit <= 0 ){
            throw new IllegalArgumentException('Invalid limit.');
        }
        return await User.search(username, 'username', { limit: limit });
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
    async findOne(id){
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid ID.');
        }
        return await User.findOne({ id: id });
    }

    /**
     * Updates the given user's optional information.
     *
     * @param {User} user
     * @param {?string} surname
     * @param {?string} name
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid surname is given.
     * @throws {IllegalArgumentException} If an invalid name is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async updateOptionalInfo(user, surname, name){
        if ( surname !== null && ( surname === '' || typeof surname !== 'string' ) ){
            throw new IllegalArgumentException('Invalid surname.');
        }
        if ( name !== null && ( name === '' || typeof name !== 'string' ) ){
            throw new IllegalArgumentException('Invalid name.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        user.setSurname(surname);
        user.setName(name);
        await user.save();
    }

    /**
     * Updates the given user's username.
     *
     * @param {User} user
     * @param {string} username
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async updateUsername(user, username){
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        await user.setUsername(username).save();
    }

    /**
     * Changes the given user's password.
     *
     * @param {User} user
     * @param {PasswordCocktail} passwordCocktail
     * @param {string} RSAPrivateKey
     * @param {AESEncryptionParameters} RSAPrivateKeyEncryptionParameters
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid AES encryption parameters object is given.
     * @throws {IllegalArgumentException} If an invalid password cocktail is given.
     * @throws {IllegalArgumentException} If an invalid RSA private key is given.
     */
    async changePassword(user, passwordCocktail, RSAPrivateKey, RSAPrivateKeyEncryptionParameters){
        if ( !( RSAPrivateKeyEncryptionParameters instanceof AESEncryptionParameters ) ){
            throw new IllegalArgumentException('Invalid AES encryption parameters.');
        }
        if ( RSAPrivateKey === '' || typeof RSAPrivateKey !== 'string' ){
            throw new IllegalArgumentException('Invalid RSA private key.');
        }
        if ( !( passwordCocktail instanceof PasswordCocktail ) ){
            throw new IllegalArgumentException('Invalid password cocktail.');
        }
        user.setRSAPrivateKeyEncryptionParameters(RSAPrivateKeyEncryptionParameters);
        user.setRSAPrivateKey(RSAPrivateKey);
        user.setPassword(passwordCocktail);
        await user.save();
    }
}

export default UserRepository;
