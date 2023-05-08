'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import CassandraRepository from './CassandraRepository.js';
import UserSettings from '../models/UserSettings.js';
import User from '../models/User.js';

class UserSettingsRepository extends CassandraRepository {
    /**
     * Finds the settings associated to a given user.
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
        return await UserSettings.findOne({ user: user.getID() });
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
        const userSettings = new UserSettings();
        userSettings.setLocale('en-US');
        userSettings.setTheme('auto');
        userSettings.setUser(user);
        await userSettings.save();
        return userSettings;
    }

    /**
     * Edits the user settings defined.
     *
     * @param {UserSettings} userSettings
     * @param {string} locale
     * @param {string} theme
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid user settings instance is given.
     * @throws {IllegalArgumentException} If an invalid locale is given.
     * @throws {IllegalArgumentException} If an invalid theme is given.
     */
    async edit(userSettings, locale, theme){
        if ( locale === '' || typeof locale !== 'string' ){
            throw new IllegalArgumentException('Invalid locale.');
        }
        if ( theme === '' || typeof theme !== 'string' ){
            throw new IllegalArgumentException('Invalid theme.');
        }
        if ( !( userSettings instanceof UserSettings ) ){
            throw new IllegalArgumentException('Invalid user settings.');
        }
        userSettings.setLocale(locale);
        userSettings.setTheme(theme);
        await userSettings.save();
    }
}

export default UserSettingsRepository;
