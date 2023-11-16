
import { json } from '@sveltejs/kit'
export const GET = async ({ url, setHeaders, locals }) => {
  console.log('NEW REQUEST', url)
  return json({ 
    wow: 'cool',
    params: Array.from(url.searchParams).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {})
  })
}
