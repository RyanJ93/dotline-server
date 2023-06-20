'use strict';

import StickerService from '../services/StickerService.js';
import Controller from './Controller.js';

class StickerController extends Controller {
    async list(){
        const stickerService = await StickerService.makeFromEntity(this._request.params.stickerPackID);
        const stickerList = await stickerService.list();
        this._sendSuccessResponse(200, 'SUCCESS', { stickerList: stickerList });
    }

    async get(){
        const { stickerPackID, stickerID } = this._request.params;
        const stickerService = await StickerService.makeFromEntity(stickerPackID, stickerID);
        this._sendSuccessResponse(200, 'SUCCESS', { sticker: stickerService.getSticker() });
    }
}

export default StickerController;
