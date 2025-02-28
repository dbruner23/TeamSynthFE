import { BrowserRouter, Route, Routes } from "react-router-dom";
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
