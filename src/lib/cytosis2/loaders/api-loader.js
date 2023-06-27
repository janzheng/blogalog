

export const apiLoader = async(src) => {

  // GET REQUESTS
  // get json from an api endpoint
  let _data = {}
  if (src.inputs.url) {
    const response = await fetch(src.inputs.url);
    const json = await response.json();
    _data = json
  }
  if (src.inputs.urls) {
    let arr = []
    await Promise.all(src.inputs.urls.map(async url => {
      const response = await fetch(url);
      const json = await response.json();
      arr.push(json)
    }))
    _data = arr
  }
  
  return data

}