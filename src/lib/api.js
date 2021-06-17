const AWS = require('aws-sdk');
const SERVER_DOMAIN = 'http://localhost:3000';

AWS.config.update({
  endpoint: 'http://localhost:8000',
  region: 'us-west-2',
  accessKeyId: 'fakeMyKeyId',
  secretAccessKey: 'fakeSecretAccessKey',
});

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
  const randomNum = Math.floor(Math.random() * 1000);
  const id = 'data' + randomNum;

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
  const response = await fetch(
    `${SERVER_DOMAIN}/comments/${requestData.quoteId}`,
    {
      method: 'POST',
      body: JSON.stringify(requestData.commentData),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not add comment.');
  }

  return { commentId: data.name };
}

export async function getAllComments(quoteId) {
  const response = await fetch(`${SERVER_DOMAIN}/comments/${quoteId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not get comments.');
  }

  const transformedComments = [];

  for (const key in data) {
    const commentObj = {
      id: key,
      ...data[key],
    };

    transformedComments.push(commentObj);
  }

  return transformedComments;
}
