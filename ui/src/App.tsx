import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AgentsPage from './pages/AgentsPage'
import SkillsPage from './pages/SkillsPage'
import PromptsPage from './pages/PromptsPage'
import PlaygroundPage from './pages/PlaygroundPage'
import CheatsheetPage from './pages/CheatsheetPage'
import GeneratePage from './pages/GeneratePage'
import DocsPage from './pages/DocsPage'
import DailyMissionsPage from './pages/DailyMissionsPage'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-body)' }}>
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/missions" element={<DailyMissionsPage />} />
            <Route path="/cheatsheet" element={<CheatsheetPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
