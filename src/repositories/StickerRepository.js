'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import CassandraRepository from './CassandraRepository.js';
import StickerPack from '../models/StickerPack.js';
import Sticker from '../models/Sticker.js';

class StickerRepository extends CassandraRepository {
    /**
     * Returns all the stickers contained within a given sticker pack.
     *
     * @param {StickerPack} stickerPack
     *
     * @returns {Promise<Sticker[]>}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack is given.
     */
    async getByStickerPack(stickerPack){
        if ( !( stickerPack instanceof StickerPack ) ){
            throw new IllegalArgumentException('Invalid sticker pack.');
        }
        return await Sticker.find({ stickerPack: stickerPack.getID() }, null, ['stickerPack']);
    }

    /**
     * Returns the sticker matching the given ID.
     *
     * @param {StickerPack} stickerPack
     * @param {string} id
     *
     * @returns {Promise<?Sticker>}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack is given.
     * @throws {IllegalArgumentException} If an invalid sticker ID is given.
     */
    async findByID(stickerPack, id){
        if ( !( stickerPack instanceof StickerPack ) ){
            throw new IllegalArgumentException('Invalid sticker pack.');
        }
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid sticker ID.');
        }
        return await Sticker.findOne({ stickerPack: stickerPack.getID(), id: id }, null, ['stickerPack']);
    }

    /**
     * Creates a new sticker.
     *
     * @param {StickerPack} stickerPack
     * @param {Buffer} content
     * @param {string} emoji
     * @param {boolean} isAnimated
     *
     * @returns {Promise<Sticker>}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack is given.
     * @throws {IllegalArgumentException} If an invalid content is given.
     * @throws {IllegalArgumentException} If an invalid emoji is given.
     */
    async create(stickerPack, content,  emoji, isAnimated){
        if ( emoji === '' || typeof emoji !== 'string' ){
            throw new IllegalArgumentException('Invalid emoji.');
        }
        if ( !( stickerPack instanceof StickerPack ) ){
            throw new IllegalArgumentException('Invalid sticker pack.');
        }
        if ( !Buffer.isBuffer(content) ){
            throw new IllegalArgumentException('Invalid content.');
        }
        const sticker = new Sticker();
        sticker.setID(StickerRepository.generateTimeUUID());
        sticker.setAnimated(isAnimated === true);
        sticker.setStickerPack(stickerPack);
        sticker.setContent(content);
        sticker.setEmoji(emoji);
        await sticker.save();
        return sticker;
    }
}

export default StickerRepository;
