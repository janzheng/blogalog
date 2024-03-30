
import { getContextValue, srcSchema, destSchema } from './utils'

export const getTemp = async ({
  lat, lon,
} = {}) => {
  try {
    if (!lat || !lon) throw new Error("No lat/lon provided");

    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=bab3aa11dfaea12cda0525211c1cf3a5`
    const response = await fetch(url);

    if (!response.ok) {
      let responseObject
      try { responseObject = await response.json(); } catch (e) { } // if there's more data
      throw new Error(`[getTemp] Server error: ${response.status}`, responseObject)
    }

    const result = await response.json();
    const resultObj = {
      temp: result.main.temp,
      unit: "Kelvin",
      lat,
      lon
    }

    return resultObj
  } catch (e) {
    console.error(`[getTemp] ${e.message}`, e.data);
    return Promise.reject({
      name: 'getTemp',
      message: e.message || `[getTemp] Error`,
      data: e.data
    })
  }
};


export const schema = {
  name: "getTemp",
  desc: "GETs data from api.openweathermap.org w/ lat/lng. Output is always in Kelvin",
  parameters: { // json schema for function calling
    "type": "object",
    "properties": {
      "src": srcSchema,
      "dest": destSchema,
      "lat": {
        "type": "string",
        "description": "latitude of weather location",
      },
      "lon": {
        "type": "string",
        "description": "longitude of weather location",
      },
    },
    "required": ["lat", "lon"]
  }
}

const withContext = (fn) => {
  return async ({
    lat, lon,
    src = {
      prev: { // default to getting lat/lon from previous object (as a guess)
        lat: "lat",
        lon: "lon",
      }
    },
    dest,
    context
  }) => {
    const ctxVal = getContextValue(src, context);
    lat = ctxVal?.lat || lat
    lon = ctxVal?.lon || lon
    const results = await fn({ lat, lon });

    return {
      dest,
      results
    };
  };
};
export const getTempCtx = withContext(getTemp);
const getTempConfig = { schema, fn: getTempCtx };
export default Object.freeze(getTempConfig);


