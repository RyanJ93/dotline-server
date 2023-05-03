'use strict';

import ConversationRepository from '../../repositories/ConversationRepository.js';
import Injector from './Injector.js';

class ConversationRepositoryInjector extends Injector {
    inject(){
        return new ConversationRepository();
    }
}

export default ConversationRepositoryInjector;
