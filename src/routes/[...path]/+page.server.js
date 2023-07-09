import { error } from '@sveltejs/kit'

// import { config }  from '$lib/cytosis2/cytosis.config.prod.js';
// import { endo } from '$lib/cytosis2';


export const load = async (settings) => {
  try {
    // let content = await endo(config, {sourceNames: ['site-pages']})
    // let pageContent = content['site-pages'].find(page => page.Path == settings.params.path)
    
    // dynamic page loading
    // const page = await import(`../${params.page}.svelte`)
    // return {
    //   content: page.default,
    //   slug: params.page,
    // }

    return {
      path: settings.params.path,
      // pageContent, // just use whatever the layout passes down
    }
  } catch (err) {
    console.error('[page] router error', err.message)
    // throw errorjson(404, err)
  }
}
