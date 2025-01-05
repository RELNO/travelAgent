import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import {Provider} from './store';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  
  <Suspense fallback={null}>
    <Provider>
      <App />
    </Provider>
  </Suspense>
 
);
