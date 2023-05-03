'use strict';

import WSActionController from './WSActionController.js';

class CheckOnlineUserWSActionController extends WSActionController {
    async checkOnlineUser(){
        const userIDList = this._webSocketMessage.getPayload().userIDList;
        const userMap = Object.create(null);
        userIDList.forEach((userID) => {
            userMap[userID] = this._webSocketMessage.getWebSocketServerManager().hasSession(userID);
        });
        return userMap;
    }
}

export default CheckOnlineUserWSActionController;
