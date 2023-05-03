'use strict';

import RuntimeException from '../exceptions/RuntimeException.js';
import Repository from './Repository.js';

/**
 * @abstract
 */
/* abstract */ class CassandraRepository extends Repository {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        super();

        if ( this.constructor === CassandraRepository ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }
}

export default CassandraRepository;
