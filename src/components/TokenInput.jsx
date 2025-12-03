import { useState } from 'react';
import './TokenInput.css';

function TokenInput({ onTokenSubmit }) {
  const [token, setToken] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
    }
  };

  return (
    <div className="token-input-container">
      <h2>GitHub Repository Cleanup</h2>
      <p>Enter your GitHub Personal Access Token to get started</p>
      <p className="token-info">
        Required scopes: <code>repo</code> and <code>delete_repo</code>
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your GitHub PAT"
          className="token-input"
        />
        <button type="submit" className="submit-btn">
          Connect
        </button>
      </form>
    </div>
  );
}

export default TokenInput;
