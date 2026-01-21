import { useState, useEffect } from 'react';
import { peptideLibrary } from '../data/seedData';
import { loadCycles, saveCycles, loadDoses, saveDoses } from '../utils/storage';
import {
  calculateCycleEndDate,
  calculateRestEndDate,
  getDaysRemaining,
  formatDate,
  formatRelativeDate,
  parseFrequencyToDosesPerWeek
} from '../utils/calculations';

export default function CycleTracker() {
  const [cycles, setCycles] = useState(loadCycles());
  const [doses, setDoses] = useState(loadDoses());
  const [showNewCycleForm, setShowNewCycleForm] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);

  useEffect(() => {
    saveCycles(cycles);
  }, [cycles]);

  useEffect(() => {
    saveDoses(doses);
  }, [doses]);

  const activeCycles = cycles.filter(c => {
    const endDate = new Date(c.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate >= today;
  });

  const NewCycleForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
      peptideId: '',
      cycleName: '',
      startDate: new Date().toISOString().split('T')[0],
      durationWeeks: '',
      frequency: '',
      doseMg: '',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();

      const peptide = peptideLibrary.find(p => p.id === formData.peptideId);
      if (!peptide) return;

      const endDate = calculateCycleEndDate(
        new Date(formData.startDate),
        parseInt(formData.durationWeeks)
      );

      const newCycle = {
        id: Date.now().toString(),
        peptideId: formData.peptideId,
        peptideName: peptide.name,
        cycleName: formData.cycleName || `${peptide.name} Cycle`,
        startDate: formData.startDate,
        endDate: endDate.toISOString().split('T')[0],
        durationWeeks: parseInt(formData.durationWeeks),
        frequency: formData.frequency || peptide.frequency,
        doseMg: parseFloat(formData.doseMg) || peptide.recommendedDose,
        unit: peptide.unit,
        restWeeks: peptide.restWeeks,
        notes: formData.notes,
        createdAt: new Date().toISOString()
      };

      setCycles([...cycles, newCycle]);
      onClose();
    };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>New Cycle</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Peptide <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="form-select"
                  required
                  value={formData.peptideId}
                  onChange={(e) => {
                    const peptide = peptideLibrary.find(p => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      peptideId: e.target.value,
                      durationWeeks: peptide?.cycleDurationWeeks || '',
                      frequency: peptide?.frequency || '',
                      doseMg: peptide?.recommendedDose || ''
                    });
                  }}
                >
                  <option value="">Select a peptide...</option>
                  {peptideLibrary.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.primaryPurpose}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cycle Name (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Winter Cut Stack"
                  value={formData.cycleName}
                  onChange={(e) => setFormData({ ...formData, cycleName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Start Date <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Duration <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="form-input"
                    required
                    placeholder="8"
                    value={formData.durationWeeks}
                    onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                    min="1"
                  />
                  <span style={{ minWidth: '50px', color: 'var(--text-secondary)' }}>weeks</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Frequency</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Daily, 2x per week, etc."
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dose per Administration</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="250"
                  step="0.1"
                  value={formData.doseMg}
                  onChange={(e) => setFormData({ ...formData, doseMg: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Any notes about this cycle..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Start Cycle
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const logDose = (cycleId, status = 'taken') => {
    const cycle = cycles.find(c => c.id === cycleId);
    if (!cycle) return;

    const newDose = {
      id: Date.now().toString(),
      cycleId,
      peptideId: cycle.peptideId,
      peptideName: cycle.peptideName,
      doseMg: cycle.doseMg,
      unit: cycle.unit,
      status, // 'taken', 'skipped', 'planned'
      timestamp: new Date().toISOString(),
      notes: ''
    };

    setDoses([...doses, newDose]);
  };

  const CycleCard = ({ cycle }) => {
    const daysLeft = getDaysRemaining(new Date(cycle.endDate));
    const totalDays = cycle.durationWeeks * 7;
    const daysElapsed = totalDays - daysLeft;
    const progress = Math.round((daysElapsed / totalDays) * 100);

    const cycleDoses = doses.filter(d => d.cycleId === cycle.id);
    const takenDoses = cycleDoses.filter(d => d.status === 'taken').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDoses = cycleDoses.filter(d => {
      const doseDate = new Date(d.timestamp);
      doseDate.setHours(0, 0, 0, 0);
      return doseDate.getTime() === today.getTime();
    });

    const takenToday = todayDoses.some(d => d.status === 'taken');

    return (
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>
              {cycle.cycleName}
            </h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {cycle.peptideName} • {cycle.doseMg} {cycle.unit}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
              {daysLeft}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              days left
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            height: '8px',
            background: 'var(--bg-tertiary)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--accent)',
              transition: 'width 0.3s'
            }} />
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginTop: '0.25rem'
          }}>
            {progress}% complete
          </div>
        </div>

        {/* Info */}
        <div className="info-row" style={{ padding: '0.25rem 0' }}>
          <span className="info-label">Frequency</span>
          <span className="info-value">{cycle.frequency}</span>
        </div>

        <div className="info-row" style={{ padding: '0.25rem 0' }}>
          <span className="info-label">Ends</span>
          <span className="info-value">{formatRelativeDate(new Date(cycle.endDate))}</span>
        </div>

        <div className="info-row" style={{ padding: '0.25rem 0' }}>
          <span className="info-label">Doses Taken</span>
          <span className="info-value">{takenDoses}</span>
        </div>

        {cycle.notes && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            📝 {cycle.notes}
          </div>
        )}

        {/* Today's Action */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          {takenToday ? (
            <div className="alert alert-success" style={{ flex: 1, marginBottom: 0, padding: '0.75rem' }}>
              ✅ Logged today
            </div>
          ) : (
            <>
              <button
                className="btn btn-success"
                onClick={() => logDose(cycle.id, 'taken')}
                style={{ flex: 1 }}
              >
                ✓ Log Dose
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => logDose(cycle.id, 'skipped')}
              >
                Skip
              </button>
            </>
          )}
        </div>

        <button
          className="btn btn-secondary btn-sm btn-block mt-sm"
          onClick={() => setSelectedCycle(cycle)}
        >
          View Details
        </button>
      </div>
    );
  };

  const CycleDetailModal = ({ cycle, onClose }) => {
    if (!cycle) return null;

    const cycleDoses = doses.filter(d => d.cycleId === cycle.id).sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    const handleEndCycle = () => {
      if (confirm('Are you sure you want to end this cycle early?')) {
        setCycles(cycles.map(c =>
          c.id === cycle.id
            ? { ...c, endDate: new Date().toISOString().split('T')[0] }
            : c
        ));
        onClose();
      }
    };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{cycle.cycleName}</h2>
          </div>
          <div className="modal-body">
            <div className="info-row">
              <span className="info-label">Peptide</span>
              <span className="info-value">{cycle.peptideName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Dose</span>
              <span className="info-value">{cycle.doseMg} {cycle.unit}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Frequency</span>
              <span className="info-value">{cycle.frequency}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Start Date</span>
              <span className="info-value">{formatDate(new Date(cycle.startDate))}</span>
            </div>
            <div className="info-row">
              <span className="info-label">End Date</span>
              <span className="info-value">{formatDate(new Date(cycle.endDate))}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Rest Period</span>
              <span className="info-value">
                {cycle.restWeeks ? `${cycle.restWeeks} weeks` : 'None'}
              </span>
            </div>

            <div className="divider"></div>

            <h4>Recent Doses ({cycleDoses.length})</h4>
            {cycleDoses.length === 0 ? (
              <p className="text-muted text-small">No doses logged yet</p>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {cycleDoses.slice(0, 10).map((dose) => (
                  <div key={dose.id} className="info-row" style={{ padding: '0.5rem 0' }}>
                    <span>
                      {new Date(dose.timestamp).toLocaleDateString()}
                      {dose.status === 'taken' && <span style={{ color: 'var(--success)', marginLeft: '0.5rem' }}>✓</span>}
                      {dose.status === 'skipped' && <span style={{ color: 'var(--warning)', marginLeft: '0.5rem' }}>○</span>}
                    </span>
                    <span>{dose.doseMg} {dose.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={handleEndCycle}>
              End Cycle
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Cycle Tracker</h1>
        <button className="btn btn-primary" onClick={() => setShowNewCycleForm(true)}>
          + New
        </button>
      </div>

      {activeCycles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No Active Cycles</h3>
          <p>Start tracking your peptide cycles to monitor progress and adherence.</p>
          <button className="btn btn-primary" onClick={() => setShowNewCycleForm(true)}>
            Start First Cycle
          </button>
        </div>
      ) : (
        activeCycles.map((cycle) => <CycleCard key={cycle.id} cycle={cycle} />)
      )}

      {showNewCycleForm && <NewCycleForm onClose={() => setShowNewCycleForm(false)} />}
      {selectedCycle && <CycleDetailModal cycle={selectedCycle} onClose={() => setSelectedCycle(null)} />}
    </div>
  );
}
