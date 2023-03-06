'use strict';

class StringUtils {
    static camelToUnderscore(string){
        const result = string.replace(/([A-Z])/g, ' $1');
        return result.split(' ').join('_').toLowerCase();
    }
}

export default StringUtils;
