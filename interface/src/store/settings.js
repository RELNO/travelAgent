const baseSettings = {
  experimentId: new Date().toTimeString().split(' ')[0].replace(/:/g, '-'),
  modelPath: 'assets/models/street.glb',
  seed: -1,
  plan: 0,
  renderSwitch: true,
  compassSwitch: true,
  prompt:
    'A bright summer morning in Kendall Square, Cambridge, MA. The sun shines warmly on modern glass buildings and bustling streets, with pedestrians, cyclists, and outdoor cafés creating a lively atmosphere.',
  task: 'You live this street. Your need to find and reach close to the sign of subway station, which is a wall with a big text "Subway Station".',

  persona:
    'A 30-year-old female, tech startup founder, creative, optimistic, and full of innovative ideas.',
  modelPosition: [60, 0, -20],
  cameraPosition: [0, 60, 0],
  agentPosition: {
    // randomly jitter the position
    position: [
      30 - Math.floor(Math.random() * 5),
      2,
      -10 - Math.floor(Math.random() * 5),
    ],
    rotation: [0, Math.PI / 2, 0],
  },
  wayPoinsts: [
    [10, 2, -10],
    [-10, 2, -10],
    [-10, 2, 30],
  ],
  currentPointIndex: 0,
  pathSize: 4,
  pathColor: 'black',
};

export const initSettings = {
  base: {
    ...baseSettings,
    experimentId:
      'base-' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-'),
  },
  winter: {
    ...baseSettings,
    experimentId:
      'winter-' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-'),
    prompt:
      'A snowy winter morning in Kendall Square, Cambridge, MA. Heavy snow blankets the streets and modern glass buildings, with bundled-up pedestrians trudging through, cyclists absent, and a quiet stillness filling the air. Flurries swirl gently, creating a serene winter atmosphere.',
  },
  tokyo: {
    ...baseSettings,
    experimentId:
      'tokyo-' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-'),
    prompt:
      'A bright summer morning in Tokyo, Japan. The sun shines warmly on a mix of traditional wooden buildings and modern structures, with bustling streets filled with pedestrians, cyclists, and outdoor tea houses creating a vibrant and harmonious atmosphere.',
  },
  night: {
    ...baseSettings,
    experimentId:
      'night-' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-'),
    prompt:
      'A serene night time scene of Kendall Square, Cambridge, MA, in the summer. The streets are softly illuminated by warm streetlights and the gentle glow of modern office buildings with large glass facades. ',
  },
  male: {
    ...baseSettings,
    experimentId:
      'male-' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-'),
    persona:
      'A 35-year-old male, software developer, friendly, analytical, and enjoys solving complex problems.',
  },
};

// lobby: {
//   experimentId: Math.random().toString(36).substring(2, 9),
//   modelPath: 'assets/models/lobby.glb',
//   seed: -1,
//   plan: 0,
//   renderSwitch: true,
//   compassSwitch: true,
//   prompt: 'Lobby in MIT Media Lab, Cambridge, MA.',
//   task: 'meet your host at the top of a "large staircase element" that is in "the center of the lobby."',
//   persona: 'a 27 years old student, first time visiting the campus.',
//   modelPosition: [-10, 0, 0],
//   cameraPosition: [0, 15, 0],
//   agentPosition: {
//     position: [0, 1.5, -5],
//     rotation: [0, Math.PI / 5, 0],
//   },
//   pathSize: 1,
//   pathColor: 'white',
// },

// gallery: {
//   experimentId: Math.random().toString(36).substring(2, 9),
//   modelPath: 'assets/models/gallery.glb',
//   seed: -1,
//   plan: 0,
//   renderSwitch: false,
//   compassSwitch: true,
//   prompt: 'Gallery',
//   task: 'find a purple stool in the gallery.',
//   persona: 'a 27 years old student',
//   modelPosition: [-10, 0, 0],
//   cameraPosition: [0, 15, 0],
//   agentPosition: {
//     position: [-25, 1.4, -7],
//     rotation: [0, -Math.PI / 2, 0],
//   },
//   pathSize: 1,
//   pathColor: 'red',
// },
