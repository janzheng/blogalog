

/* 

  Transform the data according to the passed in schema
  
  Useful for
  - flattening Airtable or other returned results
  - picking out a few keys for security / filtering data
  
  const data = {
    fields: {
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Street, City, Country',
      fruits: {
        apple: 'red',
      }
    }
  };

  // Schema (or mapping)
  const schemaTransformer = {
    username: 'fields.name',
    email: 'fields.email',
    appleColor: 'fields.fruits.apple',
    favorite: 'fields.trees', // fails; undefined
  };

  const transformedData = transformDataBySchema({ schema: schemaTransformer, data: johnDoeData }
  console.log('transformed data:', transformedData);

*/

import * as R from 'ramda';

// Function to transform the data according to the schema

export const _transformDataBySchema = R.curry(({ schema, data }) => {
  return R.map(path => R.path(R.split('.', path), data), schema);
});



export const transformDataBySchema = (results, { schema } = {}) => {
  return transformDataBySchema({ schema, data: results })
}