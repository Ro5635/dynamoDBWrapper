
const dynamodbHelper = require('./dynamodbHelper');

dynamodbHelper.getItem({"MachineID": "4"} , "BPMachinesTable")
    .then(res => {
        console.log('Got it');
        console.log(res);

    })
    .catch(err => {
        console.log('There is an error');
        console.log(err);

    });




