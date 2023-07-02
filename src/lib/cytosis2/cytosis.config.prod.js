export const config = {
  "loaders": {
    // "sourceFile": "../../../prod.json", // pull from this preloaded json
  },
  "transformers": ["outputObject"],
  "sources": [
    {
      "name": "jz-data",
      "type": "cfnotion",
      "path": "/collection/cccaab5d7ee04ebd9a42dbf2227c1cdb",
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
      "name": "jz-pages",
      "type": "cfnotion",
      "path": "/collection/c94e18d29ab54bdc8318d6a41f683e92",
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