import { BrowserRouter, Route, Routes } from "react-router-dom";
import TeamFlowBase from "./components/TeamFlowBase";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TeamFlowBase />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
