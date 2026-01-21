import { useState, useEffect } from 'react';
import { loadDoses, loadCycles, exportAllData, importAllData, clearAllData } from '../utils/storage';
import { calculateAdherence } from '../utils/calculations';

export default function History() {
  const [doses, setDoses] = useState(loadDoses());
  const [cycles, setCycles] = useState(loadCycles());
  const [view, setView] = useState('doses'); // 'doses', 'insights', 'data'

  useEffect(() => {
    setDoses(loadDoses());
    setCycles(loadCycles());
  }, []);

  const sortedDoses = [...doses].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const takenDoses = doses.filter(d => d.status === 'taken');
  const totalDoses = doses.length;
  const adherenceRate = totalDoses > 0 ? calculateAdherence(totalDoses, takenDoses.length) : 0;

  // Calculate streak
  const calculateStreak = () => {
    if (takenDoses.length === 0) return 0;

    const sortedTaken = [...takenDoses].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const dose of sortedTaken) {
      const doseDate = new Date(dose.timestamp);
      doseDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate - doseDate) / (1000 * 60 * 60 * 24));

      if (diffDays === streak || (streak === 0 && diffDays === 0)) {
        streak++;
        currentDate = doseDate;
      } else if (diffDays > streak + 1) {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peptide-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const result = importAllData(data);

        if (result.success) {
          alert('Data imported successfully! Refreshing...');
          window.location.reload();
        } else {
          alert(`Import failed: ${result.error}`);
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('⚠️ Are you sure? This will delete ALL your data including cycles, doses, and history. This cannot be undone!')) {
      if (confirm('Last chance! This action is permanent.')) {
        const result = clearAllData();
        if (result.success) {
          alert('All data cleared. Reloading...');
          window.location.reload();
        }
      }
    }
  };

  const DosesView = () => (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Dose Log ({sortedDoses.length})</h3>

      {sortedDoses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <p>No doses logged yet</p>
        </div>
      ) : (
        sortedDoses.map((dose) => (
          <div key={dose.id} className="card" style={{ padding: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {dose.peptideName}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {new Date(dose.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="chip chip-sm">
                    {dose.doseMg} {dose.unit}
                  </span>
                  {dose.status === 'taken' && (
                    <span className="chip chip-sm chip-success">✓ Taken</span>
                  )}
                  {dose.status === 'skipped' && (
                    <span className="chip chip-sm chip-warning">Skipped</span>
                  )}
                </div>
              </div>
            </div>
            {dose.notes && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                "{dose.notes}"
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const InsightsView = () => {
    const last7Days = doses.filter(d => {
      const doseDate = new Date(d.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return doseDate >= weekAgo;
    });

    const last30Days = doses.filter(d => {
      const doseDate = new Date(d.timestamp);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return doseDate >= monthAgo;
    });

    const activeCycles = cycles.filter(c => {
      const endDate = new Date(c.endDate);
      const today = new Date();
      return endDate >= today;
    });

    const completedCycles = cycles.filter(c => {
      const endDate = new Date(c.endDate);
      const today = new Date();
      return endDate < today;
    });

    return (
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Insights</h3>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
              {adherenceRate}%
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Adherence Rate
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
              {currentStreak}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Day Streak
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>
              {activeCycles.length}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Active Cycles
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {completedCycles.length}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Completed
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Recent Activity</h4>

          <div className="info-row">
            <span className="info-label">Last 7 Days</span>
            <span className="info-value">{last7Days.length} doses</span>
          </div>

          <div className="info-row">
            <span className="info-label">Last 30 Days</span>
            <span className="info-value">{last30Days.length} doses</span>
          </div>

          <div className="info-row">
            <span className="info-label">Total Logged</span>
            <span className="info-value">{totalDoses} doses</span>
          </div>

          <div className="info-row">
            <span className="info-label">Total Taken</span>
            <span className="info-value">{takenDoses.length} doses</span>
          </div>
        </div>

        {/* Tips */}
        {adherenceRate < 80 && totalDoses > 5 && (
          <div className="alert alert-warning mt-md">
            <strong>💡 Tip:</strong> Your adherence is below 80%. Try setting reminders or adjusting your schedule to improve consistency.
          </div>
        )}

        {currentStreak >= 7 && (
          <div className="alert alert-success mt-md">
            <strong>🔥 Great job!</strong> You're on a {currentStreak}-day streak! Keep it up!
          </div>
        )}
      </div>
    );
  };

  const DataManagementView = () => (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Data Management</h3>

      <div className="alert alert-info">
        All your data is stored locally on this device. Use export/import to backup or transfer your data.
      </div>

      <div className="card">
        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Export Data</h4>
        <p className="text-small text-muted" style={{ marginBottom: '0.75rem' }}>
          Download all your data as a JSON file. This includes cycles, doses, and settings.
        </p>
        <button className="btn btn-primary btn-block" onClick={handleExport}>
          📥 Export Data
        </button>
      </div>

      <div className="card">
        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Import Data</h4>
        <p className="text-small text-muted" style={{ marginBottom: '0.75rem' }}>
          Restore data from a previously exported file. This will merge with existing data.
        </p>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
          id="import-file"
        />
        <label htmlFor="import-file" className="btn btn-secondary btn-block" style={{ marginBottom: 0 }}>
          📤 Import Data
        </label>
      </div>

      <div className="card">
        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--danger)' }}>
          ⚠️ Danger Zone
        </h4>
        <p className="text-small text-muted" style={{ marginBottom: '0.75rem' }}>
          Clear all data from this app. This action cannot be undone. Export your data first!
        </p>
        <button className="btn btn-danger btn-block" onClick={handleClearData}>
          Clear All Data
        </button>
      </div>

      <div className="card" style={{ background: 'var(--bg-secondary)' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Quick Stats</h4>
        <div className="info-row" style={{ padding: '0.25rem 0' }}>
          <span className="info-label">Total Cycles</span>
          <span className="info-value">{cycles.length}</span>
        </div>
        <div className="info-row" style={{ padding: '0.25rem 0' }}>
          <span className="info-label">Total Doses</span>
          <span className="info-value">{doses.length}</span>
        </div>
        <div className="info-row" style={{ padding: '0.25rem 0' }}>
          <span className="info-label">Data Size</span>
          <span className="info-value">
            {(new Blob([JSON.stringify(exportAllData())]).size / 1024).toFixed(1)} KB
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>History</h1>

      {/* Tab Navigation */}
      <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
        <div
          className={`filter-tab ${view === 'doses' ? 'active' : ''}`}
          onClick={() => setView('doses')}
        >
          📝 Doses
        </div>
        <div
          className={`filter-tab ${view === 'insights' ? 'active' : ''}`}
          onClick={() => setView('insights')}
        >
          📊 Insights
        </div>
        <div
          className={`filter-tab ${view === 'data' ? 'active' : ''}`}
          onClick={() => setView('data')}
        >
          💾 Data
        </div>
      </div>

      {/* Content */}
      {view === 'doses' && <DosesView />}
      {view === 'insights' && <InsightsView />}
      {view === 'data' && <DataManagementView />}
    </div>
  );
}
