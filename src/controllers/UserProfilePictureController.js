'use strict';

import UserProfilePictureChangeHTTPForm from '../forms/UserProfilePictureChangeHTTPForm.js';
import UserProfilePictureService from '../services/UserProfilePictureService.js';
import Controller from './Controller.js';

class UserProfilePictureController extends Controller {
    async remove(){
        await new UserProfilePictureService(this._request.authenticatedUser).removeProfilePicture();
        this._sendSuccessResponse(200, 'SUCCESS');
    }

    async change(){
        new UserProfilePictureChangeHTTPForm().validate(Object.assign(this._request.body, this._request.files));
        const { picture } = this._request.files, { authenticatedUser } = this._request;
        await new UserProfilePictureService(authenticatedUser).changeProfilePicture(picture.file);
        this._sendSuccessResponse(200, 'SUCCESS');
    }
}

export default UserProfilePictureController;
