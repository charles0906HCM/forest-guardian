import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ForestBackground from "@/components/ForestBackground";
import TaskListPage from "@/pages/TaskListPage";
import PomodoroPage from "@/pages/PomodoroPage";
import RewardsPage from "@/pages/RewardsPage";
import ScoresPage from "@/pages/ScoresPage";
import AnalysisPage from "@/pages/AnalysisPage";
import SettingsPage from "@/pages/SettingsPage";
// 零用钱财商模块
import WalletHomePage from "@/pages/allowance/WalletHomePage";
import ExchangePage from "@/pages/allowance/ExchangePage";
import AddRecordPage from "@/pages/allowance/AddRecordPage";
import AllowanceRecordListPage from "@/pages/allowance/RecordListPage";
import AllowanceAnalysisPage from "@/pages/allowance/AnalysisPage";
import WishListPage from "@/pages/allowance/WishListPage";
import AchievementPage from "@/pages/allowance/AchievementPage";
import ParentSettingsPage from "@/pages/allowance/ParentSettingsPage";
import ParentManagePage from "@/pages/allowance/ParentManagePage";

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
            {/* 零用钱财商模块 */}
            <Route path="/allowance" element={<WalletHomePage />} />
            <Route path="/allowance/exchange" element={<ExchangePage />} />
            <Route path="/allowance/add-record" element={<AddRecordPage />} />
            <Route path="/allowance/records" element={<AllowanceRecordListPage />} />
            <Route path="/allowance/analysis" element={<AllowanceAnalysisPage />} />
            <Route path="/allowance/wishes" element={<WishListPage />} />
            <Route path="/allowance/achievements" element={<AchievementPage />} />
            <Route path="/allowance/parent-settings" element={<ParentSettingsPage />} />
            <Route path="/allowance/parent-manage" element={<ParentManagePage />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}
