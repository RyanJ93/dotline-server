'use strict';

import StickerPackRepository from '../../repositories/StickerPackRepository.js';
import Injector from './Injector.js';

class StickerPackRepositoryInjector extends Injector {
    inject(){
        return new StickerPackRepository();
    }
}

export default StickerPackRepositoryInjector;
