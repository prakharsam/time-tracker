import { BrowserRouter, Routes, Route } from "react-router-dom";
import ActivateAccount from "./pages/ActivateAccount";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/activate" element={<ActivateAccount />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
