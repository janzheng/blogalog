
/* 

  Grabs a list of Notion page paths, and loads both metadata and page data

*/

export const cfnotionPagesLoader = async (src) => {
  let cfNotionUrl = src.url || "https://notion-cloudflare-worker.yawnxyz.workers.dev"
  let obj = {}, arr = []

  // if path, return the object
  if (src.path) {
    const response = await fetch(`${cfNotionUrl}/v1/${src.path}`);
    const json = await response.json();
    return json
  }

  // if many paths, return an array of objects
  if (src.paths) {
    let arr = []
    await Promise.all(src.paths.map(async path => {
      const response = await fetch(`${cfNotionUrl}/v1/${path}`);
      const json = await response.json();
      arr.push(json)
    }))
    return arr
  }
  return null
}



// export const cfnotionListTransformer = (data, src) => {
//   // if src array of transformer modes (todo)
//   let _data = []

//   // if data is an object
//   // by default we only want the rows
//   if (data && data.rows) {
//     _data = data.rows
//   }

//   // if data is an array ... todo
//   console.log('[cfn-transformer] >> output', _data)

//   return _data
// }