'use strict';

import AESEncryptionParameters from '../DTOs/AESEncryptionParameters.js';
import PasswordCocktail from '../DTOs/PasswordCocktail.js';
import Model from './Model.js';

class User extends Model {
    constructor(){
        super();

        this._mapping = {
            hiddenFields: ['password', 'createdAt', 'updatedAt'],
            tableName: 'users',
            keys: ['id'],
            fields: {
                RSAPrivateKeyEncryptionParameters: { name: 'rsa_private_key_encryption_parameters', UDTImplementation: AESEncryptionParameters },
                password: { name: 'password', UDTImplementation: PasswordCocktail },
                RSAPrivateKey: { name: 'rsa_private_key', type: 'string' },
                RSAPublicKey: { name: 'rsa_public_key', type: 'string' },
                lastAccess: { name: 'last_access', type: 'date' },
                createdAt: { name: 'created_at', type: 'date' },
                updatedAt: { name: 'updated_at', type: 'date' },
                username: { name: 'username', type: 'string' },
                id: { name: 'id', type: 'timeuuid' }
            }
        };
    }

    setID(id){
        this._attributes.id = id;
        return this;
    }

    getID(){
        return this._attributes.id ?? null;
    }

    setUsername(username){
        this._attributes.username = username;
        return this;
    }

    getUsername(){
        return this._attributes.username ?? null;
    }

    setPassword(password){
        this._attributes.password = password;
        return this;
    }

    getPassword(){
        return this._attributes.password ?? null;
    }

    setRSAPrivateKey(RSAPrivateKey){
        this._attributes.RSAPrivateKey = RSAPrivateKey;
        return this;
    }

    getRSAPrivateKey(){
        return this._attributes.RSAPrivateKey ?? null;
    }

    setRSAPublicKey(RSAPublicKey){
        this._attributes.RSAPublicKey = RSAPublicKey;
        return this;
    }

    getRSAPublicKey(){
        return this._attributes.RSAPublicKey ?? null;
    }

    setRSAPrivateKeyEncryptionParameters(RSAPrivateKeyEncryptionParameters){
        this._attributes.RSAPrivateKeyEncryptionParameters = RSAPrivateKeyEncryptionParameters;
        return this;
    }

    getRSAPrivateKeyEncryptionParameters(){
        return this._attributes.RSAPrivateKeyEncryptionParameters ?? null;
    }

    setLastAccess(lastAccess){
        this._attributes.lastAccess = lastAccess;
        return this;
    }

    getLastAccess(){
        return this._attributes.lastAccess ?? null;
    }

    setCreatedAt(createdAt){
        this._attributes.createdAt = createdAt;
        return this;
    }

    getCreatedAt(){
        return this._attributes.createdAt ?? null;
    }

    setUpdatedAt(updatedAt){
        this._attributes.updatedAt = updatedAt;
        return this;
    }

    getUpdatedAt(){
        return this._attributes.updatedAt ?? null;
    }
}

export default User;
