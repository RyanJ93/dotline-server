'use strict';

import Model from './Model.js';

class StickerPack extends Model {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            tableName: 'sticker_packs',
            keys: ['id'],
            fields: {
                coverPicture: { name: 'cover_picture', type: 'blob' },
                createdAt: { name: 'created_at', type: 'date' },
                name: { name: 'name', type: 'string' },
                id: { name: 'id', type: 'timeuuid' }
            }
        };
    }

    setCoverPicture(coverPicture){
        this._attributes.coverPicture = coverPicture;
        return this;
    }

    getCoverPicture(){
        return this._attributes.coverPicture ?? null;
    }

    setCreatedAt(createdAt){
        this._attributes.createdAt = createdAt;
        return this;
    }

    getCreatedAt(){
        return this._attributes.createdAt ?? null;
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

    toJSON(){
        const JSONObject = super.toJSON();
        if ( Buffer.isBuffer(JSONObject.coverPicture) ){
            JSONObject.coverPicture = 'image/jpg;base64,' + JSONObject.coverPicture.toString('base64');
        }
        return JSONObject;
    }
}

export default StickerPack;
