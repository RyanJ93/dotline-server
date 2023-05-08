'use strict';

import Model from './Model.js';
import User from './User.js';

class UserSettings extends Model {
    constructor(){
        super();

        this._mapping = {
            keys: ['user_id'],
            tableName: 'user_settings',
            fields: {
                user: { name: 'user_id', relation: { model: User, mapping: { user_id: { foreign: 'id', method: 'getID' } }} },
                locale: { name: 'locale', type: 'string' },
                theme: { name: 'theme', type: 'string' }
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

    setLocale(locale){
        this._attributes.locale = locale;
        return this;
    }

    getLocale(){
        return this._attributes.locale ?? null;
    }

    setTheme(theme){
        this._attributes.theme = theme;
        return this;
    }

    getTheme(){
        return this._attributes.theme ?? null;
    }
}

export default UserSettings;
