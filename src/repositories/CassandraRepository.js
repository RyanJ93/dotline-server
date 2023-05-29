'use strict';

import RuntimeException from '../exceptions/RuntimeException.js';
import Repository from './Repository.js';
import cassandra from 'cassandra-driver';

/**
 * @abstract
 */
/* abstract */ class CassandraRepository extends Repository {
    /**
     * Generates a new time UUID (UUID v2).
     *
     * @returns {types.TimeUuid}
     */
    static generateTimeUUID(){
        return cassandra.types.TimeUuid.now();
    }

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
