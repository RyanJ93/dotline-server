'use strict';

import Provider from './Provider.js';

class CommandProvider extends Provider {
    /**
     * @type {commander:Command}
     */
    #command = null;

    /**
     * The class constructor.
     *
     * @param {commander:Command} command
     */
    constructor(command){
        super();

        this.#command = command;
    }

    /**
     * Register supported commands.
     *
     * @returns {Promise<void>}
     */
    async run(){

    }
}

export default CommandProvider;
