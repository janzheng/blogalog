
// catch the stripe checkout session id and add it to the airtable record
// this is called from the stripe checkout session callback
// https://stripe.com/docs/payment-links/customer-info#convert-to-local-currency
// https://stripe.com/docs/webhooks
// 'checkout.session.completed' — https://stripe.com/docs/api/events/types#event_types-checkout.session.completed
// live docs for stripe events / webhooks: 
// - https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local&events=checkout.session.completed

// test payment link: https://buy.stripe.com/test_9AQ3dc3EC3yRaeA7st?client_reference_id=TICKET_ID_HERE
// test w/ card: 4242 4242 4242 4242

// stripe listen --forward-to localhost:3055/ivom/api/stripe-hook



// local stripe cli:
// stripe listen --forward-to localhost:3053/api/stripe-hook
// stripe trigger checkout.session.completed

// note: call the payment links with client_reference_id like so:
// buy.stripe.com/fZe3e0cmk6r5fpm5kk?client_reference_id=ticket_id
// this will add the airtable_id to the stripe callback



import { json } from '@sveltejs/kit';
import Stripe from 'stripe'

import { getDbPage, updatePage } from '../notion/utils.js'

// import { handleStripeCompleted } from '../stripe/stripe.js'

const stripe = Stripe(process.env.STRIPE_SK);


async function handleStripeCompleted(session, request) {

  const email = session.customer_details.email
  const paymentIntent = session.payment_intent
  console.log('[handleStripeCompleted] Data:', email, request)

  if (!email || !paymentIntent) return false

  let page
  page = await getDbPage(request, {
    property: "Email",
    rich_text: {
      equals: email
    }
  })
  let result = page.results[0]
  if (!result) return;

  page = await updatePage(result.id, {
    'Payments': {
      "rich_text": [
        {
          "text": {
            "content": paymentIntent
          }
        }
      ]
    },
  })

  return page
}


// This is your Stripe CLI webhook secret for testing your endpoint locally.
// const endpointSecret = "whsec_855847124717851fee142dd06cf17c666be999500c767822f14183bb4d168294";

// public
const endpointSecret = process.env.STRIPE_WHSEC;

export const POST = async (req) => {
  let sig = req.request.headers.get('stripe-signature');
  let body = await req.request.text()

  let stripeEvent;

  console.log("TEST SK:", process.env.STRIPE_SK)
  try {
    stripeEvent = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('error in creating stripeEvent', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // console.log('[stripeEvent]:', stripeEvent, endpointSecret)

  // Handle the event
  switch (stripeEvent.type) {
    // don't handle these!
    // case 'payment_intent.succeeded':
    //   const paymentIntent = stripeEvent.data.object;
    //   handleStripeCompleted(paymentIntent)

    //   break;
    case 'checkout.session.completed':
      const checkoutSessionCompleted = stripeEvent.data.object;
      console.log('[stripe] handling checkout.session.completed', checkoutSessionCompleted)
      await handleStripeCompleted(checkoutSessionCompleted, req);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
      break; // Add a default case with a break statement
  }



  console.log('[stripe] wrapping up checkout')
  return json({ sig, stripeEvent })
}


