
// import { json } from '@sveltejs/kit';

// import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';
// const client = new ChromaClient("https://timeless-arrows.fly.dev");
// const embedder = new OpenAIEmbeddingFunction({ openai_api_key: process.env['OPENAI_API_KEY'] })


// // export const GET = getSiteContent // return json from content
// export const GET = async () => {

//   const collection = await client.createCollection({ name: "my_collection", embeddingFunction: embedder })

//   await collection.add({
//     ids: ["id1", "id2"],
//     metadatas: [{ "source": "my_source" }, { "source": "my_source" }],
//     documents: ["This is a document", "This is another document"],
//   }) 

//   const results = await collection.query({
//     nResults: 2,
//     queryTexts: ["This is a query document"]
//   }) 

//   console.log('results?!', results)
//   return json({"fruit": "banana"})
// }



