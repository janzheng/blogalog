

export const load = async ({ url, setHeaders, locals }) => {
  console.log('123123::: ', url)
  return {
    params: Array.from(url.searchParams).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {})
  }
}
