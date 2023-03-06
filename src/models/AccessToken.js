'use strict';

import Geolocation from '../DTOs/Geolocation.js';
import Model from './Model.js';
import User from './User.js';

class AccessToken extends Model {
    constructor(){
        super();

        this._mapping = {
            tableName: 'access_tokens',
            keys: ['access_token'],
            hiddenFields: ['user'],
            fields: {
                user: { name: 'user_id', relation: { model: User, mapping: { user_id: { foreign: 'id', method: 'getID' } }} },
                location: { name: 'location', UDTImplementation: Geolocation },
                browserName: { name: 'browser_name', type: 'string' },
                accessToken: { name: 'access_token', type: 'string' },
                firstAccess: { name: 'first_access', type: 'date' },
                lastAccess: { name: 'last_access', type: 'date' },
                OSName: { name: 'os_name', type: 'date' },
                ip: { name: 'ip', type: 'inet' }
            }
        };
    }

    setUser(user){
        this._attributes.user = user;
        return this;
    }

    getUser(){
        return this._attributes.user ?? null;
    }

    setAccessToken(accessToken){
        this._attributes.accessToken = accessToken;
        return this;
    }

    getAccessToken(){
        return this._attributes.accessToken ?? null;
    }

    setFirstAccess(firstAccess){
        this._attributes.firstAccess = firstAccess;
        return this;
    }

    getFirstAccess(){
        return this._attributes.firstAccess ?? null;
    }

    setLastAccess(lastAccess){
        this._attributes.lastAccess = lastAccess;
        return this;
    }

    getLastAccess(){
        return this._attributes.lastAccess ?? null;
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

export default AccessToken;
