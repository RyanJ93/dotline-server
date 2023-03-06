'use strict';

import UnauthorizedHTTPException from '../exceptions/UnauthorizedHTTPException.js';
import AccessTokenService from '../services/AccessTokenService.js';
import Middleware from './Middleware.js';

class AuthenticatedMiddleware extends Middleware {
    static #getAccessToken(request){
        let accessToken = ( request.headers['authorization'] ?? null );
        if ( typeof accessToken === 'string' && accessToken !== '' ){
            accessToken = accessToken.substr(7);
        }
        return accessToken;
    }

    async handle(request, response, next){
        const isWhitelisted = AuthenticatedMiddleware.WHITELISTED_ROUTE_LIST.indexOf(request.path) >= 0;
        request.accessToken = AuthenticatedMiddleware.#getAccessToken(request);
        request.authenticatedUser = null;
        if ( !isWhitelisted ){
            if ( request.accessToken === null || request.accessToken === '' ){
                throw new UnauthorizedHTTPException('Invalid access token.');
            }
            const accessTokenService = new AccessTokenService();
            request.authenticatedUser = await accessTokenService.getUserByAccessToken(request.accessToken);
        }
        await next();
    }
}

Object.defineProperty(AuthenticatedMiddleware, 'WHITELISTED_ROUTE_LIST', {
    value: Object.freeze(['/user/login', '/user/signup', '/user/verify-username']),
    writable: false
});

export default AuthenticatedMiddleware;
