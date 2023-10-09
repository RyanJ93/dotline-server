'use strict';

import UserRegenerateRecoveryKeyHTTPForm from '../forms/UserRegenerateRecoveryKeyHTTPForm.js';
import UserInitAccountRecoveryHTTPForm from '../forms/UserInitAccountRecoveryHTTPForm.js';
import UserRecoverySessionService from '../services/UserRecoverySessionService.js';
import UserRecoverAccountHTTPForm from '../forms/UserRecoverAccountHTTPForm.js';
import UserVerifyUsernameHTTPForm from '../forms/UserVerifyUsernameHTTPForm.js';
import UserChangePasswordHTTPForm from '../forms/UserChangePasswordHTTPForm.js';
import UserCompositeRSAParameters from '../DTOs/UserCompositeRSAParameters.js';
import ClientTrackingService from '../services/ClientTrackingService.js';
import AESEncryptionParameters from '../DTOs/AESEncryptionParameters.js';
import AccessTokenService from '../services/AccessTokenService.js';
import UserSignupHTTPForm from '../forms/UserSignupHTTPForm.js';
import UserSearchHTTPForm from '../forms/UserSearchHTTPForm.js';
import UserLoginHTTPForm from '../forms/UserLoginHTTPForm.js';
import UserEditHTTPForm from '../forms/UserEditHTTPForm.js';
import UserService from '../services/UserService.js';
import StringUtils from '../utils/StringUtils.js';
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
        new UserSignupHTTPForm().validate(this._request.body);
        const clientTrackingInfo = await new ClientTrackingService().getClientTrackingInfoByHTTPRequest(this._request);
        const userCompositeRSAParameters = UserCompositeRSAParameters.makeFromHTTPRequest(this._request);
        const userService = new UserService(), { username, password } = this._request.body;
        await userService.signup(username, password, userCompositeRSAParameters);
        const accessToken = await userService.generateAccessToken(clientTrackingInfo);
        this._sendSuccessResponse(200, 'SUCCESS', {
            user: userService.getUser().toJSON(true),
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
            const clientTrackingInfo = await new ClientTrackingService().getClientTrackingInfoByHTTPRequest(this._request);
            await userService.authenticateWithCredentials(username, password);
            accessToken = await userService.generateAccessToken(clientTrackingInfo);
        }
        this._sendSuccessResponse(200, 'SUCCESS', {
            user: userService.getUser().toJSON(true),
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
        let userList = [], { username } = this._request.query;
        if ( StringUtils.isValidUsername(username) ){
            userList = await new UserService().searchByUsername(username);
        }
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
        const surname = this._request.body.surname ?? null;
        const name = this._request.body.name ?? null;
        const username = this._request.body.username;
        await userService.edit(username, name, surname);
        this._sendSuccessResponse(200, 'SUCCESS', { user: userService.getUser().toJSON(true) });
    }

    async changePassword(){
        new UserChangePasswordHTTPForm().validate(this._request.body);
        const { RSAPrivateKey, newPassword, currentPassword } = this._request.body, userService = new UserService(this._request.authenticatedUser);
        const RSAPrivateKeyEncryptionParameters = AESEncryptionParameters.makeFromHTTPRequest(this._request, 'RSAPrivateKeyEncryptionParameters');
        await userService.changePassword(currentPassword, newPassword, RSAPrivateKey, RSAPrivateKeyEncryptionParameters);
        await new AccessTokenService().deleteUserTokens(this._request.authenticatedUser, this._request.accessToken);
        this._sendSuccessResponse();
    }

    async regenerateRecoveryKey(){
        new UserRegenerateRecoveryKeyHTTPForm().validate(this._request.body);
        const aesEncryptionParameters = AESEncryptionParameters.makeFromHTTPRequest(this._request, 'recoveryRSAPrivateKeyEncryptionParameters');
        const { recoveryRSAPrivateKey, recoveryKey } = this._request.body, userService = new UserService(this._request.authenticatedUser);
        await userService.regenerateRecoveryKey(aesEncryptionParameters, recoveryRSAPrivateKey, recoveryKey);
        this._sendSuccessResponse();
    }

    async initAccountRecovery(){
        new UserInitAccountRecoveryHTTPForm().validate(this._request.body);
        const clientTrackingInfo = await new ClientTrackingService().getClientTrackingInfoByHTTPRequest(this._request);
        const { username, recoveryKey } = this._request.body, userService = await UserService.makeFromEntity(username);
        const userRecoverySession = await userService.initUserRecoverySession(recoveryKey, clientTrackingInfo);
        this._sendSuccessResponse(200, 'SUCCESS', {
            recoveryParameters: userService.getRecoveryParameters().toJSON(),
            sessionToken: userRecoverySession.getSessionToken()
        });
    }

    async recoverAccount(){
        new UserRecoverAccountHTTPForm().validate(this._request.body);
        const RSAPrivateKeyEncryptionParameters = AESEncryptionParameters.makeFromHTTPRequest(this._request, 'RSAPrivateKeyEncryptionParameters');
        const userRecoverySessionService = await UserRecoverySessionService.makeFromSessionToken(this._request.body.sessionToken);
        const clientTrackingInfo = await new ClientTrackingService().getClientTrackingInfoByHTTPRequest(this._request);
        const userService = new UserService(userRecoverySessionService.getUserRecoverySession().getUser());
        const { RSAPrivateKey, password } = this._request.body;
        await userService.updatePassword(password, RSAPrivateKey, RSAPrivateKeyEncryptionParameters);
        const accessToken = await userService.generateAccessToken(clientTrackingInfo);
        await userRecoverySessionService.markAsFulfilled(true);
        await new AccessTokenService().deleteUserTokens(userService.getUser(), accessToken.getAccessToken());
        this._sendSuccessResponse(200, 'SUCCESS', {
            user: userService.getUser().toJSON(true),
            accessToken: accessToken
        });
    }
}

export default UserController;
