const AWS = require('aws-sdk');
// const SERVER_DOMAIN = 'http://localhost:3000';

AWS.config.update({
  endpoint: 'http://localhost:8000',
  region: 'us-west-2',
  accessKeyId: 'fakeMyKeyId',
  secretAccessKey: 'fakeSecretAccessKey',
});

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

export async function getAllQuotes() {
  const params = {
    TableName: 'Quotes',
  };

  try {
    const response = await docClient.scan(params).promise();
    const data = response.Items;
    console.log(data);

    const transformedQuotes = [];

    for (const key in data) {
      const quoteObj = {
        id: key,
        ...data[key],
      };
      transformedQuotes.push(quoteObj);
    }
    return transformedQuotes;
  } catch (err) {
    console.log(err);
    console.log('Could not scan quotes.');

    // Check table exist
    console.log('Check table exist');
    const listTables = await dynamodb.listTables().promise();
    if (listTables.TableNames.length === 0) {
      // Create tables
      const listParams = [
        {
          TableName: 'Quotes',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
        {
          TableName: 'Comments',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            {
              AttributeName: 'quoteId',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'quoteId',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      ];

      for (const paramsId in listParams) {
        const params = listParams[paramsId];
        dynamodb.createTable(params, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
            console.log('Created Tables');
          }
        });
      }
      console.log('Created Tables');
    }
  }
}

export async function getSingleQuote(quoteId) {
  const params = {
    TableName: 'Quotes',
    Key: { id: quoteId },
  };

  try {
    const response = await docClient.get(params).promise();
    const data = response.Item;
    const loadedQuote = {
      id: quoteId,
      ...data,
    };
    return loadedQuote;
  } catch (err) {
    console.log(err);
    console.log('Could not get quote.');
  }
}

export async function addQuote(quoteData) {
  const { author, text } = quoteData;
  // const randomNum = Math.floor(Math.random() * 1000);
  const date = new Date();
  const id = 'data' + date;
  const params = {
    TableName: 'Quotes',
    Item: { id, author, text },
  };

  try {
    const data = await docClient.put(params).promise();
    console.log(data);
    return null;
  } catch (err) {
    console.log(err);
    console.log('Could not create quote.');
  }
}

export async function addComment(requestData) {
  const date = new Date();
  const id = 'id' + date;
  const quoteId = requestData.quoteId;
  const name = 'name' + date;
  const text = requestData.commentData.text;

  const params = {
    TableName: 'Comments',
    Item: { id, quoteId, name, text },
  };

  try {
    const data = await docClient.put(params).promise();
    return { commentId: data.name };
  } catch (err) {
    console.log(err);
    console.log('Could not add comment.');
  }
}

export async function getAllComments(quoteId) {
  const params = {
    TableName: 'Comments',
    ScanFilter: {
      quoteId: {
        ComparisonOperator: 'CONTAINS',
        AttributeValueList: [`${quoteId}`],
      },
    },
  };

  try {
    const response = await docClient.scan(params).promise();
    const data = response.Items;
    const transformedComments = [];

    for (const key in data) {
      const commentObj = {
        id: key,
        ...data[key],
      };
      transformedComments.push(commentObj);
    }
    return transformedComments;
  } catch (err) {
    console.log(err);
    console.log('Could not get comments.');
  }
}
