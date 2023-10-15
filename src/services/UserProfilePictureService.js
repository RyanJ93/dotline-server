'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import User from '../models/User.js';
import Service from './Service.js';
import sharp from 'sharp';
import fs from 'node:fs';

class UserProfilePictureService extends Service {
    /**
     * @type {User}
     */
    #user;

    async #getStorageDirectory(){
        const storageDirectory = './storage/profile_pictures/' + this.#user.getID();
        if ( !fs.existsSync(storageDirectory) ){
            await fs.promises.mkdir(storageDirectory, { recursive: true });
        }
        return storageDirectory;
    }

    /**
     * The class constructor.
     *
     * @param {User} user
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    constructor(user){
        super();

        this.setUser(user);
    }

    /**
     * Sets the user.
     *
     * @param {User} user
     *
     * @returns {UserProfilePictureService}
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    setUser(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        this.#user = user;
        return this;
    }

    /**
     * Returns the user.
     *
     * @returns {User}
     */
    getUser(){
        return this.#user;
    }

    async changeProfilePicture(path){
        const image = sharp(path).resize(128, 128), baseStorageDirectory = await this.#getStorageDirectory();
        await Promise.all(UserProfilePictureService.OUTPUT_FORMAT_LIST.map((outputFormat) => {
            return image.toFile(baseStorageDirectory + '/' + this.#user.getID() + '.' + outputFormat);
        }));
    }

    async removeProfilePicture(){

    }
}

/**
 * @constant {string[]}
 */
Object.defineProperty(UserProfilePictureService, 'OUTPUT_FORMAT_LIST', {
    value: Object.freeze(['jpg', 'webp', 'avif']),
    writable: false
});

export default UserProfilePictureService;
