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

    getUserByUsername(username){
        return User.findOne({ username: username });
    }
}

export default UserRepository;
