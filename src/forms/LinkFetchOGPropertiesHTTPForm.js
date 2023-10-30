'use strict';

import HTTPForm from './HTTPForm.js';

class LinkFetchOGPropertiesHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            url: { rules: { ['non-empty-string']: { msg: 'You must provide a valid URL.' } }, isRequired: true }
        };
    }
}

export default LinkFetchOGPropertiesHTTPForm;
