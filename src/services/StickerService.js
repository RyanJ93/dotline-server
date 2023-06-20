'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import EntityNotFoundException from '../exceptions/EntityNotFoundException.js';
import StickerPackService from './StickerPackService.js';
import StickerPack from '../models/StickerPack.js';
import Injector from '../facades/Injector.js';
import Sticker from '../models/Sticker.js';
import Service from './Service.js';
import fs from 'node:fs/promises';

class StickerService extends Service {
    /**
     * Generates an instance of this class based on the given entity identifiers.
     *
     * @param {string} stickerPackID
     * @param {?string} stickerID
     *
     * @returns {Promise<StickerService>}
     *
     * @throws {EntityNotFoundException} If no sticker pack matching the given ID is found.
     * @throws {EntityNotFoundException} If no sticker matching the given ID is found.
     * @throws {IllegalArgumentException} If an invalid sticker pack ID is given.
     * @throws {IllegalArgumentException} If an invalid sticker ID is given.
     */
    static async makeFromEntity(stickerPackID, stickerID = null){
        if ( stickerID !== null && ( stickerID === '' || typeof stickerID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid sticker ID.');
        }
        if ( stickerPackID === '' || typeof stickerPackID !== 'string' ){
            throw new IllegalArgumentException('Invalid sticker pack ID.');
        }
        const stickerPack = await new StickerPackService().getStickerPackByID(stickerPackID);
        if ( stickerPack === null ){
            throw new EntityNotFoundException('No sticker pack found for the given ID.');
        }
        const stickerService = new StickerService(stickerPack);
        if ( stickerID !== null ){
            // A sticker ID has been provided, find the associated sticker.
            await stickerService.getStickerByID(stickerID);
            if ( stickerService.getSticker() === null ){
                throw new EntityNotFoundException('No sticker found for the given ID.');
            }
        }
        return stickerService;
    }

    /**
     * @type {StickerRepository}
     */
    #stickerRepository;

    /**
     * @type {StickerPack}
     */
    #stickerPack;

    /**
     * @type {?Sticker}
     */
    #sticker = null;

    /**
     * The class constructor.
     *
     * @param {StickerPack} stickerPack
     * @param {?Sticker} [sticker]
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack is given.
     * @throws {IllegalArgumentException} If an invalid sticker is given.
     */
    constructor(stickerPack, sticker = null){
        super();

        this.#stickerRepository = Injector.inject('StickerRepository');
        this.setStickerPack(stickerPack);
        this.setSticker(sticker);
    }

    /**
     * Sets the sticker pack.
     *
     * @param {StickerPack} stickerPack
     *
     * @returns {StickerService}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack is given.
     */
    setStickerPack(stickerPack){
        if ( !( stickerPack instanceof StickerPack ) ){
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
     * Sets the sticker.
     *
     * @param {?Sticker} sticker
     *
     * @returns {StickerService}
     *
     * @throws {IllegalArgumentException} If an invalid sticker is given.
     */
    setSticker(sticker){
        if ( sticker !== null && !( sticker instanceof Sticker ) ){
            throw new IllegalArgumentException('Invalid sticker.');
        }
        this.#sticker = sticker;
        return this;
    }

    /**
     * Returns the sticker.
     *
     * @returns {?Sticker}
     */
    getSticker(){
        return this.#sticker;
    }

    /**
     * Returns the sticker matching the given ID.
     *
     * @param {string} id
     *
     * @returns {Promise<?Sticker>}
     *
     * @throws {IllegalArgumentException} If an invalid sticker ID is given.
     */
    async getStickerByID(id){
        return this.#sticker = await this.#stickerRepository.findByID(this.#stickerPack, id);
    }

    /**
     * Returns all the stickers contained within the defined sticker pack.
     *
     * @returns {Promise<Sticker[]>}
     */
    async list(){
        return await this.#stickerRepository.getByStickerPack(this.#stickerPack);
    }

    /**
     * Creates a new sticker.
     *
     * @param {string} contentPath
     * @param {string} emoji
     * @param {boolean} isAnimated
     *
     * @returns {Promise<Sticker>}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack is given.
     * @throws {IllegalArgumentException} If an invalid content path is given.
     * @throws {IllegalArgumentException} If an invalid emoji is given.
     */
    async create(contentPath, emoji, isAnimated = false){
        if ( contentPath === '' || typeof contentPath !== 'string' ){
            throw new IllegalArgumentException('Invalid content path.');
        }
        const content = await fs.readFile(contentPath);
        return this.#sticker = await this.#stickerRepository.create(this.#stickerPack, content, emoji, isAnimated);
    }
}

export default StickerService;
