'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import CassandraRepository from './CassandraRepository.js';
import StickerPack from '../models/StickerPack.js';

class StickerPackRepository extends CassandraRepository {
    /**
     * Returns all the available sticker packs.
     *
     * @returns {Promise<StickerPack[]>}
     */
    async getAll(){
        return await StickerPack.find({});
    }

    /**
     * Returns the sticker pack matching the given ID.
     *
     * @param {string} id
     *
     * @returns {Promise<?StickerPack>}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack ID is given.
     */
    async findByID(id){
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid sticker pack ID.');
        }
        return await StickerPack.findOne({ id: id });
    }

    /**
     * Creates a new sticker pack.
     *
     * @param {string} name
     * @param {Buffer} coverPicture
     *
     * @returns {Promise<StickerPack>}
     *
     * @throws {IllegalArgumentException} If an invalid cover picture is given.
     * @throws {IllegalArgumentException} If an invalid name is given.
     */
    async create(name, coverPicture){
        if ( name === '' || typeof name !== 'string' ){
            throw new IllegalArgumentException('Invalid name.');
        }
        if ( !Buffer.isBuffer(coverPicture) ){
            throw new IllegalArgumentException('Invalid cover picture.');
        }
        const stickerPack = new StickerPack();
        stickerPack.setID(StickerPackRepository.generateTimeUUID());
        stickerPack.setCoverPicture(coverPicture);
        stickerPack.setCreatedAt(new Date());
        stickerPack.setName(name);
        await stickerPack.save();
        return stickerPack;
    }
}

export default StickerPackRepository;
