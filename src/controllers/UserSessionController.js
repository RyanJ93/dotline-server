'use strict';

import AccessTokenService from '../services/AccessTokenService.js';
import Controller from './Controller.js';

class UserSessionController extends Controller {
    async list(){
        const accessTokenList = await new AccessTokenService().listByUser(this._request.authenticatedUser);
        this._sendSuccessResponse(200, 'SUCCESS', { accessTokenList: accessTokenList });
    }

    async delete(){
        const accessTokenService = await AccessTokenService.makeFromAccessToken(this._request.params.accessToken);
        await accessTokenService.delete();
        this._sendSuccessResponse();
    }

    async deleteAll(){
        await new AccessTokenService().deleteUserTokens(this._request.authenticatedUser, this._request.accessToken);
        this._sendSuccessResponse();
    }
}

export default UserSessionController;
