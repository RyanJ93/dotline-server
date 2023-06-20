'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import StickerPack from '../models/StickerPack.js';
import Injector from '../facades/Injector.js';
import Service from './Service.js';
import fs from 'node:fs/promises';

class StickerPackService extends Service {
    /**
     * @type {StickerPackRepository}
     */
    #stickerPackRepository;

    /**
     * @type {?StickerPack}
     */
    #stickerPack = null;

    /**
     * The class constructor.
     *
     * @param {?StickerPack} [stickerPack]
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack is given.
     */
    constructor(stickerPack = null){
        super();

        this.#stickerPackRepository = Injector.inject('StickerPackRepository');
        this.setStickerPack(stickerPack);
    }

    /**
     * Sets the sticker pack.
     *
     * @param {?StickerPack} stickerPack
     *
     * @returns {StickerPackService}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack is given.
     */
    setStickerPack(stickerPack){
        if ( stickerPack !== null && !( stickerPack instanceof StickerPack ) ){
            throw new IllegalArgumentException('Invalid sticker pack.');
        }
        this.#stickerPack = stickerPack;
        return this;
    }

    /**
     * Returns the sticker pack.
     *
     * @returns {StickerPack}
     */
    getStickerPack(){
        return this.#stickerPack;
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
    async getStickerPackByID(id){
        return this.#stickerPack = await this.#stickerPackRepository.findByID(id);
    }

    /**
     * Returns all the available sticker packs.
     *
     * @returns {Promise<StickerPack[]>}
     */
    async list(){
        return await this.#stickerPackRepository.getAll();
    }

    /**
     * Creates a new sticker pack.
     *
     * @param {string} name
     * @param {string} coverPicturePath
     *
     * @returns {Promise<StickerPack>}
     *
     * @throws {IllegalArgumentException} If an invalid cover picture path is given.
     * @throws {IllegalArgumentException} If an invalid name is given.
     */
    async create(name, coverPicturePath){
        if ( coverPicturePath === '' || typeof coverPicturePath !== 'string' ){
            throw new IllegalArgumentException('Invalid cover picture path.');
        }
        const coverPicture = await fs.readFile(coverPicturePath);
        return this.#stickerPack = await this.#stickerPackRepository.create(name, coverPicture);
    }
}

export default StickerPackService;
