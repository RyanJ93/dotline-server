'use strict';

import UDTImplementation from '../DTOs/UDTImplementation.js';
import Database from '../facades/Database.js';

class Model {
    static _prepareBaseSelectionQuery(filters){
        const params = [], filterFields = [], mapping = ( new this() ).getMapping();
        let query = 'SELECT * FROM ' + mapping.tableName;
        for ( const propertyName in filters ){
            const placeholder = Array.isArray(filters[propertyName]) ? 'IN(?)' : '= ?';
            const fieldName = mapping.fields[propertyName].name ?? propertyName;
            filterFields.push(fieldName + ' ' + placeholder);
            params.push(filters[propertyName]);
        }
        if ( filterFields.length > 0 ){
            query += ' WHERE ' + filterFields.join(' AND ');
        }
        return { query: query, params: params };
    }

    static async findOne(filters, options){
        let { query, params } = this._prepareBaseSelectionQuery(filters), model = null;
        const resultSet = await Database.query(query + ' LIMIT 1;', params, options);
        if ( resultSet.rows.length > 0 ){
            model = new this();
            await model.bindAttributes(resultSet.rows[0]);
        }
        return model;
    }

    static async find(filters, options){
        const { query, params } = this._prepareBaseSelectionQuery(filters), modelList = [];
        const resultSet = await Database.query(query, params, options);
        await Promise.all(resultSet.rows.map((row) => {
            const model = new this();
            modelList.push(model);
            return model.bindAttributes(row);
        }));
        return modelList;
    }

    _attributes = {};
    _bound = false;
    _mapping = {};

    async #lookUpAndBindRelation(propertyName, attributes, relation){
        const lookupFields = {};
        for ( const fieldName in relation.mapping ){
            lookupFields[relation.mapping[fieldName].foreign] = attributes[fieldName];
        }
        this._attributes[propertyName] = await relation.model.findOne(lookupFields);
    }

    #packAttributes(){
        const computedFields = {};
        for ( const propertyName in this._mapping.fields ){
            const fieldName = this._mapping.fields[propertyName].name ?? propertyName;
            computedFields[fieldName] = this._attributes[propertyName] ?? null;
            if ( computedFields[fieldName] instanceof UDTImplementation ){
                computedFields[fieldName] = computedFields[fieldName].toUDT();
            }else if ( computedFields[fieldName] instanceof Model ){
                const relation = this._mapping.fields[propertyName].relation;
                for ( const relatedFieldName in relation.mapping ){
                    const method = relation.mapping[relatedFieldName].method;
                    computedFields[relatedFieldName] = this._attributes[propertyName][method]();
                }
            }
        }
        return computedFields;
    }

    async #performUpdate(){
        const fields = [], params = [], attributes = this.#packAttributes();
        for ( let fieldName in attributes ){
            if ( this._mapping.keys.indexOf(fieldName) === -1 ){
                params.push(attributes[fieldName]);
                fields.push(fieldName + ' = ?');
            }
        }
        const filterFields = this._mapping.keys.map((keyField) => {
            params.push(attributes[keyField]);
            return keyField + ' = ?';
        });
        let query = 'UPDATE ' + this._mapping.tableName + ' SET ' + fields.join(', ') + ' ';
        query += ' WHERE ' + filterFields.join(', ');
        await Database.query(query, params);
    }

    async #performInsertion(){
        const attributes = this.#packAttributes(), fields = Object.keys(attributes).join(', ');
        const placeholders = Array(Object.keys(attributes).length).fill('?').join(', ');
        const query = 'INSERT INTO ' + this._mapping.tableName + ' (' + fields + ') VALUES (' + placeholders + ');';
        await Database.query(query, Object.values(attributes));
        this._bound = true;
    }

    async bindAttributes(attributes){
        const processes = [];
        for ( const propertyName in this._mapping.fields ){
            const { UDTImplementation, relation } = this._mapping.fields[propertyName];
            const fieldName = this._mapping.fields[propertyName].name ?? propertyName;
            this._attributes[propertyName] = attributes[fieldName] ?? null;
            if ( this._attributes[propertyName] !== null ){
                if ( relation !== null && typeof relation === 'object' ){
                    processes.push(this.#lookUpAndBindRelation(propertyName, attributes, relation));
                }else if ( typeof UDTImplementation === 'function' ){
                    this._attributes[propertyName] = UDTImplementation.makeFromUDT(this._attributes[propertyName]);
                }
            }
        }
        await Promise.all(processes);
        this._bound = true;
    }

    getMapping(){
        return this._mapping;
    }

    isBound(){
        return this._bound === true;
    }

    async save(){
        if ( this._bound === true ){
            return await this.#performUpdate();
        }
        await this.#performInsertion();
    }

    async delete(){
        const attributes = this.#packAttributes(), params = [];
        const filterFields = this._mapping.keys.map((keyField) => {
            params.push(attributes[keyField]);
            return keyField + ' = ?';
        });
        const query = 'DELETE FROM ' + this._mapping.tableName + ' WHERE ' + filterFields.join(', ');
        await Database.query(query, params);
    }

    toJSON(){
        const exportedFields = {}, hiddenFields = this._mapping.hiddenFields ?? [];
        for ( const propertyName in this._attributes ){
            if ( hiddenFields.indexOf(propertyName) === -1 ){
                exportedFields[propertyName] = this._attributes[propertyName];
            }
        }
        return exportedFields;
    }
}

export default Model;
