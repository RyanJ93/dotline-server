'use strict';

import NotCallableException from '../exceptions/NotCallableException.js';
import UDTImplementation from '../DTOs/UDTImplementation.js';
import Database from '../facades/Database.js';

class Model {
    static _prepareBaseQuery(filters){
        let params = [], filterFields = [], mapping = ( new this() ).getMapping(), query = '';
        for ( const propertyName in filters ){
            const fieldName = mapping.fields[propertyName]?.name ?? propertyName;
            let hasObjectBeenProcessed = false, isEmptyFilterObject = false;
            if ( filters[propertyName] !== null && typeof filters[propertyName] === 'object' ){
                let processedFilters = 0;
                for ( const operator in filters[propertyName] ){
                    if ( operator === '$containsKey' ){
                        if ( Array.isArray(filters[propertyName][operator]) ){
                            filters[propertyName][operator].forEach((value) => {
                                filterFields.push(fieldName + ' CONTAINS KEY ?');
                                params.push(value);
                            });
                        }else{
                            filterFields.push(fieldName + ' CONTAINS KEY ?');
                            params.push(filters[propertyName][operator]);
                        }
                        hasObjectBeenProcessed = true;
                    }else if ( operator === '$gte' ){
                        filterFields.push(fieldName + ' >= ?');
                        params.push(filters[propertyName][operator]);
                        hasObjectBeenProcessed = true;
                    }else if ( operator === '$gt' ){
                        filterFields.push(fieldName + ' > ?');
                        params.push(filters[propertyName][operator]);
                        hasObjectBeenProcessed = true;
                    }else if ( operator === '$lte' ){
                        filterFields.push(fieldName + ' <= ?');
                        params.push(filters[propertyName][operator]);
                        hasObjectBeenProcessed = true;
                    }else if ( operator === '$lt' ){
                        filterFields.push(fieldName + ' < ?');
                        params.push(filters[propertyName][operator]);
                        hasObjectBeenProcessed = true;
                    }else if ( operator === '$not' ){
                        filterFields.push(fieldName + ' != ?');
                        params.push(filters[propertyName][operator]);
                        hasObjectBeenProcessed = true;
                    }
                    processedFilters++;
                }
                isEmptyFilterObject = processedFilters === 0;
            }
            if ( !hasObjectBeenProcessed && !isEmptyFilterObject ){
                const placeholder = Array.isArray(filters[propertyName]) ? 'IN ?' : '= ?';
                filterFields.push(fieldName + ' ' + placeholder);
                params.push(filters[propertyName]);
            }
        }
        if ( filterFields.length > 0 ){
            query += ' WHERE ' + filterFields.join(' AND ');
        }
        return { query: query, params: params };
    }

    static _prepareBaseSelectionQuery(filters){
        const baseQuery = this._prepareBaseQuery(filters), mapping = ( new this() ).getMapping();
        baseQuery.query = 'SELECT * FROM ' + mapping.tableName + ' ' + baseQuery.query;
        return baseQuery;
    }

    static _applyQueryOptions(query, options){
        const mapping = ( new this() ).getMapping();
        if ( typeof options?.orderBy === 'string' || typeof options?.orderByAsc === 'string' ){
            const propertyName = options.orderBy ?? options.orderByAsc;
            const fieldName = mapping.fields[propertyName]?.name ?? propertyName;
            query += ' ORDER BY ' + fieldName + ' ASC';
        }else if ( typeof options?.orderByDesc === 'string' ){
            const fieldName = mapping.fields[options.orderByDesc]?.name ?? options.orderByDesc;
            query += ' ORDER BY ' + fieldName + ' DESC';
        }
        if ( !isNaN(options?.limit) && options?.limit > 0 ){
            query += ' LIMIT ' + options?.limit;
        }
        if ( options?.allowFiltering === true ){
            query += ' ALLOW FILTERING';
        }
        return query;
    }

    static async findOne(filters, options = null, withoutRelations = []){
        let { query, params } = this._prepareBaseSelectionQuery(filters), model = null;
        query = this._applyQueryOptions(query, options);
        options = options ?? undefined;
        const resultSet = await Database.query(query + ' LIMIT 1;', params, options);
        if ( resultSet.rows.length > 0 ){
            model = new this();
            await model.bindAttributes(resultSet.rows[0], withoutRelations);
        }
        return model;
    }

    static async find(filters, options = null, withoutRelations = []){
        let { query, params } = this._prepareBaseSelectionQuery(filters), modelList = [];
        query = this._applyQueryOptions(query, options);
        options = options ?? undefined;
        const resultSet = await Database.query(query + ';', params, options);
        await Promise.all(resultSet.rows.map((row) => {
            const model = new this();
            modelList.push(model);
            return model.bindAttributes(row, withoutRelations);
        }));
        return modelList;
    }

    static async findAndDelete(filters, options = null){
        let { query, params } = this._prepareBaseQuery(filters), mapping = ( new this() ).getMapping();
        query = 'DELETE FROM ' + mapping.tableName + ' ' + query + ';';
        await Database.query(query, params, ( options ?? undefined ));
    }

    _attributes = { _originalsReceived: {} };
    _hiddenAttributes = new Set();
    _virtualAttributes = {};
    _locked = false;
    _bound = false;
    _mapping = {};

    async _lookUpAndBindRelation(propertyName, attributes, relation){
        const lookupFields = {};
        for ( const fieldName in relation.mapping ){
            lookupFields[relation.mapping[fieldName].foreign] = attributes[fieldName];
        }
        this._attributes[propertyName] = await relation.model.findOne(lookupFields);
    }

    _packAttributes(){
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

    _performUpdate(){
        const fields = [], params = [], attributes = this._packAttributes();
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
        query += ' WHERE ' + filterFields.join(' AND ');
        return { query: query, params: params };
    }

    _performInsertion(){
        const attributes = this._packAttributes(), fields = Object.keys(attributes).join(', ');
        const placeholders = Array(Object.keys(attributes).length).fill('?').join(', ');
        const query = 'INSERT INTO ' + this._mapping.tableName + ' (' + fields + ') VALUES (' + placeholders + ');';
        return { query: query, params: Object.values(attributes) };
    }

    async bindAttributes(attributes, withoutRelations = []){
        const processes = [];
        this._attributes = { _originalsReceived: attributes };
        for ( const propertyName in this._mapping.fields ){
            const { UDTImplementation, relation } = this._mapping.fields[propertyName];
            const fieldName = this._mapping.fields[propertyName].name ?? propertyName;
            const fieldValue = attributes[fieldName] ?? null;
            this._attributes[propertyName] = null;
            if ( fieldValue !== null ){
                if ( relation !== null && typeof relation === 'object' && withoutRelations.indexOf(propertyName) === -1 ){
                    processes.push(this._lookUpAndBindRelation(propertyName, attributes, relation));
                }else if ( typeof UDTImplementation === 'function' ){
                    this._attributes[propertyName] = UDTImplementation.makeFromUDT(fieldValue);
                }else{
                    this._attributes[propertyName] = attributes[fieldName] ?? null;
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

    getStorageParams(){
        return this._bound === true ? this._performUpdate() : this._performInsertion();
    }

    async save(){
        if ( this._locked === true ){
            throw new NotCallableException('Model instance has been locked.');
        }
        const { query, params } = this.getStorageParams();
        await Database.query(query, params);
        this._bound = true;
    }

    async delete(){
        if ( this._locked === true ){
            throw new NotCallableException('Model instance has been locked.');
        }
        const attributes = this._packAttributes(), params = [];
        const filterFields = this._mapping.keys.map((keyField) => {
            params.push(attributes[keyField]);
            return keyField + ' = ?';
        });
        const query = 'DELETE FROM ' + this._mapping.tableName + ' WHERE ' + filterFields.join(' AND ');
        await Database.query(query, params);
    }

    addVirtualAttribute(name, value){
        this._virtualAttributes[name] = value;
        return this;
    }

    removeVirtualAttribute(name){
        delete this._virtualAttributes[name];
        return this;
    }

    getVirtualAttribute(name){
        return this._virtualAttributes[name] ?? null;
    }

    hideAttribute(name){
        this._hiddenAttributes.add(name);
        return this;
    }

    showAttribute(name){
        this._hiddenAttributes.delete(name);
        return this;
    }

    lock(){
        this._locked = true;
        return this;
    }

    unlock(){
        this._locked = false;
        return this;
    }

    clone(){
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    toJSON(){
        const exportedFields = {}, hiddenFields = this._mapping.hiddenFields ?? [];
        for ( const propertyName in this._attributes ){
            const isHidden = hiddenFields.indexOf(propertyName) >= 0 || this._hiddenAttributes.has(propertyName);
            if ( propertyName !== '_originalsReceived' && !isHidden ){
                exportedFields[propertyName] = this._attributes[propertyName];
            }
        }
        Object.assign(exportedFields, this._virtualAttributes);
        return exportedFields;
    }
}

export default Model;
