
import * as R from 'ramda'; 


// 
//  Transformer Utils
// 

export const mapKeys = (fn, obj) => {
  return R.reduce((acc, key) =>
    R.assoc(fn(key), obj[key], acc),
    {}, R.keys(obj));
}
