
import { OPENAI_API_KEY } from '$env/static/private';
import { fQuery } from '$lib/utils/fquery.js';

export const fq = fQuery({ apiKey: OPENAI_API_KEY || env.OPENAI_API_KEY || process.OPENAI_API_KEY });

// for getting a standard response, and setting proper type
// based on whether input is a string or json
export function getReturnResponse(res, outputName = "value", loud = false) {
  let value = res?.text || res;

  // Handle JSON responses here
  // somehow RETRY if JSON parsing fails?
  let output = {
    type: null,
    [outputName]: null,
  }

  // check if value is already a JSON object w/ keys
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    output.type = 'application/json';
    output[outputName] = value;
  } else if (Array.isArray(value)) {
    // not sure how these should be handled differently lol
    output.type = 'application/json';
    output[outputName] = value;
  } else {
    // replace all 
    try {
      let data = JSON.parse(value);
      output.type = 'application/json';
      output[outputName] = data;
    } catch (e) {
      // return the text if not json
      output.type = 'text/plain';
      output[outputName] = value;
      if (loud) console.log('[getReturnResponse] -> text:', e, value);
    }
  }
  return output
}

