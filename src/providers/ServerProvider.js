'use strict';

import UserConversationStatusWSActionController from '../controllers/ws/UserConversationStatusWSActionController.js';
import CheckOnlineUserWSActionController from '../controllers/ws/CheckOnlineUserWSActionController.js';
import WebSocketServerManagerInjector from '../services/injectors/WebSocketServerManagerInjector.js';
import AuthenticateWSActionController from '../controllers/ws/AuthenticateWSActionController.js';
import UserProfilePictureController from '../controllers/UserProfilePictureController.js';
import AuthenticatedMiddleware from '../middlewares/AuthenticatedMiddleware.js';
import EventBrokerInjector from '../services/injectors/EventBrokerInjector.js';
import ErrorHandlerMiddleware from '../middlewares/ErrorHandlerMiddleware.js';
import ConversationController from '../controllers/ConversationController.js';
import UserSettingsController from '../controllers/UserSettingsController.js';
import UserSessionController from '../controllers/UserSessionController.js';
import StickerPackController from '../controllers/StickerPackController.js';
import WebSocketServerManager from '../support/WebSocketServerManager.js';
import AttachmentController from '../controllers/AttachmentController.js';
import MessageController from '../controllers/MessageController.js';
import StickerController from '../controllers/StickerController.js';
import ServerController from '../controllers/ServerController.js';
import LinkController from '../controllers/LinkController.js';
import UserController from '../controllers/UserController.js';
import InjectionManager from '../support/InjectionManager.js';
import WebSocketRouter from '../support/WebSocketRouter.js';
import Config from '../facades/Config.js';
import { WebSocketServer } from 'ws';
import Provider from './Provider.js';
import bb from 'express-busboy';
import express from 'express';

class ServerProvider extends Provider {
    /**
     * Configures the available HTTP routes.
     *
     * @param {Express} app
     */
    static #setupAPIRoutes(app){
        const APIRouter = new express.Router();
        bb.extend(app, { upload: true, path: './storage/uploads' });
        APIRouter.use(AuthenticatedMiddleware.getClosure());
        APIRouter.get('/conversation/:conversationID/message/:messageID/attachment/:attachmentID/get', AttachmentController.getClosure('get'));
        APIRouter.patch('/conversation/:conversationID/message/:messageID/mark-as-read', MessageController.getClosure('markAsRead'));
        APIRouter.get('/user/:userID/profile-picture/:profilePictureID/get', UserProfilePictureController.getClosure('get'));
        APIRouter.delete('/conversation/:conversationID/message/:messageID/delete', MessageController.getClosure('delete'));
        APIRouter.get('/conversation/:conversationID/message/list-commits', MessageController.getClosure('listCommits'));
        APIRouter.patch('/conversation/:conversationID/message/:messageID/edit', MessageController.getClosure('edit'));
        APIRouter.get('/sticker-pack/:stickerPackID/sticker/:stickerID/get', StickerController.getClosure('get'));
        APIRouter.patch('/conversation/:conversationID/mark-as-read', MessageController.getClosure('markAsRead'));
        APIRouter.delete('/conversation/:conversationID/delete', ConversationController.getClosure('delete'));
        APIRouter.patch('/user/regenerate-recovery-key', UserController.getClosure('regenerateRecoveryKey'));
        APIRouter.delete('/user/profile-picture/remove', UserProfilePictureController.getClosure('remove'));
        APIRouter.post('/conversation/:conversationID/message/send', MessageController.getClosure('send'));
        APIRouter.get('/conversation/:conversationID/message/list', MessageController.getClosure('list'));
        APIRouter.delete('/user/session/:accessToken/delete', UserSessionController.getClosure('delete'));
        APIRouter.get('/sticker-pack/:stickerPackID/sticker/list', StickerController.getClosure('list'));
        APIRouter.put('/user/profile-picture/change', UserProfilePictureController.getClosure('change'));
        APIRouter.post('/user/init-account-recovery', UserController.getClosure('initAccountRecovery'));
        APIRouter.get('/fetch-link-og-properties', LinkController.getClosure('fetchLinkOGProperties'));
        APIRouter.get('/conversation/commit-stats', ConversationController.getClosure('commitStats'));
        APIRouter.get('/conversation/:conversationID/get', ConversationController.getClosure('get'));
        APIRouter.delete('/user/session/delete-all', UserSessionController.getClosure('deleteAll'));
        APIRouter.patch('/user/recover-account', UserController.getClosure('recoverAccount'));
        APIRouter.patch('/user/change-password', UserController.getClosure('changePassword'));
        APIRouter.get('/user/verify-username', UserController.getClosure('verifyUsername'));
        APIRouter.post('/conversation/create', ConversationController.getClosure('create'));
        APIRouter.patch('/user/settings/edit', UserSettingsController.getClosure('edit'));
        APIRouter.get('/conversation/stats', ConversationController.getClosure('stats'));
        APIRouter.get('/conversation/list', ConversationController.getClosure('list'));
        APIRouter.get('/sticker-pack/list', StickerPackController.getClosure('list'));
        APIRouter.get('/user/settings/get', UserSettingsController.getClosure('get'));
        APIRouter.get('/user/session/list', UserSessionController.getClosure('list'));
        APIRouter.post('/user/signup', UserController.getClosure('signup'));
        APIRouter.get('/server/info', ServerController.getClosure('info'));
        APIRouter.get('/user/search', UserController.getClosure('search'));
        APIRouter.get('/user/logout', UserController.getClosure('logout'));
        APIRouter.post('/user/login', UserController.getClosure('login'));
        APIRouter.patch('/user/edit', UserController.getClosure('edit'));
        APIRouter.get('/user/info', UserController.getClosure('info'));
        APIRouter.use(ErrorHandlerMiddleware.getClosure());
        app.use('/api', APIRouter);
    }

    /**
     *
     *
     * @returns {WebSocketRouter}
     */
    static #setupWSRouter(){
        const webSocketRouter = new WebSocketRouter();
        webSocketRouter.addAction('setTypingStatus', UserConversationStatusWSActionController.getClosure('setTypingStatus'));
        webSocketRouter.addAction('checkOnlineUser', CheckOnlineUserWSActionController.getClosure('checkOnlineUser'));
        webSocketRouter.addAction('authenticate', AuthenticateWSActionController.getClosure('authenticate'));
        return webSocketRouter;
    }

    /**
     * Instantiates the WebSocket server on top of the HTTP server.
     *
     * @param {Server} server
     */
    static #setupWebSocketServer(server){
        const webSocketServerManager = new WebSocketServerManager(new WebSocketServer({ server }), ServerProvider.#setupWSRouter());
        const webSocketServerManagerInjector = new WebSocketServerManagerInjector(webSocketServerManager);
        InjectionManager.getInstance().register('WebSocketServerManager', webSocketServerManagerInjector);
        InjectionManager.getInstance().register('EventBroker', new EventBrokerInjector());
    }

    /**
     * Instantiates the HTTP server.
     *
     * @returns {Promise<Express>}
     */
    static #setupServer(){
        const app = express(), port = Config.getConfig().port ?? ServerProvider.DEFAULT_HTTP_PORT;
        ServerProvider.#setupAPIRoutes(app);
        process.on('applicationReady', () => {
            console.log('Listening on port ' + port);
            const server = app.listen(port);
            ServerProvider.#setupWebSocketServer(server);
        });
    }

    /**
     * Performs server HTTP setup.
     *
     * @returns {Promise<void>}
     */
    async run(){
        await ServerProvider.#setupServer();
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(ServerProvider, 'DEFAULT_HTTP_PORT', { value: 8888, writable: false });

export default ServerProvider;
