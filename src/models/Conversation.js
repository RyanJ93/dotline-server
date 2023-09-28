'use strict';

import HMACSigningParameters from '../DTOs/HMACSigningParameters.js';
import AESStaticParameters from '../DTOs/AESStaticParameters.js';
import Model from './Model.js';

class Conversation extends Model {
    constructor(){
        super();

        this._mapping = {
            tableName: 'conversations',
            keys: ['id'],
            fields: {
                encryptionParameters: { name: 'encryption_parameters', UDTImplementation: AESStaticParameters },
                signingParameters: { name: 'signing_parameters', UDTImplementation: HMACSigningParameters },
                members: { name: 'members', type: 'map' },
                name: { name: 'name', type: 'string' },
                id: { name: 'id', type: 'timeuuid' }
            }
        };
    }

    isDMConversation(){
        return this.getName() === null && Object.keys(this.getMembers()).length === 2;
    }

    hasDeletedMembers(){
        let hasDeletedMembers = false, members = this.getMembers();
        for ( const userID in members ){
            if ( members[userID].deleted_at !== null ){
                hasDeletedMembers = true;
                break;
            }
        }
        return hasDeletedMembers;
    }

    setEncryptionParameters(encryptionParameters){
        this._attributes.encryptionParameters = encryptionParameters;
        return this;
    }

    getEncryptionParameters(){
        return this._attributes.encryptionParameters ?? null;
    }

    setSigningParameters(signingParameters){
        this._attributes.signingParameters = signingParameters;
        return this;
    }

    getSigningParameters(){
        return this._attributes.signingParameters ?? null;
    }

    setMembers(members){
        this._attributes.members = members;
        return this;
    }

    getMembers(){
        return this._attributes.members ?? null;
    }

    setName(name){
        this._attributes.name = name;
        return this;
    }

    getName(){
        return this._attributes.name ?? null;
    }

    setID(id){
        this._attributes.id = id;
        return this;
    }

    getID(){
        return this._attributes.id ?? null;
    }
}

export default Conversation;
