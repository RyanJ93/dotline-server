'use strict';

import ConversationStatRepository from '../../repositories/ConversationStatRepository.js';
import Injector from './Injector.js';

class ConversationStatRepositoryInjector extends Injector {
    inject(){
        return new ConversationStatRepository();
    }
}

export default ConversationStatRepositoryInjector;
