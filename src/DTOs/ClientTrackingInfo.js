'use strict';

class ClientTrackingInfo {
    #browserName;
    #location;
    #OSName;
    #ip;

    constructor(properties){
        this.#browserName = properties.browserName;
        this.#location = properties.location;
        this.#OSName = properties.OSName;
        this.#ip = properties.ip;
    }

    getBrowserName(){
        return this.#browserName;
    }

    getLocation(){
        return this.#location;
    }

    getOSName(){
        return this.#OSName;
    }

    getIP(){
        return this.#ip;
    }

    toJSON(){
        return {
            browserName: this.#browserName,
            location: this.#location,
            OSName: this.#OSName,
            ip: this.#ip
        };
    }
}

export default ClientTrackingInfo;
