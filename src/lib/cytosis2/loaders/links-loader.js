/* 

  Given a list of links, extracts the data into an array of objects
  - optionally scrapes the body content
  - optionally transforms the body content into pug or markdown

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
          link,
        }
      })
    })
  )
  return results
}
