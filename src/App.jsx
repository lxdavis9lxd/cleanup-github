import { useState } from 'react'
import TokenInput from './components/TokenInput'
import RepositoryList from './components/RepositoryList'
import './App.css'

function App() {
  const [token, setToken] = useState(null)

  const handleTokenSubmit = (submittedToken) => {
    setToken(submittedToken)
  }

  const handleLogout = () => {
    setToken(null)
  }

  return (
    <div className="app">
      {token ? (
        <RepositoryList token={token} onLogout={handleLogout} />
      ) : (
        <TokenInput onTokenSubmit={handleTokenSubmit} />
      )}
    </div>
  )
}

export default App
