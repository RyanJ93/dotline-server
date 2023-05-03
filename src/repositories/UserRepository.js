'use strict';

import Repository from './Repository.js';
import cassandra from 'cassandra-driver';
import User from '../models/User.js';

class UserRepository extends Repository {
    async create(username, password, RSAPublicKey, RSAPrivateKey, RSAPrivateKeyEncryptionParameters){
        const user = new User(), createdAt = new Date();
        user.setRSAPrivateKeyEncryptionParameters(RSAPrivateKeyEncryptionParameters);
        user.setRSAPrivateKey(RSAPrivateKey).setRSAPublicKey(RSAPublicKey);
        user.setCreatedAt(createdAt).setUpdatedAt(createdAt);
        user.setUsername(username).setPassword(password);
        user.setID(cassandra.types.TimeUuid.now());
        await user.save();
        return user;
    }

    async updateLastAccess(user){
        user.setLastAccess(new Date());
        await user.save();
    }

    getUserByUsername(username){
        return User.findOne({ username: username });
    }

    getMultipleUser(userIDList){
        return User.find({ id: userIDList });
    }

    async searchByUsername(username){
        return await User.search(username, 'username');
    }

    /**
     *
     * @param id
     * @returns {Promise<?User>}
     */
    async findOne(id){
        return await User.findOne({ id: id });
    }
}

export default UserRepository;
