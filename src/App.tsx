import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ForestBackground from "@/components/ForestBackground";
import TaskListPage from "@/pages/TaskListPage";
import PomodoroPage from "@/pages/PomodoroPage";
import RewardsPage from "@/pages/RewardsPage";
import ScoresPage from "@/pages/ScoresPage";
import AnalysisPage from "@/pages/AnalysisPage";
import SettingsPage from "@/pages/SettingsPage";

export default function App() {
  return (
    <Router>
      <ForestBackground />
      <Navigation />
      <main className="md:ml-64 min-h-screen p-4 md:p-8 pb-28 md:pb-8">
        <div className="max-w-6xl mx-auto animate-fade-in">
          <Routes>
            <Route path="/" element={<TaskListPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/scores" element={<ScoresPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}
