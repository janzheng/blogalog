/* 

  Given a list of links, extracts the data into an array of objects
  - optionally scrapes the body content
  - optionally transforms the body content into pug or markdown


  {
      "name": "links-test",
      "type": "links",
      "paths": [
        "https://janzheng.com/",
        // "https://wikipedia.com",
      ],
      "scrapingbee": {
        apiKeyName: "SCRAPING_BEE",
        premium_proxy: false,
        render_js: false,
        // extract_rules: `{"text":"body"}` // all text, no html
      }
    },


*/

import { JSDOM } from 'jsdom';

export const linksLoader = async (src) => {
  // todo
  let results = await Promise.all(src.paths.map((link) => {
    return fetch(link)
      .then(res => res.text())
      .then(html => {
        const dom = new JSDOM(html);
        let title = dom.window.document.querySelectorAll('title')?.[0]?.innerHTML
        let description = dom.window.document.querySelectorAll('meta[name="description"]')?.[0]?.content
        let image = dom.window.document.querySelectorAll('meta[property="og:image"]')?.[0]?.content
        let favicon = dom.window.document.querySelectorAll('link[rel="icon"]')?.[0]?.href
        return {
          title,
          description,
          image,
          favicon,
          link
        }
      }).then(async result => {
        let bee
        if (src.scrapingbee) {
          bee = await getBee({
            api_key: process.env[src.scrapingbee.apiKeyName],
            url: link,
            ...src.scrapingbee,
          })

          result['content'] = bee
        }
        return result
      })
    })
  )
  return results
}






/* 
  To use Scrapingbee, add the config to the links loader:
  
  "scrapingbee": {
    apiKeyName: "SCRAPING_BEE",
    premium_proxy: false,
    render_js: false,
    // extract_rules: `{"text":"body"}` // all text, no html
  }
*/



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
      console.log('[getBee] results:', beeresults)
      result = beeresults


      // if bee is a JSON (e.g. w/ extract rules)
      try {
        result = JSON.parse(result)
      } catch (e) {
        // bee is just html string, do nothing
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
