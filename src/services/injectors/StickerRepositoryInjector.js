'use strict';

import StickerRepository from '../../repositories/StickerRepository.js';
import Injector from './Injector.js';

class StickerRepositoryInjector extends Injector {
    inject(){
        return new StickerRepository();
    }
}

export default StickerRepositoryInjector;
