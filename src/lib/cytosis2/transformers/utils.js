
import * as R from 'ramda'; 


// 
//  Transformer Utils
// 

export const mapKeys = (fn, obj) => {
  return R.reduce((acc, key) =>
    R.assoc(fn(key), obj[key], acc),
    {}, R.keys(obj));
}


// if First is higher: > 0
// if Second is higher: < 0
// console.log(compareVersions(1.5, 2));  // Output: -1
// console.log(compareVersions(3, 3));    // Output: 0
// console.log(compareVersions(4.5, 4));  // Output: 0
// console.log(compareVersions(5, 4.2));  // Output: 1
// console.log(compareVersions('1.2.3', '1.2.4'));  // Output: -1
export const compareVersions = (version1, version2) => {
  if (!isNaN(version1) && !isNaN(version2)) {
    // Both version1 and version2 are numbers
    if (version1 > version2) {
      return 1;
    } else if (version1 < version2) {
      return -1;
    } else {
      return 0;
    }
  }

  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] > v2Parts[i]) {
      return 1;
    } else if (v1Parts[i] < v2Parts[i]) {
      return -1;
    }
  }

  return 0;
}
