import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TeamFlow from "./components/TeamFlow";
import TeamFlowBase from "./components/TeamFlowBase";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/teamflow" element={<TeamFlowBase />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
