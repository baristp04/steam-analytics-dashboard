import { Navigate, Route, Routes } from "react-router-dom";
import SteamGenreDashboard from "./pages/SteamGenreDashboard";
import GamesPage from "./pages/Games";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SteamGenreDashboard />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
