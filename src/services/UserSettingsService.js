'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import UserSettings from '../models/UserSettings.js';
import Injector from '../facades/Injector.js';
import User from '../models/User.js';
import Service from './Service.js';

class UserSettingsService extends Service {
    /**
     * @type {UserSettingsRepository}
     */
    #userSettingsRepository;

    /**
     * @type {?UserSettings}
     */
    #userSettings = null;

    /**
     * The class constructor.
     *
     * @param {?UserSettings} [userSettings]
     */
    constructor(userSettings = null){
        super();

        this.#userSettingsRepository = Injector.inject('UserSettingsRepository');
        this.setUserSettings(userSettings);
    }

    /**
     * Sets the user settings.
     *
     * @param {?UserSettings} userSettings
     *
     * @returns {UserSettingsService}
     *
     * @throws {IllegalArgumentException} If an invalid user settings instance is given.
     */
    setUserSettings(userSettings){
        if ( userSettings !== null && !( userSettings instanceof UserSettings ) ){
            throw new IllegalArgumentException('Invalid user settings.');
        }
        this.#userSettings = userSettings;
        return this;
    }

    /**
     * Returns the user settings defined.
     *
     * @returns {?UserSettings}
     */
    getUserSettings(){
        return this.#userSettings;
    }

    /**
     * Finds settings associated to a given user.
     *
     * @param {User} user
     *
     * @returns {Promise<?UserSettings>}
     *
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async findByUser(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        return this.#userSettings = await this.#userSettingsRepository.findByUser(user);
    }

    /**
     * Generates default settings for the given user.
     *
     * @param {User} user
     *
     * @returns {Promise<UserSettings>}
     *
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async storeDefaults(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        return this.#userSettings = await this.#userSettingsRepository.storeDefaults(user);
    }

    /**
     * Finds settings associated to a given user of creates some default ones if not found.
     *
     * @param {User} user
     *
     * @returns {Promise<UserSettings>}
     *
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async assertSettings(user){
        await this.findByUser(user);
        if ( this.#userSettings === null ){
            await this.storeDefaults(user);
        }
        return this.#userSettings;
    }

    /**
     * Edits the user settings defined.
     *
     * @param {string} locale
     * @param {string} theme
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid locale is given.
     * @throws {IllegalArgumentException} If an invalid theme is given.
     */
    async edit(locale, theme){
        if ( locale === '' || typeof locale !== 'string' ){
            throw new IllegalArgumentException('Invalid locale.');
        }
        if ( theme === '' || typeof theme !== 'string' ){
            throw new IllegalArgumentException('Invalid theme.');
        }
        await this.#userSettingsRepository.edit(this.#userSettings, locale, theme);
    }
}

export default UserSettingsService;
