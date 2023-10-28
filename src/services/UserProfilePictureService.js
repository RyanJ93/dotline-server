'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import User from '../models/User.js';
import Service from './Service.js';
import path from 'node:path';
import sharp from 'sharp';
import fs from 'node:fs';

class UserProfilePictureService extends Service {
    /**
     * @type {User}
     */
    #user;

    /**
     * Returns the path to the directory where user profile picture will be stored into.
     *
     * @returns {Promise<string>}
     */
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

    /**
     * Processes user profile picture file.
     *
     * @param {string} path
     * @param {string} profilePictureID
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid profile picture ID is given.
     * @throws {IllegalArgumentException} If an invalid path is given.
     */
    async processProfilePictureFile(path, profilePictureID){
        if ( profilePictureID === '' || typeof profilePictureID !== 'string' ){
            throw new IllegalArgumentException('Invalid profile picture ID.');
        }
        if ( path === '' || typeof path !== 'string' ){
            throw new IllegalArgumentException('Invalid path.');
        }
        const baseStorageDirectory = await this.#getStorageDirectory(), size = UserProfilePictureService.PROFILE_PICTURE_SIZE;
        const image = sharp(path).resize(size, size);
        await Promise.all(UserProfilePictureService.OUTPUT_FORMAT_LIST.map((outputFormat) => {
            return image.toFile(baseStorageDirectory + '/' + profilePictureID + '.' + outputFormat);
        }));
    }

    /**
     * Removes all the files related to current user profile picture.
     *
     * @returns {Promise<void>}
     */
    async removeProfilePicture(){
        if ( this.#user.getProfilePictureID() !== null ){
            const baseStorageDirectory = ( await this.#getStorageDirectory() ) + '/' + this.#user.getID();
            await fs.promises.rm(baseStorageDirectory, { force: true, recursive: true });
        }
    }

    /**
     * Returns the path to the user profile picture defined.
     *
     * @param {string} profilePictureID
     * @param {string} format
     * @param {boolean} [absolutePath=false]
     *
     * @returns {Promise<?string>}
     *
     * @throws {IllegalArgumentException} If an invalid or unsupported format is given.
     * @throws {IllegalArgumentException} If an invalid profile picture ID is given.
     */
    async getProfilePictureFile(profilePictureID, format, absolutePath = false){
        if ( UserProfilePictureService.OUTPUT_FORMAT_LIST.indexOf(format) === -1 ){
            throw new IllegalArgumentException('Invalid or unsupported format.');
        }
        if ( profilePictureID === '' || typeof profilePictureID !== 'string' ){
            throw new IllegalArgumentException('Invalid profile picture ID.');
        }
        let profilePicturePath = null, currentProfilePictureID = this.#user.getProfilePictureID()?.toString() ?? null;
        if ( currentProfilePictureID !== null && currentProfilePictureID.toString() === profilePictureID ){
            const baseStorageDirectory = await this.#getStorageDirectory();
            if ( fs.existsSync(baseStorageDirectory + '/' + profilePictureID + '.' + format) ){
                profilePicturePath = baseStorageDirectory + '/' + profilePictureID + '.' + format;
                if ( absolutePath === true ){
                    profilePicturePath = path.resolve(profilePicturePath);
                }
            }
        }
        return profilePicturePath;
    }
}

/**
 * @constant {string[]}
 */
Object.defineProperty(UserProfilePictureService, 'OUTPUT_FORMAT_LIST', { value: Object.freeze(['jpg', 'webp', 'avif']), writable: false });

/**
 * @constant {number}
 */
Object.defineProperty(UserProfilePictureService, 'PROFILE_PICTURE_SIZE', { value: 128, writable: false });

export default UserProfilePictureService;
