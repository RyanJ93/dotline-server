'use strict';

import StickerPackService from '../services/StickerPackService.js';
import Controller from './Controller.js';

class StickerPackController extends Controller {
    async list(){
        const stickerPackList = await new StickerPackService().list();
        this._sendSuccessResponse(200, 'SUCCESS', { stickerPackList: stickerPackList });
    }
}

export default StickerPackController;
