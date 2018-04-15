# DynamoDB AWS-SDK Wrapper

A small wrapper around the AWS dynamoDB node SDK functions. I needed this for a couple of my own projects so I have spun it out into it's own repository so I can manage it's evolution better.

AWS-SDK Docs: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide

### Setup:

npm install the dependencies (aws-cli), IAM permissions will need to be configured with AWS for the SDK to authenticate with the DynamoDB rest API. The following functions are available:

### Available Functions: 

#### putItem

Create a new item in a table. Note, using the AWS-SDK directly here there is no protection for accidentally overriding a item in the case of a key collision. 

#### updateItem

Updates an Item in a table.

#### deleteItem

Removes an item from the table

#### getItem

Adds an item to the table 

#### setAWSRegion

Allows the setting of the AWS region, set by default to eu-west-1.