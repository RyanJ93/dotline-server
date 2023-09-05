'use strict';

import GeoLocation from '../DTOs/GeoLocation.js';
import Model from './Model.js';
import User from './User.js';

class UserRecoverySession extends Model {
    constructor(){
        super();

        this._mapping = {
            tableName: 'user_recovery_sessions',
            keys: ['session_token'],
            fields: {
                user: { name: 'user_id', relation: { model: User, mapping: { user_id: { foreign: 'id', method: 'getID' } }} },
                location: { name: 'location', UDTImplementation: GeoLocation },
                sessionToken: { name: 'session_token', type: 'string' },
                browserName: { name: 'browser_name', type: 'string' },
                createdAt: { name: 'created_at', type: 'timestamp' },
                expiresAt: { name: 'expires_at', type: 'timestamp' },
                userAgent: { name: 'user_agent', type: 'string' },
                fulfilled: { name: 'fulfilled', type: 'boolean' },
                OSName: { name: 'os_name', type: 'date' },
                ip: { name: 'ip', type: 'inet' }
            }
        };
    }

    setSessionToken(sessionToken){
        this._attributes.sessionToken = sessionToken;
        return this;
    }

    getSessionToken(){
        return this._attributes.sessionToken ?? null;
    }

    setCreatedAt(createdAt){
        this._attributes.createdAt = createdAt;
        return this;
    }

    getCreatedAt(){
        return this._attributes.createdAt ?? null;
    }

    setExpiresAt(expiresAt){
        this._attributes.expiresAt = expiresAt;
        return this;
    }

    getExpiresAt(){
        return this._attributes.expiresAt ?? null;
    }

    setUser(user){
        this._attributes.user = user;
        return this;
    }

    getUser(){
        return this._attributes.user ?? null;
    }

    setUserAgent(userAgent){
        this._attributes.userAgent = userAgent;
        return this;
    }

    getUserAgent(){
        return this._attributes.userAgent ?? null;
    }

    setLocation(location){
        this._attributes.location = location;
        return this;
    }

    getLocation(){
        return this._attributes.location ?? null;
    }

    setBrowserName(browserName){
        this._attributes.browserName = browserName;
        return this;
    }

    getBrowserName(){
        return this._attributes.browserName ?? null;
    }

    setFulfilled(fulfilled){
        this._attributes.fulfilled = fulfilled;
        return this;
    }

    getFulfilled(){
        return this._attributes.fulfilled ?? null;
    }

    setOSName(OSName){
        this._attributes.OSName = OSName;
        return this;
    }

    getOSName(){
        return this._attributes.OSName ?? null;
    }

    setIP(ip){
        this._attributes.ip = ip;
        return this;
    }

    getIP(){
        return this._attributes.ip ?? null;
    }
}

export default UserRecoverySession;
