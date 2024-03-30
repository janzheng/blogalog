

import { json, error } from '@sveltejs/kit'
import { getCurrency } from '../functions/getCurrency'
import { dummylist } from '../dummy.js'


export const POST = async ({ request }) => {
  try {
    let { command, from, to, amount, date } = await request.json()
    let results
    console.log('[POST]', `command: ${command}`, from, to, amount, date)

    // just get the dummy list instead
    // results = await getCurrency({from, to, amount, date});

    // Filter the results based on the from property
    let fromResults = dummylist.filter(item => item.query.from === from);

    // if using the dummy list, we get a list of results, so we try to find the closest thing to what's requested
    // If fromResults is not empty, try to filter it based on the to property
    if (fromResults.length > 0) {
      let toResults = fromResults.filter(item => item.query.to === to);

      // If toResults is not empty, return the first result
      // Otherwise, return the first result from fromResults
      results = toResults.length > 0 ? toResults[0] : fromResults[0];
    } else {
      // If fromResults is empty, return the first item in the dummylist
      results = dummylist[0];
    }


    return json(results)
  } catch (e) {
    console.error('[POST]', e)
    error(500, e.message)
  }
}


