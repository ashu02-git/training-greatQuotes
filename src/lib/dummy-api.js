export async function getAllQuotes() {
  const data = {
    data1: {
      author: 'test author1',
      text: 'test text1',
    },
    data2: {
      author: 'test author2',
      text: 'test text2',
    },
  };

  const transformedQuotes = [];

  for (const key in data) {
    const quoteObj = {
      id: key,
      ...data[key],
    };

    transformedQuotes.push(quoteObj);
  }

  return transformedQuotes;
}

export async function getSingleQuote(quoteId) {
  const loadedQuote = {
    id: quoteId,
    author: 'test author2',
    text: 'test text2',
  };

  return loadedQuote;
}

export async function addQuote(quoteData) {
  console.log(quoteData);
  return null;
}

export async function addComment(requestData) {
  console.log(requestData);
  const data = {
    name: 'aaa',
  };

  return { commentId: data.name };
}

export async function getAllComments(quoteId) {
  const data = {
    aaa: {
      text: 'test text1',
    },
    bbb: {
      text: 'test text2',
    },
  };

  const transformedComments = [];

  for (const key in data) {
    const commentObj = {
      id: key,
      ...data[key],
    };

    transformedComments.push(commentObj);
  }
  console.log(transformedComments);

  return transformedComments;
}
