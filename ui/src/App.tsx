import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { useRtl } from './hooks/useRtl'
import { SettingsProvider } from './context/SettingsContext'

// Pages
import HomePage          from './pages/HomePage'
import AgentsPage        from './pages/AgentsPage'
import SkillsPage        from './pages/SkillsPage'
import PromptsPage       from './pages/PromptsPage'
import PlaygroundPage    from './pages/PlaygroundPage'
import CheatsheetPage    from './pages/CheatsheetPage'
import GeneratePage      from './pages/GeneratePage'
import DocsPage          from './pages/DocsPage'
import DailyMissionsPage from './pages/DailyMissionsPage'
import SubmitAgentPage   from './pages/SubmitAgentPage'
import GuidesPage        from './pages/GuidesPage'
import PlaywrightDashboard from './pages/PlaywrightDashboard'
import OfficePage        from './pages/OfficePage'
import SettingsPage      from './pages/SettingsPage'

export default function App() {
  const [sidebarOpen, setSidebarOpen]           = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isRtl = useRtl()

  return (
    <SettingsProvider>
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
              {/* ── Core ── */}
              <Route path="/"           element={<HomePage />} />
              <Route path="/missions"   element={<DailyMissionsPage />} />

              {/* ── Office hub ── */}
              <Route path="/office"     element={<OfficePage />} />

              {/* ── Tools (accessible from Office canvas clicks too) ── */}
              <Route path="/agents"     element={<AgentsPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/generate"   element={<GeneratePage />} />
              <Route path="/prompts"    element={<PromptsPage />} />
              <Route path="/skills"     element={<SkillsPage />} />

              {/* ── Learning ── */}
              <Route path="/guides"     element={<GuidesPage />} />
              <Route path="/cheatsheet" element={<CheatsheetPage />} />

              {/* ── Testing ── */}
              <Route path="/playwright" element={<PlaywrightDashboard />} />
              <Route path="/docs"       element={<DocsPage />} />

              {/* ── Community ── */}
              <Route path="/submit"     element={<SubmitAgentPage />} />

              {/* ── Config ── */}
              <Route path="/settings"   element={<SettingsPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </SettingsProvider>
  )
}
