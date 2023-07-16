export const config = {
  "loaders": {
    // "sourceFile": "../../../prod.json", // pull from this preloaded json
  },
  "transformers": ["outputObject"],
  "sources": [
    {
      "name": "site-data",
      "type": "cfnotion",
      "path": "/collection/94ae39e321ae46578fe205f2f6ce8b8f",
      "transformers": [
        {
          "function": "transformArrayToObjectByKey",
          "settings": {
            "objectKey": "Name"
          }
        }
      ]
    },
    {
      "name": "site-pages",
      "type": "cfnotion",
      "path": "/collection/76cd30036bc24438bda5093b26c426d5",
      "loaders": {
        "notionPageId": "id"
      },
      "transformers": [
        {
          "function": "transformArrayVersionedObjects",
          "settings": {
            "uniqueKey": "Path", // unique field to track versions against
            "versionKey": "Version", // version name / number field  
          }
        }
      ]
    },
  ]
}