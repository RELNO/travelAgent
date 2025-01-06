const BASEURL = process.env.REACT_APP_OPENAI_BASE_URL;
const APIKEY = process.env.REACT_APP_OPENAI_KEY;
const MODEL = process.env.REACT_APP_OPENAI_MODEL;
const chatApi = '/chat/completions';

const MAX_ITER = 3;

const systemPrompt = `You are an AI agent navigating a simulated 3D physical environment using a 180-degree panoramic view and other visual cues. Your primary objective is to complete assigned tasks efficiently and safely. Here are your operational parameters and available actions:

  Environment Interaction:
  1. You have a 180-degree field of view to observe your surroundings.
  2. People in the environment will not obstruct your path.
  3. Maintain a minimum distance of 1.5 meters from all buildings to ensure safe navigation.

  Task Execution:
  1. Upon receiving a task, analyze your environment and plan your actions accordingly.
  2. Provide clear, step-by-step responses detailing the actions you'll take to complete the task.
  3. Continuously reassess and adapt your plan based on new environmental information.

  Available Actions:
  1. 'forward': Move forward in steps.
    - Each step is 0.5 meters.
    - Specify a number between 1-50 steps.
    - Example: To move 20 meters, respond with 'forward' and a value of 40.

  2. 'turnLeft': Rotate left.
    - Specify an angle between 15-90 degrees.
    - Example: To turn 90 degrees left, respond with 'turnLeft' and a value of 90.

  3. 'turnRight': Rotate right.
    - Specify an angle between 15-90 degrees.
    - Example: To turn 45 degrees right, respond with 'turnRight' and a value of 45.

  4. 'finish': Complete the task.
    - Use only when you've successfully reached your goal.
    - Respond with 'finish' and a value of 1.

  Guidelines:
  - Plan the most efficient route to your target while avoiding obstacles.
  - Use landmarks and environmental cues to orient yourself.
  - If you encounter unexpected obstacles or situations, reassess and modify your plan accordingly.

  Remember: Provide clear reasoning for your decisions when planning your actions.`;

// Prompt for the ReThink agent to evaluate the decision confidence of the AI agent
const rethinkPrompt = `Decision Confidence Assessment:
 Objective: Critically evaluate the completeness and reliability of your image analysis for task completion.
        
        Evaluation Criteria:
        1. Information Sufficiency
          - Have you extracted all relevant details from the image?
          - Are there any critical elements related to the task that you might have overlooked?
        
        2. Uncertainty Indicators
          - Do you have clear visual cues for navigation?
          - Can you confidently plan your next actions?
          - Are there any ambiguous or unclear aspects in the image?
        
        Response Options:
        - 'yes': 
          - You are fully confident in your analysis
          - You have a clear understanding of the environment
          - You can proceed with your planned actions
        
        - 'no':
          - You need to re-examine the image
          - You suspect missing critical information
          - You want to conduct a more focused, detailed analysis
        
        Recommended Re-analysis Focus:
        - Potential obstacles
        - Landmark details
        - Task-specific environmental cues
        - Potential navigation paths
        - Compass/directional indicators
        
        Remember: Thoroughness and accuracy are crucial for successful task completion.`;

export const actionSchema = (compassSwitch) => {
  return {
    name: 'action_response',
    schema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description:
            'Provide a concise summary of the current task, including any progress made and remaining objectives. Update this field after each action to reflect the current state of the task.',
        },
        observation: {
          $ref: '#/$defs/observation',
        },
        thought: {
          type: 'string',

          description:
            'Analyze the environment, conclude what is the optimal direction, and determine the best approach to complete the task. Consider safety, efficiency, and potential obstacles.',
        },
        action: {
          type: 'string',
          description:
            'Select the most appropriate action based on your analysis',
          enum: ['forward', 'turnLeft', 'turnRight', 'finish'],
        },
        value: {
          type: 'number',
          description:
            "Specify the numerical value for the chosen action (steps for 'forward', degrees for 'turnLeft' and 'turnRight', or 1 for 'finish')",
        },
      },
      $defs: {
        observation: {
          type: 'object',
          description:
            'What do you see in the eye-level view? Provide a detailed description of the 180-degree panoramic view',
          properties: {
            left: {
              type: 'string',
              description:
                'Description of the left third of the panoramic view, including notable landmarks, structures, or obstacles.',
            },
            front: {
              type: 'string',
              description:
                'Description of the central third of the panoramic view, focusing on the path ahead and any immediate obstacles or points of interest.',
            },
            right: {
              type: 'string',
              description:
                'Description of the right third of the panoramic view, including notable landmarks, structures, or obstacles.',
            },
            compass: {
              type: 'string',
              description: compassSwitch
                ? 'Describe the color and degree shown on the compass, then analyze the direction and approximate distance to the target.'
                : 'Output "there is no compass information" ',
            },
          },
          required: ['left', 'front', 'right', 'compass'],
          additionalProperties: false,
        },
      },
      required: ['task', 'observation', 'thought', 'action', 'value'],
      additionalProperties: false,
    },
    strict: true,
  };
};

const rethinkSchema = {
  name: 'rethink_response',
  schema: {
    type: 'object',
    properties: {
      answer: {
        type: 'string',
        enum: ['yes', 'no'],
        description: 'message to rethink the actions',
      },
    },
    required: ['answer'],
    additionalProperties: false,
  },
};

const queryLLM = async (prompt, schema) => {
  const response = await fetch(BASEURL + chatApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${APIKEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: prompt,
      max_tokens: 5000,
      stream: false,
      response_format: {
        type: 'json_schema',
        json_schema: schema,
      },
    }),
  });
  if (response.ok) {
    const answer = await response.json();
    const result = answer.choices && answer.choices[0].message.content;
    return result;
  }
};

// Main function to run the ReAct agent
export const runActionAgent = async (initMessage, compassSwitch) => {
  let agentScratchpad = [];
  const addSystemMessage = (message) => {
    agentScratchpad.push({
      role: 'system',
      content: message,
    });
  };
  const addUserMessage = (message) => {
    agentScratchpad.push({
      role: 'user',
      content: message,
    });
  };
  addSystemMessage(systemPrompt);
  addUserMessage(initMessage);
  const action = await queryLLM(agentScratchpad, actionSchema(compassSwitch));
  return JSON.parse(action);
};

export const runReActionAgent = async (initMessage, compassSwitch) => {
  let analysis_response;
  let agentScratchpad = [];

  const addSystemMessage = (message) => {
    agentScratchpad.push({
      role: 'system',
      content: message,
    });
  };
  const addUserMessage = (message) => {
    agentScratchpad.push({
      role: 'user',
      content: message,
    });
  };
  const addAssistantMessage = (message) => {
    agentScratchpad.push({
      role: 'assistant',
      content: message,
    });
  };

  addSystemMessage(systemPrompt);
  addUserMessage(initMessage);
  analysis_response = await queryLLM(
    agentScratchpad,
    actionSchema(compassSwitch)
  );

  for (let i = 0; i < MAX_ITER; i++) {
    analysis_response = await queryLLM(
      agentScratchpad,
      actionSchema(compassSwitch)
    );
    addAssistantMessage(`Analysis: ${analysis_response}`);
    addUserMessage(rethinkPrompt);
    const rethink_response = await queryLLM(agentScratchpad, rethinkSchema);
    const confident = rethink_response && JSON.parse(rethink_response)?.answer;
    if (confident === 'yes') {
      addAssistantMessage(confident);
      break;
    } else {
      addAssistantMessage(confident);
      addUserMessage(
        `
          Reassess the image, focusing on task-relevant details you might have missed. 
          Consider the following:
          1. Are there any landmarks or environmental cues that could help navigation?
          2. Have you accurately interpreted the compass direction and target location?
          3. Are there any potential obstacles or efficient paths you overlooked?
          4. Is there any information in the image that directly relates to your task objective?

          Provide a more comprehensive analysis and be prepared to justify your confidence in your decision.
        `
      );
    }
  }
  const result = analysis_response && JSON.parse(analysis_response);
  return { result, agentScratchpad };
};
