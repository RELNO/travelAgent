const BASEURL = process.env.REACT_APP_OPENAI_BASE_URL;
const APIKEY = process.env.REACT_APP_OPENAI_KEY;
const MODEL = process.env.REACT_APP_OPENAI_MODEL;
const chatApi = "/chat/completions";

const summaryPrompt = `As an AI agent navigating a simulated environment, provide a concise yet comprehensive summary of your recent observations, actions, and progress towards your assigned task. Your summary should include:

1. Key Observations:
   - Notable landmarks, structures, or environmental features
   - Any significant changes in the environment since your last summary
   - Relevant details that have aided in navigation or task completion

2. Actions Taken:
   - List your most recent and significant actions
   - Briefly explain the reasoning behind these actions
   - Highlight any challenges encountered and how you addressed them

3. Task Progress:
   - Recap the main objective of your current task
   - Summarize what you've accomplished so far
   - Outline what remains to be done

4. Next Steps:
   - Based on your current position and task status, what are your planned next actions?
   - Explain how these planned actions will contribute to task completion

Remember to be concise but informative, focusing on the most relevant and impactful aspects of your journey so far. Do not include specific compass readings in this summary, but do mention general directional information if it's crucial to understanding your progress.`;

const memorySchema = {
  name: "memory_response",
  schema: {
    type: "object",
    properties: {
      previous_observations: {
        type: ["string", "null"],
        description: `Provide a brief summary of key environmental features and objects observed. Focus on elements that are relevant to navigation or task completion. Include any notable changes in the environment since the last observation. Do NOT include specific compass information. If no previous observations exist, return null.`,
      },
      previous_actions: {
        type: ["string", "null"],
        description: `List your recent actions in a step-by-step format. For each action, include the type (forward, turnLeft, turnRight) and the value (number of steps or degrees). For example:
        [step1: forward(10), step2: turnLeft(45), step3: forward(5)]
        If no previous actions exist, return null.`,
      },
      // current_plan: {
      //   type: 'string',
      //   description:
      //     "based on the information you have, what is your plan to achieve the task, if you don't have enough information, output with your hypothetical plan. summary the plan in a todo list. output example : [task1: brief summary of task 1[finished], task2:brief summary of task2[doing], task3: brief summary of task3[to do]]",
      // },
    },
    required: [
      "previous_observations",
      "previous_actions",
      // 'current_plan'
    ],
    additionalProperties: false,
  },
  strict: true,
};

export const runSummaryAgent = async (history) => {
  const systemMessage = {
    role: "system",
    content: summaryPrompt,
  };
  const historyMessage = {
    role: "user",
    content: history,
  };
  const response = await fetch(BASEURL + chatApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APIKEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [systemMessage, historyMessage],
      max_tokens: 1000,
      stream: false,
      response_format: {
        type: "json_schema",
        json_schema: memorySchema,
      },
    }),
  });
  const answer = await response.json();
  const memory = answer.choices[0].message.content;
  return JSON.parse(memory);
};
