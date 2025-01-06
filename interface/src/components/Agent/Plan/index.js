import { useEffect } from 'react';
import { useSelector, useDispatch } from 'store';
import { updateMovement, updateSettings, updateInfo } from 'store/actions';
import { useRender, useLogger } from 'components/utils';

import {
  runActionAgent,
  // runReActionAgent,
} from './actionAgent';
import { runSummaryAgent } from './summaryAgent';
import { resizeImage, reviseRenderedImage } from 'components/utils/render';

const sightDistance = 20;
const collisionDistance = 1.5;

export default function Plan() {
  const { render } = useRender();
  const { logger, saveLogs } = useLogger();
  const dispatch = useDispatch();
  const planSteps = useSelector((state) => state.settings?.plan);
  const raycasterInfo = useSelector((state) => state.info?.raycasterInfo);
  const miniMap = useSelector((state) => state.info?.miniMap);
  const pathColor = useSelector((state) => state.settings?.pathColor);
  const initTask = useSelector((state) => state.settings?.task);
  const persona = useSelector((state) => state.settings?.persona);
  const compassSwitch = useSelector((state) => state.settings?.compassSwitch);
  const logs = useSelector((state) => state.logs);
  const log = logger(dispatch);
  const isMoving = useSelector((state) => state.movement);
  const step = useSelector((state) => state.info?.currentStep || 0);
  const setStep = (step) => dispatch(updateInfo({ currentStep: step }));

  const resizeRenderedImage = async (renderedImage) => {
    const canvas = document.querySelector('#threecanvas');
    const ratio = canvas.clientHeight / canvas.clientWidth;
    const newImage = await resizeImage(renderedImage, 512, ratio);
    return newImage;
  };

  const getHistory = (maxSteps) => {
    const action = logs.filter((log) => log.type === 'action');
    const observation = logs.filter((log) => log.type === 'observation');
    const position = logs.filter((log) => log.type === 'position');
    let recentObservation = 'null';
    let recentAction = 'null';
    let recentPosition = 'null';
    if (position.length > 0) {
      recentPosition = position
        .map((log) => {
          return JSON.stringify(log);
        })
        .reverse()
        .join(' ');
    }
    if (observation.length > 0) {
      recentObservation = observation
        .slice(0, maxSteps)
        .map((log) => {
          const message = JSON.parse(log.message);
          return JSON.stringify({
            step: log.step,
            observation: {
              left: message?.observation?.left,
              front: message?.observation?.front,
              right: message?.observation?.right,
            },
          });
        })
        .reverse()
        .join(' ');
    }
    if (action.length > 0) {
      recentAction = action
        .slice(0, maxSteps)
        .map((log) => {
          return JSON.stringify(log);
        })
        .reverse()
        .join(' ');
    }
    return { recentObservation, recentAction, recentPosition };
  };

  let task;

  const plan = async (step) => {
    const [segImage, renderedImage] = await render();
    if (!renderedImage) return;
    const resizedImage = await resizeRenderedImage(renderedImage);
    const resizedSegImage = await reviseRenderedImage(segImage);
    const { recentObservation, recentAction } = getHistory(3);
    // get memory
    const historyMessage = `These are your previous observations:
      ${recentObservation.toString()}
      These are your previous actions:
      ${recentAction.toString()}
      Summarize what you saw and what you have done.
    `;
    const memoryInfo = await runSummaryAgent(historyMessage);

    // get image analysis
    // const combinedImage = await combineImages(resizedSegImage, resizedImage);

    //get raycaster
    let raycasterMessage = Object.keys(raycasterInfo)
      ?.map((key) => {
        let warningMessage = '';
        let detectedMessage = '';
        let taskFinishedMessage = '';
        if (
          raycasterInfo[key].material &&
          raycasterInfo[key].material !== 'person' &&
          raycasterInfo[key]?.distance < collisionDistance
        ) {
          warningMessage = `Warning! your can't move ${key}.`;
        }
        if (
          raycasterInfo[key].material &&
          raycasterInfo[key]?.material !== 'person' &&
          raycasterInfo[key]?.distance < sightDistance
        ) {
          detectedMessage = `There is a/an ${
            raycasterInfo[key].material
          } in your ${key} in ${raycasterInfo[key].distance?.toFixed(2)} m.`;
        }
        if (
          raycasterInfo[key].material &&
          raycasterInfo[key]?.material === 'subway station' &&
          raycasterInfo[key]?.distance < 10 &&
          compassSwitch
        ) {
          taskFinishedMessage =
            "Congratulations! You have finished the task! Reply 'finish' and a value of '1' to stop the experiment.";
        }
        return warningMessage + detectedMessage + taskFinishedMessage;
      })
      .join(' ');

    // query input
    const inputMessage = [
      // Persona Info
      {
        type: 'text',
        text: `Persona: You are ${persona}.`,
      },
      // Task Info
      {
        type: 'text',
        text: `Task : ${task || initTask}`,
      },
      // Image Info
      {
        type: 'text',
        text: `Image Info: This is a 180-degrees panoramic view of your current surroundings from an eye-level perspective.
        Analyze this image carefully and provide a detailed summary of the environment, focusing on the following elements:

        1. **Navigation Compass:**
          - Located at the bottom center of the image
          - Indicates the direction and angle of your target
          - Color coding:
            - **Green:** Target is directly in front of you
            - **Blue:** Target is to your left
            - **Red:** Target is to your right
          - The number on the compass pointer shows the exact angle to the target
          - If 'finish' appears on the compass, it indicates that the task is complete

        2. **Environmental Analysis:**
          Describe the key elements in three main directions (left, center, right), including:
          - **Buildings:** Type, height, architectural features
          - **Roads:** Width, condition, traffic signs, markings
          - **Vegetation:** Trees, parks, landscaping
          - **Urban Features:** Street furniture, landmarks, storefronts
          - **Terrain:** Flat, hilly, or any notable geographical features
          - **Sky Conditions and Lighting**

        3. **Navigational Cues:**
          - Note potential obstacles or pathways
          - Highlight any elements that might aid or hinder navigation to the target
          - Mentioned any visible landmarks or reference points that could help in orientation 

        4. **Task-Relevant Details:**
          - Highlight any objects or environmental features particularly relevant to your current task
          - Mention any unusual or distinctive elements in the scene

        **Important:**
        - Focus solely on the environment and objects; do not describe or mention people, cars, or other moving objects.
        - Provide clear, concise descriptions that would be useful for navigation and task completion.
        - If any part of the image is unclear or obstructed, mention this in your description.

        Your analysis should help in understanding the urban landscape and assist in making informed decisions for navigation and task completion.`,
      },
      {
        type: 'image_url',
        image_url: {
          url: resizedImage,
          detail: 'low',
        },
      },
      // Map Info
      {
        type: 'text',
        text: `Map Info: This dynamic map visualizes your exploration progress and current location.

              Key Elements:
              - Highlighted Area: Regions you have already explored
              - Dark Area: Unexplored territory
              - ${pathColor} Line: Your travel path up to this point
              - Arrow: Your current position and facing direction
              - Red Boxes: Buildings or significant structures
              - Grey Areas: Roads and pathways

              Exploration Objectives:
              1. Use the map to plan efficient routes
              1. Explore the dark (unexplored) areas and avoid retracing your steps
              3. Pay attention to the layout of buildings and roads
              4. Look for patterns or points of interest that might be relevant to your task

              Remember: Your goal is to complete your assigned task while exploring the environment. Use this map as a **strategic tool** to guide your decisions and movements.

              If you encounter any unusual features or obstacles, make note of them for future reference.`,
      },
      {
        type: 'image_url',
        image_url: {
          url: miniMap,
          detail: 'low',
        },
      },
      // Raycaster Info
      {
        type: 'text',
        text: `Distance Info: ${raycasterMessage}`,
      },
      // Memory Info
      {
        type: 'text',
        text: `Memory Info: ${JSON.stringify(memoryInfo)}`,
      },
    ];

    const result = await runActionAgent(inputMessage, compassSwitch);
    // const { result, agentScratchpad } = await runReActionAgent(inputMessage,compassSwitch);
    // console.log('agentScratchpad:', agentScratchpad);

    //update task
    task = result.task || '';

    // log task
    log.task({
      step: step,
      message: task,
    });

    // log observation
    log.observation({
      step: step,
      seg: resizedSegImage,
      image: resizedImage.includes('base64')
        ? resizedImage
        : `data:image/jpeg;base64,${resizedImage}`,
      message: JSON.stringify({
        observation: result.observation,
      }),
    });
    // log warning
    if (raycasterMessage !== '') {
      log.warning({
        step: step,
        message: raycasterMessage,
      });
    }
    // log memory
    log.memory({
      step: step,
      message: JSON.stringify({
        previous_observations: memoryInfo?.previous_observations,
        previous_actions: memoryInfo?.previous_actions,
        // current_plan: memoryInfo?.current_plan,
      }),
    });
    // log thought
    log.plan({
      step: step,
      message: JSON.stringify({
        thought: result?.thought,
      }),
    });
    // log plan
    log.action({
      step: step,
      message: JSON.stringify({
        action: result?.action,
        value: result?.value,
      }),
    });
    return result;
  };

  useEffect(() => {
    const handlePlan = async () => {
      // if the agent is moving, do not start next step
      if (isMoving !== null) return;
      // if the total plan steps is 0, reset the step
      // if (!planSteps) {
      //   setStep(0);
      //   return;
      // }
      // if the step is less than the total plan steps, start next step
      if (step < planSteps) {
        log.info(`step ${step}`);
        const movement = await plan(step);
        if (
          movement &&
          ['forward', 'turnLeft', 'turnRight'].includes(movement?.action)
        ) {
          dispatch(updateMovement({ [movement.action]: movement.value }));
        } else {
          dispatch(updateMovement({ hold: 1 }));
        }
        // Finish Task
        if (movement && movement?.action === 'finish') {
          log.info('task finished');
          dispatch(updateMovement({ [movement.action]: 1 }));
          // if finish the task before the total steps, randomly choose a new task and hide the compass for 5 more steps
          const taskList = [
            'Unfortunately, the train is off today. You need to find another way to get to work.',
            "There's still some time before going to work. You want to buy a coffee first.",
            'You saw a friend across the street. You want to talk with him.',
          ];
          const newTask = taskList[Math.floor(Math.random() * taskList.length)];
          dispatch(
            updateSettings({
              task: newTask,
              compassSwitch: false,
              plan: step + 5,
            })
          );
          // dispatch(updateSettings({ plan: 0 }));
          return;
        }
        setStep(step + 1);
        step && saveLogs();
      } else {
        // Stop Task, reset total plan steps and hold the agent
        log.info('task stopped');
        dispatch(updateSettings({ plan: 0 }));
        step && alert('Task Stopped!');
        step && saveLogs();
      }
    };
    try {
      handlePlan();
    } catch (e) {
      log.error(e);
    }
    // eslint-disable-next-line
  }, [planSteps, step, isMoving]);
}
