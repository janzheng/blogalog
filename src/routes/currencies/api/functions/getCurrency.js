

import { CURRENCY_API } from '$env/static/private';
import { getContextValue, srcSchema, destSchema } from './utils'

import { dummylist } from '../dummy.js'

// OUT OF CREDITS
// export async function getCurrency({ from, to, amount, date }) {
//   const url = `https://api.apilayer.com/exchangerates_data/convert?from=${from}&to=${to}&amount=${amount}&date=${date}`;
//   const response = await fetch(url, {
//     method: 'GET',
//     headers: {
//       'apikey': CURRENCY_API
//     }
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   return await response.json();
// }

export const getCurrency = async ({ from, to, amount, date } = {}) => {
  try {
    if (!from || !to || !amount || !date) throw new Error("Required parameters missing");

    console.log('returning DUMMY CURRENCY DATA')
    return dummylist


    // OUT OF CREDITS
    // const url = `https://api.apilayer.com/exchangerates_data/convert?from=${from}&to=${to}&amount=${amount}&date=${date}`;
    // const response = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'apikey': CURRENCY_API
    //   }
    // });

    if (!response.ok) {
      let responseObject
      try { responseObject = await response.json(); } catch (e) { } // if there's more data
      throw new Error(`[getCurrency] Server error: ${response.status}`, responseObject)
    }

    const result = await response.json();
    return result;
  } catch (e) {
    console.error(`[getCurrency] ${e.message}`, e.data);
    return Promise.reject({
      name: 'getCurrency',
      message: e.message || `[getCurrency] Error`,
      data: e.data
    })
  }
};

export const schema = {
  name: "getCurrency",
  desc: "GETs data from api.apilayer.com for currency conversion",
  parameters: { // json schema for function calling
    "type": "object",
    "properties": {
      "src": srcSchema,
      "dest": destSchema,
      "from": {
        "type": "string",
        "description": "Currency to convert from",
      },
      "to": {
        "type": "string",
        "description": "Currency to convert to",
      },
      "amount": {
        "type": "number",
        "description": "Amount to convert",
      },
      "date": {
        "type": "string",
        "description": "Date for conversion rate",
      },
    },
    "required": ["from", "to", "amount", "date"]
  }
}

const withContext = (fn) => {
  return async ({
    from, to, amount, date,
    src = {
      prev: { // default to getting parameters from previous object (as a guess)
        from: "from",
        to: "to",
        amount: "amount",
        date: "date",
      }
    },
    dest,
    context
  }) => {
    const ctxVal = getContextValue(src, context);
    from = ctxVal?.from || from
    to = ctxVal?.to || to
    amount = ctxVal?.amount || amount
    date = ctxVal?.date || date
    const results = await fn({ from, to, amount, date });

    return {
      dest,
      results
    };
  };
};
export const getCurrencyCtx = withContext(getCurrency);
const getCurrencyConfig = { schema, fn: getCurrencyCtx };
export default Object.freeze(getCurrencyConfig);