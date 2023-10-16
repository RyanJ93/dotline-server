'use strict';

import HTTPForm from './HTTPForm.js';

class UserProfilePictureChangeHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            picture: { rules: {
                ['mime-type']: { msg: 'You must provide an accepted image file.', params: { MIMETypeList: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp', 'image/avif'] } } ,
                ['file-size']: { msg: 'Provided image file is too big.', params: { maxSize: 10485760 } }
            }, isRequired: true },
        };
    }
}

export default UserProfilePictureChangeHTTPForm;
