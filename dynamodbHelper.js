/**
* DynamoDB Helper
*
* Uses the AWS-SDK for manipulating tables on AWS DynamoDB.
*
* Robert Curran April 2018
*/

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

const defaultRegion = 'eu-west-1';
const awsAPIVersion = '2014-08-10';

// Set the region 
AWS.config.update({region: defaultRegion});

// Create DynamoDB document client
const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: awsAPIVersion});


/**
 * put item
 *
 * Puts passed item to dynamoDB table
 * @param item
 * @param tableName
 * @param overwite
 */
exports.putItem = (item, tableName, overwite = false) => {
	return new Promise( (resolve, reject) => {

		let requestParams = {};

		const errorObj = {"calledWith": {"item": item, "TableName": tableName, "overwite": overwite}};

        // Validation
        if (item.length <= 0) return reject({msg: "No item supplied", ...errorObj});
        if (tableName.length <= 0) return reject({msg: "No tableName supplied", ...errorObj});

        // Build request payload
        requestParams.TableName = tableName;
        requestParams.Item = item;

        if (!overwite){
            requestParams.ConditionExpression = "attribute_not_exists(MachineID)"
        }

        // Call The DynamoDB API via the SDK
        docClient.put(requestParams, function(err, res){
            if (err) {
              // Does the item alredy exist in the table
              if (err.code === 'ConditionalCheckFailedException') {
                reject({msg: "Item with that key already exists", "code": "ItemExists", ...errorObj});

              }

              // Return failure
              reject({msg: "Put failed on dynamoDB", "code": "DBError", DBError: err, ...errorObj});

          }

          resolve(res);

      });

});

};


/**
 * Update Item
 *
 * TODO: Look at te condition expression here, does it work?
 *
 * Updates item in dynamodb table
 * @param itemKey
 * @param tableName
 * @param updateParams
 * @param conditionExpression
 */
exports.updateItem = (itemKey, tableName, updateParams, conditionExpression = {}) => {
	return new Promise((resolve, reject) => {

		let requestParams = {};
		const errorObj = {"calledWith": {"updateParams": updateParams, "tableName": tableName, "itemKey": itemKey, "conditionExpression": conditionExpression}};

        // Validation
        if (itemKey.length <= 0) return reject({msg: "no Item Key supplied", ...errorObj});
        if (updateParams.length <= 0) return reject({msg: "No updateParams supplied", ...errorObj});
        if (tableName.length <= 0) return reject({msg: "No tableName supplied", ...errorObj});


        // Build the update expressions
        let updateExpression = 'set';
        let expressionAttributeValues = {};

        for (let paramIndex in updateParams) {
            if (paramIndex !== 0) updateExpression += ',';

            updateExpression += ` ${updateParams[paramIndex].name} = :${updateParams[paramIndex].name}`;
            expressionAttributeValues[`:${updateParams[paramIndex].name}`] = updateParams[paramIndex].value;

        }


        // Build the request payload
        requestParams.Key = itemKey;
        requestParams.TableName = tableName;
        requestParams.ExpressionAttributeValues = expressionAttributeValues;
        requestParams.UpdateExpression = updateExpression;

        // If a condition expression is supplied include it
        if(conditionExpression.length >= 0) {
            requestParams.ConditionExpression = conditionExpression;
        }



        // Call dynamoDB
        docClient.update(requestParams, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject({msg: "Update failed on dynamoDB", "code": "DBError", DBError: err, ...errorObj});

            } else {
            // console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            resolve(data);

        }
    });

});

};


/**
 * Delete Item
 *
 * Deletes an Item from the dynamoDB table
 * @param itemKey
 * @param tableName
 * @param deleteCondition
 * @param deleteParameters
 * @returns {Promise<any>}
 */
exports.deleteItem = (itemKey, tableName, deleteCondition, deleteParameters) => {
	return new Promise((resolve, reject) => {

		let requestParams = {};
		const errorObj = {"calledWith": {"itemKey": itemKey , "tableName": tableName, "deleteCondition": deleteCondition, "deleteParameters": deleteParameters}};

        // Validation
        if (itemKey.length <= 0) return reject({msg: "no Item Key supplied", ...errorObj});
        if (tableName.length <= 0) return reject({msg: "No tableName supplied", ...errorObj});
        if (deleteCondition.length <= 0) return reject({msg: "No delete condition supplied", ...errorObj});
        if (deleteParameters.length <= 0) return reject({msg: "No delete condition supplied", ...errorObj});


        // Build the request payload
        requestParams.Key = itemKey;
        requestParams.TableName = tableName;
        requestParams.ConditionExpression = deleteCondition;
        requestParams.ExpressionAttributeValues = deleteParameters;


        // Call dynamoDB
        docClient.delete(requestParams, function(err, data) {
            if (err) {
                // console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                reject({msg: "Delete failed on dynamoDB", "code": "DBError", DBError: err, ...errorObj});

            } else {
                // console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data);

            }

        });
    });
};

/**
 * get Item
 *
 * Gets an item from the dynamoDB table
 * @param itemKey
 * @param tableName
 * @returns {Promise<any>}
 */
exports.getItem = (itemKey, tableName) => {
	return new Promise((resolve, reject) => {

		let requestParams = {};
		const errorObj = {"calledWith": {"itemKey": itemKey , "tableName": tableName}};


		// Validation
		if (itemKey.length <= 0) return reject({msg: "no Item Key supplied", ...errorObj});
		if (tableName.length <= 0) return reject({msg: "No tableName supplied", ...errorObj});

	    // Build the request payload
	    requestParams.Key = itemKey;
	    requestParams.TableName = tableName;

	    // Call dynamoDB
	    docClient.get(requestParams, function(err, data) {
	    	if (err) {
	    		// console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
	    		reject({msg: "Get failed on dynamoDB", "code": "DBError", DBError: err, ...errorObj});

	    	} else {
	    		// console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
	    		resolve(data);

	    	}
	    });

	});
};

/**
 * Query Database Table For Items
 *
 *  You can only query on the indexes of the table, this is the components of the partitions key and any secondary
 *  indexes that you have defined. There is a cost associated with the provisioning of additional indexes, for this
 *  reason it is important to take care in the design of your table.
 *
 *  The optional parameter indexName is used to specify a table index other than the primary table index that is used by
 *  defaults
 *
 *  If conditions need to be applied to non index fields then the use of the scan operation will be mandated, note that
 *  the scan operation brings reads all of the data with the filters applied on teh index fields then apples the additional
 *  filters to all of the data that is brought back. This is an expensive operation and queries should be preferred.
 *
 * @param conditionExpression
 * @param expressionAttributeNames
 * @param expressionAttributeValues
 * @param tableName
 * @param indexName
 * @returns {Promise<any>}
 */
exports.query = (conditionExpression, expressionAttributeNames, expressionAttributeValues, tableName, indexName = "") => {
    return new Promise((resolve, reject) => {

        let requestParams = {};
        const errorObj = {"calledWith": {"conditionExpression": conditionExpression, "tableName": tableName, "expressionAttributeNames": expressionAttributeNames, "expressionAttributeValues": expressionAttributeValues}};

        // Validation
        if (conditionExpression.length <= 0) return reject({msg: "No conditionExpression supplied", ...errorObj});
        if (tableName.length <= 0) return reject({msg: "No tableName supplied", ...errorObj});
        if (expressionAttributeNames.length <= 0) return reject({msg: "No expressionAttributeNames supplied", ...errorObj});
        if (expressionAttributeValues.length <= 0) return reject({msg: "No expressionAttributeValues supplied", ...errorObj});

        // Build the request payload
        requestParams.TableName = tableName;
        requestParams.KeyConditionExpression = conditionExpression;
        requestParams.ExpressionAttributeNames = expressionAttributeNames;
        requestParams.ExpressionAttributeValues = expressionAttributeValues;

        // Include the index name if supplied
        if(indexName.length >= 0) requestParams.IndexName = indexName;

        // Call dynamoDB
        docClient.query(requestParams, function(err, data) {
            if (err) {
                // console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject({msg: "Query failed on dynamoDB", "code": "DBError", DBError: err, ...errorObj});
            } else {
                // Query succeeded
                resolve(data);

            }
        });

    });
};

/**
 * Caution: Scan operations are expensive and should be minimised as they read each item in the table
 *
 * @returns {Promise<any>}
 */
exports.scan = () => {
  return new Promise((resolve, reject) => {

      reject({msg: "Not implemented"});


  });
};

/**
 * Set AWS Region
 * @param regionName
 */
exports.setAWSRegion = (regionName) => {
    if (regionName.length >= 0){
        AWS.config.update({region: regionName});

    } else {
        console.log('No region passed');
        console.log(`AWS region remains at default: ${defaultRegion}`);
    }

};

module.exports = exports;

