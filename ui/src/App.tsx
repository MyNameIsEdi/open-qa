import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { useRtl } from './hooks/useRtl'
import HomePage from './pages/HomePage'
import AgentsPage from './pages/AgentsPage'
import SkillsPage from './pages/SkillsPage'
import PromptsPage from './pages/PromptsPage'
import PlaygroundPage from './pages/PlaygroundPage'
import CheatsheetPage from './pages/CheatsheetPage'
import GeneratePage from './pages/GeneratePage'
import DocsPage from './pages/DocsPage'
import DailyMissionsPage from './pages/DailyMissionsPage'
import SubmitAgentPage from './pages/SubmitAgentPage'
import GuidesPage from './pages/GuidesPage'
import PlaywrightDashboard from './pages/PlaywrightDashboard'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isRtl = useRtl()

  return (
    <HashRouter>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-body)' }}>
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />

        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        />

        <main
          className={`pt-14 transition-all duration-300 ease-in-out ${
            isRtl
              ? sidebarCollapsed ? 'md:pr-14' : 'md:pr-56'
              : sidebarCollapsed ? 'md:pl-14' : 'md:pl-56'
          }`}
        >
          <Routes>
            <Route path="/"           element={<HomePage />} />
            <Route path="/agents"     element={<AgentsPage />} />
            <Route path="/skills"     element={<SkillsPage />} />
            <Route path="/prompts"    element={<PromptsPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/generate"   element={<GeneratePage />} />
            <Route path="/missions"   element={<DailyMissionsPage />} />
            <Route path="/cheatsheet" element={<CheatsheetPage />} />
            <Route path="/docs"       element={<DocsPage />} />
            <Route path="/submit"     element={<SubmitAgentPage />} />
            <Route path="/guides"     element={<GuidesPage />} />
            <Route path="/playwright" element={<PlaywrightDashboard />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
