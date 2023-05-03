'use strict';

import Database from '../facades/Database.js';
import Model from './Model.js';

class SearchEnabledModel extends Model {
    static async search(searchQuery, field, options = null, withoutRelations = []){
        const mapping = ( new this() ).getMapping(), indexing = mapping.searchIndex[field];
        let indexQuery = 'SELECT * FROM ' + indexing.tableName + ' WHERE fragment = ?';
        const indexParams = [], keyFieldValues = [], modelList = [];
        options = options ?? undefined;
        indexParams.push(searchQuery);
        if ( options?.limit > 0 ){
            indexQuery += ' LIMIT ' + options?.limit;
        }
        //TODO change
        const referenceFieldList = Object.keys(indexing.referenceFields);
        const localFieldList = Object.values(indexing.referenceFields);
        const indexResultSet = await Database.query(indexQuery, indexParams);
        indexResultSet.rows.forEach((result) => {
            referenceFieldList.forEach((referenceField) => {
                keyFieldValues.push(result[referenceField]);
            });
        });
        if ( keyFieldValues.length > 0 ){
            const { query, params } = this._prepareBaseSelectionQuery({
                [localFieldList[0]]: keyFieldValues
            });
            const resultSet = await Database.query(query, params, options);
            await Promise.all(resultSet.rows.map((row) => {
                const model = new this();
                modelList.push(model);
                return model.bindAttributes(row, withoutRelations);
            }));
        }
        return modelList;
    }

    async dropIndex(field){
        const indexing = this._mapping.searchIndex[field], params = [], filters = [];
        let query = 'DELETE FROM ' + indexing.tableName + ' WHERE ';
        for ( const fieldName in indexing.referenceFields ){
            params.push(this._attributes[indexing.referenceFields[fieldName]]);
            filters.push(fieldName + ' = ?');
        }
        query += filters.join(' AND ');
        await Database.query(query, params);
    }

    async index(field, value){
        if ( value === '' || typeof value !== 'string' ){
            return;
        }
        const indexing = this._mapping.searchIndex[field], queries = [], fields = [], baseParams = [];
        let baseQuery = 'INSERT INTO ' + indexing.tableName + ' (', currentFragment = '';
        for ( const fieldName in indexing.referenceFields ){
            baseParams.push(this._attributes[indexing.referenceFields[fieldName]]);
            fields.push(fieldName);
        }
        const placeholders = new Array(fields.length).fill('?').join(', ');
        baseQuery += fields.join(',') + ', fragment) VALUES ';
        baseQuery += '(' + placeholders + ', ?);';
        await this.dropIndex(field);
        for ( let i = 0 ; i < value.length ; i++ ){
            currentFragment += value.charAt(i);
            const params = Array.from(baseParams);
            params.push(currentFragment);
            queries.push({
                query: baseQuery,
                params: params
            });
        }
        if ( queries.length > 0 ){
            await Database.batch(queries);
        }
    }

    async indexAll(){
        const processes = [];
        for ( const field in this._mapping.searchIndex ){
            processes.push(this.index(field, this._attributes[field]));
        }
        await Promise.all(processes);
    }

    async dropAllIndexes(){
        await Promise.all(Object.keys(this._mapping.searchIndex).map((field) => {
            return this.dropIndex(field);
        }));
    }

    async save(){
        await super.save();
        await this.indexAll();
    }

    async delete(){
        await super.delete();
        await this.dropAllIndexes();
    }
}

export default SearchEnabledModel;
