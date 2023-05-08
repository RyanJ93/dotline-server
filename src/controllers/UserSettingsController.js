'use strict';

import UserSettingsEditHTTPForm from '../forms/UserSettingsEditHTTPForm.js';
import UserSettingsService from '../services/UserSettingsService.js';
import Controller from './Controller.js';

class UserSettingsController extends Controller {
    /**
     *
     *
     * @returns {Promise<void>}
     */
    async get(){
        const userSettings = await new UserSettingsService().assertSettings(this._request.authenticatedUser);
        this._sendSuccessResponse(200, 'SUCCESS', { userSettings: userSettings });
    }

    /**
     *
     *
     * @returns {Promise<void>}
     */
    async edit(){
        new UserSettingsEditHTTPForm().validate(this._request.body);
        const userSettingsService = new UserSettingsService();
        const { locale, theme } = this._request.body;
        await userSettingsService.assertSettings(this._request.authenticatedUser);
        await userSettingsService.edit(locale, theme);
        this._sendSuccessResponse(200, 'SUCCESS', { userSettings: userSettingsService.getUserSettings() });
    }
}

export default UserSettingsController;
