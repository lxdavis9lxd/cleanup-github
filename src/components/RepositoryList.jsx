import { useState, useEffect, useCallback } from 'react';
import './RepositoryList.css';

function RepositoryList({ token, onLogout }) {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteResults, setDeleteResults] = useState([]);

  const fetchRepositories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let allRepos = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `https://api.github.com/user/repos?per_page=100&page=${page}&affiliation=owner`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Invalid token. Please check your Personal Access Token.');
          }
          throw new Error(`Failed to fetch repositories: ${response.statusText}`);
        }

        const repos = await response.json();
        allRepos = [...allRepos, ...repos];

        if (repos.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }

      setRepositories(allRepos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  const toggleRepo = (repoId) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId);
    } else {
      newSelected.add(repoId);
    }
    setSelectedRepos(newSelected);
  };

  const selectAll = () => {
    if (selectedRepos.size === repositories.length) {
      setSelectedRepos(new Set());
    } else {
      setSelectedRepos(new Set(repositories.map((r) => r.id)));
    }
  };

  const deleteSelected = async () => {
    if (selectedRepos.size === 0) return;

    const reposToDelete = repositories.filter((r) => selectedRepos.has(r.id));
    const confirmMessage = `Are you sure you want to delete ${reposToDelete.length} repository(ies)?\n\n${reposToDelete.map((r) => r.full_name).join('\n')}\n\nThis action CANNOT be undone!`;

    if (!window.confirm(confirmMessage)) return;

    setDeleting(true);
    setDeleteResults([]);

    const results = [];

    for (const repo of reposToDelete) {
      try {
        const response = await fetch(`https://api.github.com/repos/${repo.full_name}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (response.ok || response.status === 204) {
          results.push({ repo: repo.full_name, success: true });
        } else {
          const errorData = await response.json().catch(() => ({}));
          results.push({
            repo: repo.full_name,
            success: false,
            error: errorData.message || response.statusText,
          });
        }
      } catch (err) {
        results.push({ repo: repo.full_name, success: false, error: err.message });
      }
    }

    setDeleteResults(results);
    setDeleting(false);

    // Remove successfully deleted repos from the list
    const deletedRepoNames = results.filter((r) => r.success).map((r) => r.repo);
    setRepositories(repositories.filter((r) => !deletedRepoNames.includes(r.full_name)));
    setSelectedRepos(new Set());
  };

  if (loading) {
    return (
      <div className="repo-list-container">
        <div className="loading">Loading repositories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repo-list-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={onLogout}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="repo-list-container">
      <div className="header">
        <h2>Your Repositories ({repositories.length})</h2>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {deleteResults.length > 0 && (
        <div className="delete-results">
          <h4>Delete Results:</h4>
          {deleteResults.map((result, index) => (
            <div
              key={index}
              className={`result-item ${result.success ? 'success' : 'failure'}`}
            >
              {result.repo}: {result.success ? '✓ Deleted' : `✗ ${result.error}`}
            </div>
          ))}
          <button onClick={() => setDeleteResults([])}>Clear</button>
        </div>
      )}

      <div className="actions">
        <label className="select-all">
          <input
            type="checkbox"
            checked={selectedRepos.size === repositories.length && repositories.length > 0}
            onChange={selectAll}
          />
          Select All
        </label>
        <span className="selected-count">
          {selectedRepos.size} selected
        </span>
        <button
          onClick={deleteSelected}
          disabled={selectedRepos.size === 0 || deleting}
          className="delete-btn"
        >
          {deleting ? 'Deleting...' : `Delete Selected (${selectedRepos.size})`}
        </button>
      </div>

      {repositories.length === 0 ? (
        <div className="no-repos">No repositories found.</div>
      ) : (
        <ul className="repo-list">
          {repositories.map((repo) => (
            <li key={repo.id} className="repo-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedRepos.has(repo.id)}
                  onChange={() => toggleRepo(repo.id)}
                />
                <div className="repo-info">
                  <span className="repo-name">{repo.full_name}</span>
                  <span className="repo-visibility">{repo.private ? '🔒 Private' : '🌐 Public'}</span>
                  {repo.description && (
                    <span className="repo-description">{repo.description}</span>
                  )}
                  <span className="repo-meta">
                    <span aria-label={`${repo.stargazers_count} stars`}>⭐ {repo.stargazers_count}</span>
                    {' | '}
                    <span aria-label={`${repo.forks_count} forks`}>🍴 {repo.forks_count}</span>
                    {' | '}
                    Updated: {new Date(repo.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RepositoryList;
