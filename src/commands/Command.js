'use strict';

import NotCallableException from '../exceptions/NotCallableException.js';
import RuntimeException from '../exceptions/RuntimeException.js';

/**
 * @callback commandClosure
 *
 * @param {commander:Command} commandContext
 */

/**
 * @abstract
 */
/* abstract */ class Command {
    /**
     * Configures this command.
     *
     * @param {commander:Command} command
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    static configure(command){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }

    /**
     * Returns the closure function used to invoke this command.
     *
     * @returns {commandClosure}
     */
    static getClosure(){
        const commandClass = this;
        return function(commandContext){
            return new commandClass(commandContext).handle();
        };
    }

    /**
     * @type {commander:Command}
     *
     * @protected
     */
    _commandContext;

    /**
     * The class constructor.
     *
     * @param {commander:Command} commandContext
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(commandContext){
        this._commandContext = commandContext;

        if ( this.constructor === Command ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     * Implements the command logic.
     *
     * @returns {Promise<void>}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    async handle(){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }
}

export default Command;
