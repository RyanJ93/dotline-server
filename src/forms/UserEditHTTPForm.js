'use strict';

import HTTPForm from './HTTPForm.js';

class UserEditHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            surname: { rules: { ['string-length']: { msg: 'You must provide a valid surname.', params: { maxLength: 25 } } }, isRequired: false },
            name: { rules: { ['string-length']: { msg: 'You must provide a valid name.', params: { maxLength: 25 } } }, isRequired: false },
            username: { rules: { ['username']: { msg: 'You must provide a valid username.' } }, isRequired: true }
        };
    }
}

export default UserEditHTTPForm;
