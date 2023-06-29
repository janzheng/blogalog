
// import { mapKeys } from '../transformers/index.js'

export const jsonLoader = async (src) => {

  let results = await import(src.inputs.path /* @vite-ignore */)

  return results

}