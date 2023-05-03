'use strict';

import Database from '../facades/Database.js';
import Model from './Model.js';

class CounterModel extends Model {
    async #performIncrement(fields){
        const attributes = this._packAttributes(), params = [], placeholders = [];
        let query = 'UPDATE ' + this._mapping.tableName + ' SET ';
        for ( const propertyName in fields ){
            const fieldName = this._mapping.fields[propertyName]?.name ?? propertyName;
            placeholders.push(fieldName + ' += ?');
            params.push(fields[propertyName]);
        }
        const filterFields = this._mapping.keys.map((keyField) => {
            params.push(attributes[keyField]);
            return keyField + ' = ?';
        });
        query += placeholders.join(', ') + ' WHERE ' + filterFields.join(' AND ');
        await Database.query(query, params);
    }

    async increment(fieldName, increment = 1){
        return await this.#performIncrement({
            [fieldName]: increment
        });
    }

    async decrement(fieldName, decrement = 1){
        return await this.#performIncrement({
            [fieldName]: -decrement
        });
    }

    async save(){
        //
    }
}

export default CounterModel;
