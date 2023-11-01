
/* 

  Members / 
  Make into a generic Endoloader / Cache Loader?
  - might open up more attack vectors; keep to members just now

*/

import { PUBLIC_PROJECT_NAME, PUBLIC_CACHET_TTR, PUBLIC_CACHET_TTL, PUBLIC_ENDOCYTOSIS_URL } from '$env/static/public';

import { hjson } from '$plasmid/utils/sveltekit-helpers'
import { json } from '@sveltejs/kit';
import { cachet } from '$plasmid/utils/cachet'
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { parseMetadata } from '$plasmid/utils/helpers';


export const GET = async ({ request }) => {
  return json({success: true})
}

export const POST = async ({ request }) => {
  let { config = {}, id, settings } = await request.json()
  // console.log('extractor request::', request)
  // const data = await request.formData(); // or .json(), or .text(), etc
  // const form = Object.fromEntries(data);
  // const file = data.get('file')
  // const type = data?.get('type');
  // const url = data?.get('url');



  config = {
    "sources": [
      {
        "name": "members",
        "type": "cfnotion",
        "path": `/collection/${id}`
      },
    ]
  }

  settings = parseMetadata(settings)

  let result = await endoloader(config, {
    url: PUBLIC_ENDOCYTOSIS_URL,
    key: `${PUBLIC_PROJECT_NAME}-id-${id}`
    // saveCache: false, // handled by cachet
  })
  // NO CACHING

  // result = await cachet(`${PUBLIC_PROJECT_NAME}-blogalog_config`, async () => {
  //   let data = await endoloader(blogalog_config, {
  //     url: PUBLIC_ENDOCYTOSIS_URL,
  //     key: `${PUBLIC_PROJECT_NAME}-blogalog_config`,
  //     // saveCache: false, // handled by cachet
  //   })
  //   return data
  // },
  //   { // used to cache bust the (very resilient) blog config!
  //     // // skipCache: true,
  //     // // setFuzzy: false,
  //     // // ttr: 0, ttl: 0, 
  //     // ttr: PUBLIC_CACHET_TTR ? Number(PUBLIC_CACHET_TTR) : 3600,
  //     // ttl: PUBLIC_CACHET_TTL ? Number(PUBLIC_CACHET_TTL) : 3600 * 24 * 90, // default 90d cache
  //     // bgFn: () => {
  //     //   // cacheClear(`${PUBLIC_PROJECT_NAME}-blogalog_config`)
  //     //   endoloader(blogalog_config, {
  //     //     url: PUBLIC_ENDOCYTOSIS_URL,
  //     //     key: `${PUBLIC_PROJECT_NAME}-blogalog_config`,
  //     //   })
  //     // }
  //   }
  // )

  if (result) {
    // console.log('LOADER result::', result)
    let value = result?.value?.value ? JSON.parse(result?.value?.value) : result?.value // bug in endocytosis I don't feel like fixing
    let members = value?.members.map(mem => {
      let { Email, id, format, ...rest } = mem;
      return {
        ...rest,
        ShowProfile: mem[`May we include your profile in WIP's online member directory? It would be an honor.`],
        Short: mem[`Short Bio`],
        Story: mem[`(Story) How you have begun Bacteriophage research- inspire other young females :D`],
        Photo: mem?.Photo?.[0]?.rawUrl,
      };
    })
    members = members.filter(mem => mem[`ShowProfile`])

    if (settings.filter) {
      // Split the settings.filter string into an array of names
      let filterNames = settings.filter.split(',').map(name => name.trim());

      // Filter the members array
      members = members.filter(mem => filterNames.includes(mem['Name']));
    }

    return hjson({ success: true, members })
  }

  return hjson({ success: false, })
}

