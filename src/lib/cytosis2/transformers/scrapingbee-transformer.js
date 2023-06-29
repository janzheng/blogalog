


/* 

  Given an object, apply the llm to a specific key, and output on a specific key

*/
export const scrapeKey = async (results,
  { key = "link", outputKey = "content", apiKeyName = "SCRAPING_BEE", beeSettings = {}
  } = {}) => {
  let link = results[key]
  let bee = await getBee({
    api_key: process.env[apiKeyName],
    url: link,
    ...beeSettings,
  })

  results[outputKey] = bee
  return results
}


/* 

  Apply a llmKeyPrompt to each item in an array of results

*/
export const scrapeArray = async (results, settings = {}) => {
  // todo: might not want to change the original array
  let llmOutputs = await Promise.all(results.map(async (result) => {
    result = await scrapeKey(result, settings) || null // edits in place
  }))

  return results
}










export const getBee = async ({
  // https://www.scrapingbee.com/documentation/
  api_key,
  url,
  render_js = false,
  timeout = 10000,
  premium_proxy = false,
  return_page_source = false,
  screenshot_full_page = false,
  block_resources = true,
  country_code = "us",
  // extract_rules = `{"text":"body"}`, // removes all html
  extract_rules, // default to no rules, which returns html
}, _fetch) => {

  let result
  try {
    result = null
    let beeresults = ``
    let __fetch = _fetch || fetch // for server-side or client-side

    if (!url || url == 'undefined') {
      console.error('[getBee] need a URL!')
      return null
    }

    const str = `https://app.scrapingbee.com/api/v1?api_key=${api_key}&url=${encodeURIComponent(url)}&render_js=${render_js}&block_resources=${block_resources}&timeout=${timeout}${extract_rules ? "&extract_rules="+extract_rules : ''}&premium_proxy=${premium_proxy}&return_page_source=${return_page_source}&country_code=${country_code}`
    console.log('[scrapingbee] fetching', str)
    const response = await __fetch(str)

    // success
    if (response.status == 200) {
      beeresults = await response.text()
      // console.log('[getBee] results:', beeresults)
      result = beeresults


      // if bee is a JSON (e.g. w/ extract rules)
      try {
        result = JSON.parse(result)
      } catch (e) {
        // bee is just html string, do nothing
        return result
      }

      return result
    } else {
      console.error('[getBee] response:', response.status)
      return null
    }

  } catch (err) {
    console.error('[getBee] error:', err)
    isScraping = false
  }
}
