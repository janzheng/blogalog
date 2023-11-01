
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

  let result
  let key = `${PUBLIC_PROJECT_NAME}-id-${id}`
  
  // NO CACHING
  // result = await endoloader(config, {
  //   url: PUBLIC_ENDOCYTOSIS_URL,
  //   key: key
  // })

  // CACHING
  result = await cachet(`${key}`, async () => {
    let data = await endoloader(config, {
      url: PUBLIC_ENDOCYTOSIS_URL,
      key: key
    })
    return data
  })

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

