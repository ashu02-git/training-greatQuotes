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
    const response = await docClient.scan(params).promise()
    const data = response.Items
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
    console.log('Could not fetch quotes.');
    console.log(err);
  }
}

export async function getSingleQuote(quoteId) {
  const response = await fetch(`${SERVER_DOMAIN}/quotes/${quoteId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not fetch quote.');
  }

  const loadedQuote = {
    id: quoteId,
    ...data,
  };

  return loadedQuote;
}

export async function addQuote(quoteData) {
  const response = await fetch(`${SERVER_DOMAIN}/quotes`, {
    method: 'POST',
    body: JSON.stringify(quoteData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not create quote.');
  }

  return null;
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
