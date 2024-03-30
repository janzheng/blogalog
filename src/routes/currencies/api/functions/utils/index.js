
// gets context value when given a string OR an object
export const getContextValue = (input, context) => {
  if (!input || !context) return null;

  /* 
    input.ctx / input.prev
    context.data / context.prevResults
  */
  let inputKey, inputContext

  if (input.ctx) {
    inputKey = input.ctx
    inputContext = context.data
  }
  if (input.prev) {
    inputKey = input.prev
    inputContext = context.prevResults
  }

  if (typeof inputKey === 'string') {
    return inputContext[inputKey]
  }

  if (typeof inputKey === 'object') {
    let result = {};
    for (let key in inputKey) {
      result[key] = (inputContext && path(inputKey[key]?.split('.'), inputContext));
      // result[key] = (inputContext && getNestedProperty(key, inputContext));
    }
    return result;
  }

  return null;
}



// for sous chef utilities to config where data can come from
export const srcSchema = {
  "type": "object",
  "description": "Source for input data"
}

// for sous chef utilities to explain where stuff is saved
export const destSchema = {
  "type": "object",
  "description": "Optional. Leave blank if not unclear. Location to save output. '{ obj: 'atlCelsius' }' saves the output to context.atlCelsius as an object '{ arr: 'tempValues' }' saves the output to context.tempValues as an array.",
}
