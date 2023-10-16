'use strict';

import UserProfilePictureChangeHTTPForm from '../forms/UserProfilePictureChangeHTTPForm.js';
import UserService from '../services/UserService.js';
import Controller from './Controller.js';

class UserProfilePictureController extends Controller {
    async remove(){
        await new UserService(this._request.authenticatedUser).removeProfilePicture();
        this._sendSuccessResponse(200, 'SUCCESS');
    }

    async change(){
        new UserProfilePictureChangeHTTPForm().validate(Object.assign(this._request.body, this._request.files));
        const { picture } = this._request.files, { authenticatedUser } = this._request;
        await new UserService(authenticatedUser).changeProfilePicture(picture.file);
        this._sendSuccessResponse(200, 'SUCCESS', {
            profilePictureID: authenticatedUser.getProfilePictureID()
        });
    }

    async get(){
        const { userID, profilePictureID } = this._request.params, format = this._request.params.format ?? 'jpg';
        const userService = await UserService.makeFromEntity(userID);
        const path = await userService.getProfilePictureFile(profilePictureID, format, true);
        return path === null ? this._response.send(null) : this._response.sendFile(path);
    }
}

export default UserProfilePictureController;
