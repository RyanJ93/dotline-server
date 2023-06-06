'use strict';

import UserVerifyUsernameHTTPForm from '../forms/UserVerifyUsernameHTTPForm.js';
import AESEncryptionParameters from '../DTOs/AESEncryptionParameters.js';
import AccessTokenService from '../services/AccessTokenService.js';
import UserSignupHTTPForm from '../forms/UserSignupHTTPForm.js';
import UserSearchHTTPForm from '../forms/UserSearchHTTPForm.js';
import UserLoginHTTPForm from '../forms/UserLoginHTTPForm.js';
import UserEditHTTPForm from '../forms/UserEditHTTPForm.js';
import UserService from '../services/UserService.js';
import Controller from './Controller.js';

class UserController extends Controller {
    /**
     * Handles username verification requests.
     *
     * @returns {Promise<void>}
     */
    async verifyUsername(){
        const userVerifyUsernameHTTPForm = new UserVerifyUsernameHTTPForm(), userService = new UserService();
        userVerifyUsernameHTTPForm.validate(this._request.query);
        const isUsernameAvailable = await userService.isUsernameAvailable(this._request.query.username);
        this._sendSuccessResponse(200, 'SUCCESS', { isUsernameAvailable: isUsernameAvailable });
    }

    /**
     * Handles user signup requests.
     *
     * @returns {Promise<void>}
     */
    async signup(){
        const userSignupHTTPForm = new UserSignupHTTPForm(), userService = new UserService();
        userSignupHTTPForm.validate(this._request.body);
        const { RSAPublicKey, RSAPrivateKey, username, password } = this._request.body;
        const RSAPrivateKeyEncryptionParameters = AESEncryptionParameters.makeFromHTTPRequest(this._request, 'RSAPrivateKeyEncryptionParameters');
        const user = await userService.signup(username, password, RSAPublicKey, RSAPrivateKey, RSAPrivateKeyEncryptionParameters);
        const accessToken = await userService.generateAccessToken(user, this._request);
        this._sendSuccessResponse(200, 'SUCCESS', {
            user: user.toJSON(true),
            accessToken: accessToken
        });
    }

    /**
     * Handles user login requests.
     *
     * @returns {Promise<void>}
     */
    async login(){
        const userLoginHTTPForm = new UserLoginHTTPForm(), userService = new UserService();
        userLoginHTTPForm.validate(this._request.body);
        let { username, password } = this._request.body, user = null, accessToken = null;
        if ( typeof this._request.accessToken === 'string' && this._request.accessToken !== '' ){
            const accessTokenService = await AccessTokenService.makeFromAccessToken(this._request.accessToken);
            if ( accessTokenService !== null ){
                accessToken = accessTokenService.getAccessToken();
                user = accessToken.getUser();
            }
        }
        if ( user === null ){
            user = await userService.authenticateWithCredentials(username, password);
            accessToken = await userService.generateAccessToken(user, this._request);
        }
        this._sendSuccessResponse(200, 'SUCCESS', {
            user: user.toJSON(true),
            accessToken: accessToken
        });
    }

    /**
     * Handles user logout requests.
     *
     * @returns {Promise<void>}
     */
    async logout(){
        const accessTokenService = new AccessTokenService(), { accessToken } = this._request;
        await accessTokenService.deleteAccessToken(accessToken);
        this._sendSuccessResponse();
    }

    /**
     * Handles user info requests.
     *
     * @returns {Promise<void>}
     */
    async info(){
        this._sendSuccessResponse(200, 'SUCCESS', { user: this._request.authenticatedUser.toJSON(true) });
    }

    /**
     * Handles user search requests.
     *
     * @returns {Promise<void>}
     */
    async search(){
        new UserSearchHTTPForm().validate(this._request.query);
        let userList = await new UserService().searchByUsername(this._request.query.username);
        const authenticatedUserID = this._request.authenticatedUser.getID().toString();
        userList = userList.filter((user) => user.getID().toString() !== authenticatedUserID);
        this._sendSuccessResponse(200, 'SUCCESS', { userList: userList });
    }

    /**
     * Handles user edit requests.
     *
     * @returns {Promise<void>}
     */
    async edit(){
        new UserEditHTTPForm().validate(this._request.body);
        const userService = new UserService(this._request.authenticatedUser);
        const { username, name, surname } = this._request.body;
        await userService.edit(username, name, surname);
        this._sendSuccessResponse(200, 'SUCCESS', { user: userService.getUser().toJSON(true) });
    }
}

export default UserController;
