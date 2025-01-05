// import React, { useState } from 'react';
import Settings from './settings';

export default function Panel(props) {
  // const [showSettings, setShowSettings] = useState(false);

  // const handleButtonClick = () => {
  //   setShowSettings(!showSettings);
  // };
  return (
    // <div {...props}>
    //   <button
    //     className="fixed bottom-10 left-10 bg-blue-500 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center"
    //     onClick={handleButtonClick}
    //   >
    //     <img src="/tune.svg" alt="Tune Icon" className="svg-white" />
    //   </button>
    //   {showSettings && (
    //     <div className="fixed bottom-24 left-10 bg-gray-800 p-4 rounded shadow-lg">
    //       <Settings />
    //     </div>
    //   )}
    // </div>
    <div {...props}>
      <Settings className="p-5" />
    </div>
  );
}
