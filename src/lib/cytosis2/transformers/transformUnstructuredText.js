
/* 

  This file deals with using LLMs to extract structureed data from text, and using a zod validator to optionally validate and extract a subset

  requires Ramda async

  (temporary) extractStructuredDataFromText: calls an LLM to get structured data from text and a schema

  transformUnstructuredText: Ramda-compatible function that takes an external function that transforms unstructured text to structured text, and optionally validates it against a zod schema object

*/



import * as R from 'ramda';
import * as RA from 'ramda-async';
// import { z } from "zod";




/* 

    extractStructuredDataFromText

    Get structure from unstructured data w/ an LLM and a schema suggestion

    !!! This needs to be moved somewhere else or be its own library
    let url = `https://pd-api.fly.dev/gen/api/prompt` http://localhost:3051/gen/api/prompt

    "schema" could be a full JSON Schema, a simple zod or json schema definition, or basically "name, email, phone"

    // Demo of extractStructuredDataFromText async usage — get structure from unstructured data w/ an LLM and a schema suggestion
    (async () => {
      // const structuredText = await extractStructuredDataFromText({ str: unstructuredText, schema: sampleNameSchema });
      const structuredText = await extractStructuredDataFromText({ str: unstructuredText, schema: sampleNameSchemaStr});
      console.log("[extractStructuredDataFromText demo] \nunstructuredText:", unstructuredText, " \n>> ", structuredText);
    })();

*/





export const transformUnstructuredTextKey = async (results, { schema, key="Name", outputKey="Schema" } = {}) => {
    const structuredTextResult = await RA.pipeAsync(
      transformUnstructuredText({ schema, extractorFn: extractStructuredDataFromText }),
    )(results[key]);

  results[outputKey] = structuredTextResult
  return results
}


export const transformUnstructuredTextKeyArray = async (results, settings = {}) => {
  let llmOutputs = await Promise.all(results.map(async (result) => {
    result = await transformUnstructuredTextKey(result, settings) || null // edits in place
  }))

  return results
}


















export const extractStructuredDataFromText = async ({
  str, schema, maxAttempts = 1,
  url = `https://pd-api.fly.dev/gen/api/prompt`,
  // url = `http://localhost:3051/gen/api/prompt`,
}) => {
  str = str.trim()

  console.log('[extractStructuredDataFromText] inputs:', str, schema, url)
  let attempts = 0

  if (!str || str.length == 0)
    return null


  // this lets you send stringified JSON objects into the LLM prompt (can't use single { and })
  let jsonSchemaString = JSON.stringify(schema).replace(/[{]/g, '{{').replace(/[}]/g, '}}');

  let body = JSON.stringify({
    "prompt": `Given this rough schema definition and/or entities: """${jsonSchemaString}]""", please extract the following text from """${str}""". Only output JSON. Do not describe your results. Do not wrap in markdown backticks or HTML.`
  })

  while (attempts < maxAttempts) {
    attempts += 1;

    console.log('[extractStructuredDataFromText] Sending prompt:', body)
    let res = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body
    })

    if (!res.ok) {
      throw new Error(`[extractStructuredDataFromText] HTTP error! status: ${response.status}`);
    }

    let data = await res.json()
    if (data && data.result) {
      console.log('[extractStructuredDataFromText] output:', data)
      return data.result
    }
  }

  throw new Error(`[extractStructuredDataFromText] Could not extract structure after ${maxAttempts} attempts`);
};











/* 

    transformUnstructuredText

    Ramda-compatible method that takes an external function that transforms unstructured text to structured text, and optionally validates it against a zod schema object


    (async () => {

      const sampleNameSchemaStr = "name, email, appleColor, fruitPreference"

      const unstructuredText = "My name is John Smith. My email is jon.smith@example.com and my address is 123 Street, Atlanta, Georgia. I like red apples";
      // const structuredTextData = await transformUnstructuredText(
      //   { 
      //     schema: sampleNameSchemaStr, 
      //     extractorFn: extractStructuredDataFromText,
      //     // zodSchema: zodSchema // this forces the results to only match the schema
      //   }, 
      //   unstructuredText
      // );
      // console.log("[transformUnstructuredText demo]:\n", unstructuredText, "\n>> ", structuredTextData);

      // Chain it with other Ramda functions
      const structuredTextResult = await RA.pipeAsync(
        transformUnstructuredText({ schema: sampleNameSchemaStr, extractorFn: extractStructuredDataFromText }),
        R.prop('name'),
        R.toUpper
      )(unstructuredText);
      console.log("[transformUnstructuredText chain demo]:\n", unstructuredText, "\n>> ", structuredTextResult); // The transformed username in uppercase
    })();

*/
export const transformUnstructuredText = R.curry(async ({ schema, zodSchema, maxAttempts = 1, extractorFn }, unstructuredText) => {
  let attempts = 0;
  let structuredTextData = null;

  while (attempts < maxAttempts) {
    attempts += 1;

    // Transform the unstructured text
    structuredTextData = await RA.pipeAsync(
      () => ({ str: unstructuredText, schema, maxAttempts }),  // Provide an object to extractorFn
      extractorFn,
    )(unstructuredText);

    // Optionally Validate + transform the extracted data if a zodSchema is given
    // this only returns the validated data per the schema
    if (zodSchema) {
      const result = zodSchema.safeParse(structuredTextData);
      console.log('[transformUnstructuredText] zod result:', result);
      if (result.success) {
        return result.data
        // return structuredText;
      }
    } else {
      return structuredTextData;
    }
  }

  throw new Error(`Could not transform and validate text after ${maxAttempts} attempts`);
});





/* 

  similar to transformUnstructuredText
  but takes a structuredTextData (a valid json object) and validates it against a zodSchema

  the zodSchema will extract all the data from the structuredTextData
*/

export const validateStructuredTextData = R.curry((zodSchema, structuredTextData) => {
  const result = zodSchema.safeParse(structuredTextData);
  console.log('[validateStructuredTextData] zod result:', result);
  if (result.success) {
    return result.data
  }

  throw new Error(`Could not validate against schema`);
});






/* 

  Helpers and examples to transform list of text or arrays

*/


// Function to split a multiline string into an array of lines
export const splitLines = R.split('\n');

export const transformLine = R.curry(async (opts, line) => {
  return await transformUnstructuredText(opts, line);
});

// Function to transform a list of lines
export const transformLines = R.curry((opts, lines) => {
  // Map transformLine over the array of lines, resulting in an array of Promises
  const promises = lines.map(line => transformLine(opts, line));
  return Promise.all(promises);
});


