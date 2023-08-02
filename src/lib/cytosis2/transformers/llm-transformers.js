


/* 

  Given an object, apply the llm to a specific key, and output on a specific key

*/
export const llmKeyPrompt = async (results, 
  { key = "Name", keys, outputKey="llm", prompt, llm 
  } = {}) => {
  let content = results[key]
  if(keys && keys.length > 0) {
    // keys = ["Name", "Description"]
    content = {}
    keys.map(key => {
      results[key]
      content[key] = results[key]
    })
    content = JSON.stringify(content)
  }

  let finalPrompt = `${prompt} \{${content}\}`
  let llmOutput = await getPrompt({
    ...llm,
    prompt: finalPrompt,
  })

  results[outputKey] = llmOutput?.text || llmOutput
  return results
}



/* 

  Apply a llmKeyPrompt to each item in an array of results

*/
export const llmArrayPrompt = async (results, settings = {}) => {
  // todo: might not want to change the original array
  let llmOutputs = await Promise.all(results.map(async (result) => {
    result = await llmKeyPrompt(result, settings) || null // edits in place
  }))

  return results
}






// Very basic LLM interface; needs to be updated to be simpler
// also support function calling and conversations better
// FOCUS ON THE DX OF CALLING THE METHODS FIRST
// Abstract langchain, which is too confusing

import { ChatOpenAI } from "langchain/chat_models";
import { LLMChain } from "langchain/chains";

import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "langchain/prompts";
// import { forEach } from "lodash"



export async function getPrompt(
  {
    prompt, user, input, // the user message
    system = "You are a helpful assistant",
    modelName = "gpt-3.5-turbo",
    temperature = 0.7,
    streaming = false,
    apiKeyName = "OPENAI_API_KEY"
  } = {}) {


  try {
    const model = new ChatOpenAI({
      modelName,
      openAIApiKey: process.env[apiKeyName],
      temperature,
    });

    prompt = user || input || prompt // support multi keywords

    const chatPromptTemplate = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(system),
      HumanMessagePromptTemplate.fromTemplate(prompt),
    ]);

    const chain = new LLMChain({
      llm: model,
      prompt: chatPromptTemplate,
    });

    console.log('>>>> Getting answer from OpenAI...')
    const res = await chain.call();
    console.log('[GPT] \n---------->>>>>\n\nOutput:', res, '\n\n<<<------------');

    return res

  } catch (err) {
    console.error('[llm/prompt]', err.message || err?.response?.data)
  }
}



