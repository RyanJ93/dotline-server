'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import UserCompositeRSAParameters from '../DTOs/UserCompositeRSAParameters.js';
import AESEncryptionParameters from '../DTOs/AESEncryptionParameters.js';
import CassandraRepository from './CassandraRepository.js';
import PasswordUtils from '../utils/PasswordUtils.js';
import StringUtils from '../utils/StringUtils.js';
import cassandra from 'cassandra-driver';
import User from '../models/User.js';

class UserRepository extends CassandraRepository {
    /**
     * Creates a new user.
     *
     * @param {string} username
     * @param {string} password
     * @param {UserCompositeRSAParameters} userCompositeRSAParameters
     *
     * @returns {Promise<User>}
     *
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
     * @throws {IllegalArgumentException} If some invalid user composite RSA parameters are given.
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    async create(username, password, userCompositeRSAParameters){
        if ( !( userCompositeRSAParameters instanceof UserCompositeRSAParameters ) ){
            throw new IllegalArgumentException('Invalid user composite RSA parameters.');
        }
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        if ( !StringUtils.isValidUsername(username) ){
            throw new IllegalArgumentException('Invalid username format.');
        }
        const user = new User(), createdAt = new Date();
        user.setRecoveryRSAPrivateKeyEncryptionParameters(userCompositeRSAParameters.getRecoveryRSAPrivateKeyEncryptionParameters());
        user.setRSAPrivateKeyEncryptionParameters(userCompositeRSAParameters.getRSAPrivateKeyEncryptionParameters());
        user.setRecoveryKey(PasswordUtils.preparePasswordCocktail(userCompositeRSAParameters.getRecoveryKey()));
        user.setPassword(PasswordUtils.preparePasswordCocktail(password)).setProfilePictureID(null);
        user.setRecoveryRSAPrivateKey(userCompositeRSAParameters.getRecoveryRSAPrivateKey());
        user.setRSAPrivateKey(userCompositeRSAParameters.getRSAPrivateKey());
        user.setRSAPublicKey(userCompositeRSAParameters.getRSAPublicKey());
        user.setCreatedAt(createdAt).setUpdatedAt(createdAt);
        user.setID(cassandra.types.TimeUuid.now());
        await user.setUsername(username).save();
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
     * Returns the user matching the given ID.
     *
     * @param {string} id
     *
     * @returns {Promise<?User>}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    async findByID(id){
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid id.');
        }
        return await User.findOne({ id: id });
    }

    /**
     * Finds and returns a user matching the given username.
     *
     * @param {string} username
     *
     * @returns {Promise<?User>}
     *
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
     * @throws {IllegalArgumentException} If an invalid username is given.
     */
    async getUserByUsername(username){
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        if ( !StringUtils.isValidUsername(username) ){
            throw new IllegalArgumentException('Invalid username format.');
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
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
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
        if ( !StringUtils.isValidUsername(username) ){
            throw new IllegalArgumentException('Invalid username format.');
        }
        return await User.search(username, 'username', { limit: limit });
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
        user.setUpdatedAt(new Date());
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
     * @throws {IllegalArgumentException} If the provided username is not compliant with the accepted format.
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async updateUsername(user, username){
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        if ( !StringUtils.isValidUsername(username) ){
            throw new IllegalArgumentException('Invalid username format.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        await user.setUsername(username).setUpdatedAt(new Date()).save();
    }

    /**
     * Changes the given user's password.
     *
     * @param {User} user
     * @param {string} password
     * @param {string} RSAPrivateKey
     * @param {AESEncryptionParameters} RSAPrivateKeyEncryptionParameters
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid AES encryption parameters object is given.
     * @throws {IllegalArgumentException} If an invalid RSA private key is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async changePassword(user, password, RSAPrivateKey, RSAPrivateKeyEncryptionParameters){
        if ( !( RSAPrivateKeyEncryptionParameters instanceof AESEncryptionParameters ) ){
            throw new IllegalArgumentException('Invalid AES encryption parameters.');
        }
        if ( RSAPrivateKey === '' || typeof RSAPrivateKey !== 'string' ){
            throw new IllegalArgumentException('Invalid RSA private key.');
        }
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        user.setRSAPrivateKeyEncryptionParameters(RSAPrivateKeyEncryptionParameters);
        user.setPassword(PasswordUtils.preparePasswordCocktail(password));
        user.setRSAPrivateKey(RSAPrivateKey);
        user.setUpdatedAt(new Date());
        await user.save();
    }

    /**
     * Updates the given user's recovery key.
     *
     * @param {User} user
     * @param {AESEncryptionParameters} recoveryRSAPrivateKeyEncryptionParameters
     * @param {string} recoveryRSAPrivateKey
     * @param {string} recoveryKey
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If some invalid recovery AES encryption parameters are given.
     * @throws {IllegalArgumentException} If an invalid recovery RSA private key is given.
     * @throws {IllegalArgumentException} If an invalid recovery key is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async regenerateRecoveryKey(user, recoveryRSAPrivateKeyEncryptionParameters, recoveryRSAPrivateKey, recoveryKey){
        if ( !( recoveryRSAPrivateKeyEncryptionParameters instanceof AESEncryptionParameters ) ){
            throw new IllegalArgumentException('Invalid recovery AES encryption parameters.');
        }
        if ( recoveryRSAPrivateKey === '' || typeof recoveryRSAPrivateKey !== 'string' ){
            throw new IllegalArgumentException('Invalid recovery RSA private key.');
        }
        if ( recoveryKey === '' || typeof recoveryKey !== 'string' ){
            throw new IllegalArgumentException('Invalid recovery key.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        user.setRecoveryRSAPrivateKeyEncryptionParameters(recoveryRSAPrivateKeyEncryptionParameters);
        user.setRecoveryKey(PasswordUtils.preparePasswordCocktail(recoveryKey));
        user.setRecoveryRSAPrivateKey(recoveryRSAPrivateKey);
        user.setUpdatedAt(new Date());
        await user.save();
    }

    /**
     * Updates user's profile picture ID.
     *
     * @param {User} user
     * @param {?TimeUuid} profilePictureID
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid profile picture ID is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async updateProfilePictureID(user, profilePictureID){
        if ( profilePictureID !== null && !( profilePictureID instanceof cassandra.types.TimeUuid ) ){
            throw new IllegalArgumentException('Invalid profile picture ID.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        user.setProfilePictureID(profilePictureID);
        user.setUpdatedAt(new Date());
        await user.save();
    }
}

export default UserRepository;
