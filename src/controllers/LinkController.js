'use strict';

import LinkFetchOGPropertiesHTTPForm from '../forms/LinkFetchOGPropertiesHTTPForm.js';
import LinkService from '../services/LinkService.js';
import Controller from './Controller.js';

class LinkController extends Controller {
    async fetchLinkOGProperties(){
        new LinkFetchOGPropertiesHTTPForm().validate(this._request.query);
        const OGProperties = await new LinkService().fetchLinkOGProperties(this._request.query.url);
        this._sendSuccessResponse(200, 'SUCCESS', { OGProperties: OGProperties });
    }
}

export default LinkController;
