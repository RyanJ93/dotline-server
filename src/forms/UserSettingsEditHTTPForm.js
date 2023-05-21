'use strict';

import HTTPForm from './HTTPForm.js';

class UserSettingsEditHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            locale: { rules: { ['non-empty-string']: { msg: 'You must provide a valid locale.' } }, isRequired: true },
            theme: { rules: { ['non-empty-string']: { msg: 'You must provide a valid theme.' } }, isRequired: true }
        };
    }
}

export default UserSettingsEditHTTPForm;
