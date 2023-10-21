'use strict';

import AESEncryptionParameters from '../DTOs/AESEncryptionParameters.js';
import PasswordCocktail from '../DTOs/PasswordCocktail.js';
import SearchEnabledModel from './SearchEnabledModel.js';

class User extends SearchEnabledModel {
    constructor(){
        super();

        this._mapping = {
            hiddenFields: ['password', 'createdAt', 'updatedAt'],
            tableName: 'users',
            searchIndex: {
                username: { tableName: 'user_search_index', referenceFields: { user_id: 'id' } }
            },
            keys: ['id'],
            fields: {
                recoveryRSAPrivateKeyEncryptionParameters: { name: 'recovery_rsa_private_key_encryption_parameters', UDTImplementation: AESEncryptionParameters },
                RSAPrivateKeyEncryptionParameters: { name: 'rsa_private_key_encryption_parameters', UDTImplementation: AESEncryptionParameters },
                recoveryRSAPrivateKey: { name: 'recovery_rsa_private_key', type: 'string' },
                recoveryKey: { name: 'recovery_key', UDTImplementation: PasswordCocktail },
                password: { name: 'password', UDTImplementation: PasswordCocktail },
                profilePictureID: { name: 'profile_picture_id', type: 'timeuuid' },
                RSAPrivateKey: { name: 'rsa_private_key', type: 'string' },
                RSAPublicKey: { name: 'rsa_public_key', type: 'string' },
                lastAccess: { name: 'last_access', type: 'date' },
                createdAt: { name: 'created_at', type: 'date' },
                updatedAt: { name: 'updated_at', type: 'date' },
                username: { name: 'username', type: 'string' },
                surname: { name: 'surname', type: 'string' },
                name: { name: 'name', type: 'string' },
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

    setRecoveryRSAPrivateKeyEncryptionParameters(recoveryRSAPrivateKeyEncryptionParameters){
        this._attributes.recoveryRSAPrivateKeyEncryptionParameters = recoveryRSAPrivateKeyEncryptionParameters;
        return this;
    }

    getRecoveryRSAPrivateKeyEncryptionParameters(){
        return this._attributes.recoveryRSAPrivateKeyEncryptionParameters ?? null;
    }

    setRSAPrivateKeyEncryptionParameters(RSAPrivateKeyEncryptionParameters){
        this._attributes.RSAPrivateKeyEncryptionParameters = RSAPrivateKeyEncryptionParameters;
        return this;
    }

    getRSAPrivateKeyEncryptionParameters(){
        return this._attributes.RSAPrivateKeyEncryptionParameters ?? null;
    }

    setRecoveryRSAPrivateKey(recoveryRSAPrivateKey){
        this._attributes.recoveryRSAPrivateKey = recoveryRSAPrivateKey;
        return this;
    }

    getRecoveryRSAPrivateKey(){
        return this._attributes.recoveryRSAPrivateKey ?? null;
    }

    setRecoveryKey(recoveryKey){
        this._attributes.recoveryKey = recoveryKey;
        return this;
    }

    getRecoveryKey(){
        return this._attributes.recoveryKey ?? null;
    }

    setProfilePictureID(profilePictureID){
        this._attributes.profilePictureID = profilePictureID;
        return this;
    }

    getProfilePictureID(){
        return this._attributes.profilePictureID ?? null;
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

    setSurname(surname){
        this._attributes.surname = surname;
        return this;
    }

    getSurname(){
        return this._attributes.surname ?? null;
    }

    setName(name){
        this._attributes.name = name;
        return this;
    }

    getName(){
        return this._attributes.name ?? null;
    }

    toJSON(withPrivateKey = false){
        const JSONObject = super.toJSON();
        if ( withPrivateKey !== true ){
            delete JSONObject.RSAPrivateKeyEncryptionParameters;
            delete JSONObject.RSAPrivateKey;
        }
        return JSONObject;
    }
}

export default User;
