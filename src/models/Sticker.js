'use strict';

import StickerPack from './StickerPack.js';
import Model from './Model.js';

class Sticker extends Model {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            tableName: 'stickers',
            keys: ['sticker_pack_id', 'id'],
            fields: {
                stickerPack: { name: 'sticker_pack_id', relation: { model: StickerPack, mapping: { sticker_pack_id: { foreign: 'id', method: 'getID' } }} },
                animated: { name: 'animated', type: 'boolean' },
                content: { name: 'content', type: 'blob' },
                emoji: { name: 'emoji', type: 'string' },
                id: { name: 'id', type: 'timeuuid' }
            }
        };
    }

    setStickerPack(stickerPack){
        this._attributes.stickerPack = stickerPack;
        return this;
    }

    getStickerPack(){
        return this._attributes.stickerPack ?? null;
    }

    setAnimated(animated){
        this._attributes.animated = animated;
        return this;
    }

    getAnimated(){
        return this._attributes.animated ?? null;
    }

    setContent(content){
        this._attributes.content = content;
        return this;
    }

    getContent(){
        return this._attributes.content ?? null;
    }

    setEmoji(emoji){
        this._attributes.emoji = emoji;
        return this;
    }

    getEmoji(){
        return this._attributes.emoji ?? null;
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
        if ( Buffer.isBuffer(JSONObject.content) ){
            const contentHeader = JSONObject.animated === true ? 'video/webm;base64,' : 'image/jpg;base64,';
            JSONObject.content = contentHeader + JSONObject.content.toString('base64');
        }
        return JSONObject;
    }
}

export default Sticker;
