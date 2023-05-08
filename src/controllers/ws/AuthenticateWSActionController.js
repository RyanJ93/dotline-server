'use strict';

import UnauthorizedHTTPException from '../../exceptions/UnauthorizedHTTPException.js';
import AccessTokenService from '../../services/AccessTokenService.js';
import WSActionController from './WSActionController.js';
import UserService from '../../services/UserService.js';

class AuthenticateWSActionController extends WSActionController {
    /**
     * Handles authentication requests.
     *
     * @returns {Promise<void>}
     */
    async authenticate(){
        const accessToken = this._webSocketMessage.getPayload().accessToken;
        if ( accessToken === '' || typeof accessToken !== 'string' ){
            throw new UnauthorizedHTTPException('Invalid access token.');
        }
        const webSocketServerManager = this._webSocketMessage.getWebSocketServerManager();
        const user = await new AccessTokenService().getUserByAccessToken(accessToken);
        await new UserService(user).updateLastAccess();
        webSocketServerManager.registerClient(this._webSocketMessage.getClient(), user, accessToken);
    }
}

export default AuthenticateWSActionController;
