/**
 * Get an item from dynamodb
 *
 */

const dynamodbHelper = require('./dynamodbHelper');

dynamodbHelper.getItem({"HashID": "4666fsffr"} , "SomeTable")
    .then(res => {
        console.log('Got it');
        console.log(res);

    })
    .catch(err => {
        console.log('There is an error');
        console.log(err);

    });




