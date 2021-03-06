/*
 * Copyright 2015 Basho Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var CommandBase = require('../commandbase');
var inherits = require('util').inherits;
var Joi = require('joi');
var RpbYokozunaIndex = require('../../protobuf/riakprotobuf').getProtoFor('RpbYokozunaIndex');

/**
 * Provides the (Yokozuna) StoreIndex command.
 * @module YZ
 */

/**
 * Command used to store a Yokozuna index.
 *
 * As a convenience, a builder class is provided:
 *
 *     var store = StoreIndex.Builder()
 *                  .withIndexName('index_name')
 *                  .withSchemaName('my_schema')
 *                  .withCallback(callback)
 *                  .build();
 *
 * See {{#crossLink "StoreIndex.Builder"}}StoreIndex.Builder{{/crossLink}}
 *
 * @class StoreIndex
 * @constructor
 * @param {Object} options The options for this command
 * @param {String} options.indexName The name of the index.
 * @param {String} [options.schemaName=_yz_default] The name of the schema for this index.
 * @param {Function} callback The callback to be executed when the operation completes.
 * @param {String} callback.err An error message. Will be null if no error.
 * @param {Boolean} callback.response The operation either succeeds or errors. This will be true.
 * @extends CommandBase
 */
function StoreIndex(options, callback) {

    CommandBase.call(this, 'RpbYokozunaIndexPutReq' , 'RpbPutResp', callback);
    var self = this;
    Joi.validate(options, schema, function(err, options) {

        if (err) {
            throw err;
        }

        self.options = options;
    });

    this.remainingTries = 1;


}

inherits(StoreIndex, CommandBase);

StoreIndex.prototype.constructPbRequest = function() {

    var protobuf = this.getPbReqBuilder();

    var pbIndex = new RpbYokozunaIndex();
    pbIndex.setName(new Buffer(this.options.indexName));
    if (this.options.schemaName) {
        pbIndex.setSchema(new Buffer(this.options.schemaName));
    }
    protobuf.index = pbIndex;
    return protobuf;

};

StoreIndex.prototype.onSuccess = function(RpbPutResp) {

    // RpbPutResp is simply null (no body)

    this._callback(null, true);
    return true;
};


var schema = Joi.object().keys({
    indexName: Joi.string().required(),
    schemaName: Joi.string().default(null).optional()
});

/**
 * A builder for constructing StoreIndex instances.
 *
 * Rather than having to manually construct the __options__ and instantiating
 * a StoreIndex directly, this builder may be used.
 *
 *     var store = StoreIndex.Builder()
 *                  .withIndexName('index_name')
 *                  .withSchemaName('my_schema')
 *                  .withCallback(callback)
 *                  .build();
 *
 * @class StoreIndex.Builder
 * @constructor
 */
function Builder(){}

Builder.prototype = {

    /**
     * The name of the index to store.
     * @method withIndexName
     * @param {String} indexName the name of the index
     * @chainable
     */
    withIndexName : function(indexName) {
        this.indexName = indexName;
        return this;
    },
    /**
     * The name of the schema to use with this index.
     * If not provided the default '_yz_default' will be used.
     * @method withSchemaName
     * @param {String} schemaName the name of the schema to use.
     * @chainable
     */
    withSchemaName : function(schemaName) {
        this.schemaName = schemaName;
        return this;
    },
    /**
     * Set the callback to be executed when the operation completes.
     * @method withCallback
     * @param {Function} callback the callback to execute
     * @param {String} callback.err An error message
     * @param {Boolean} callback.response operation either succeeds or errors. This will be true.
     * @chainable
     */
    withCallback : function(callback) {
        this.callback = callback;
        return this;
    },
    /**
     * Construct a StoreIndex instance.
     * @method build
     * @return {StoreIndex}
     */
    build : function() {
        var cb = this.callback;
        delete this.callback;
        return new StoreIndex(this, cb);
    }
};

module.exports = StoreIndex;
module.exports.Builder = Builder;
