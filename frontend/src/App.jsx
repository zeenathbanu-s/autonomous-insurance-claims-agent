import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import DashboardPage from './pages/DashboardPage'
import ProcessPage from './pages/ProcessPage'
import ResultPage from './pages/ResultPage'
import RoutingRulesPage from './pages/RoutingRulesPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  const [page, setPage]       = useState('dashboard')
  const [result, setResult]   = useState(null)
  const [filename, setFilename] = useState('')
  const [darkMode, setDarkMode] = useState(() => {
    // Persist preference
    return localStorage.getItem('theme') === 'dark'
  })

  // Apply theme to <html> data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const handleResult = (data, fname) => {
    setResult(data); setFilename(fname); setPage('result')
  }

  const navigate = (target) => {
    if (target === 'result' && !result) { setPage('process'); return }
    setPage(target)
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage onNavigate={navigate} />
      case 'process':   return <ProcessPage onResult={handleResult} />
      case 'result':    return <ResultPage result={result} filename={filename} onProcessAnother={() => navigate('process')} />
      case 'rules':     return <RoutingRulesPage onNavigate={navigate} />
      case 'about':     return <AboutPage onNavigate={navigate} />
      default:          return <DashboardPage onNavigate={navigate} />
    }
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={page} onNavigate={navigate} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
      <div className="main-area">
        <Topbar page={page} onNavigate={navigate} hasResult={!!result} darkMode={darkMode} />
        {renderPage()}
      </div>
    </div>
  )
}
