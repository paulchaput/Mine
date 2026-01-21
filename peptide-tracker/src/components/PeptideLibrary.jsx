import { useState } from 'react';
import { peptideLibrary, categories, routeInfo } from '../data/seedData';
import { calculateFullDose } from '../utils/calculations';

export default function PeptideLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPeptide, setSelectedPeptide] = useState(null);
  const [showCalculation, setShowCalculation] = useState(false);

  const filteredPeptides = peptideLibrary.filter((peptide) => {
    const matchesSearch = peptide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          peptide.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || peptide.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const PeptideCard = ({ peptide }) => (
    <div className="card" onClick={() => setSelectedPeptide(peptide)} style={{ cursor: 'pointer' }}>
      <div className="card-header">
        <h3 className="card-title">{peptide.name}</h3>
        <span style={{ fontSize: '1.25rem' }}>
          {categories.find(c => c.id === peptide.category)?.icon}
        </span>
      </div>
      <div className="card-subtitle">{peptide.primaryPurpose}</div>
      <div className="card-body">
        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
          {peptide.description}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          <span className="chip chip-sm chip-primary">
            {peptide.recommendedDose} {peptide.unit}
          </span>
          <span className="chip chip-sm">
            {peptide.frequency}
          </span>
          <span className="chip chip-sm">
            {peptide.cycleDurationWeeks}w cycle
          </span>
        </div>
      </div>
    </div>
  );

  const PeptideDetailModal = ({ peptide, onClose }) => {
    if (!peptide) return null;

    const calc = peptide.vialSizeMg && peptide.reconstitutionMl
      ? calculateFullDose(
          peptide.vialSizeMg,
          peptide.reconstitutionMl,
          peptide.unit === 'mcg' ? peptide.recommendedDose / 1000 : peptide.recommendedDose
        )
      : null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{peptide.name}</h2>
          </div>
          <div className="modal-body">
            <div className="chip chip-primary" style={{ marginBottom: '1rem' }}>
              {peptide.primaryPurpose}
            </div>

            <p style={{ marginBottom: '1.5rem' }}>{peptide.description}</p>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Dosing Information</h4>

              <div className="info-row">
                <span className="info-label">Reference Range</span>
                <span className="info-value">
                  {peptide.referenceRangeMin}–{peptide.referenceRangeMax} {peptide.unit}
                </span>
              </div>

              <div className="info-row">
                <span className="info-label">Recommended Dose</span>
                <span className="info-value">{peptide.recommendedDose} {peptide.unit}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Frequency</span>
                <span className="info-value">{peptide.frequency}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Route</span>
                <span className="info-value">{peptide.routes.join(', ')}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Cycle Duration</span>
                <span className="info-value">
                  {peptide.cycleDurationWeeks ? `${peptide.cycleDurationWeeks} weeks` : 'As needed'}
                </span>
              </div>

              <div className="info-row">
                <span className="info-label">Rest Period</span>
                <span className="info-value">
                  {peptide.restWeeks ? `${peptide.restWeeks} weeks` : 'N/A'}
                </span>
              </div>

              {peptide.vialSizeMg && (
                <div className="info-row">
                  <span className="info-label">Typical Vial Size</span>
                  <span className="info-value">{peptide.vialSizeMg} mg</span>
                </div>
              )}

              {peptide.reconstitutionMl && (
                <div className="info-row">
                  <span className="info-label">Reconstitution</span>
                  <span className="info-value">{peptide.reconstitutionMl} mL BAC water</span>
                </div>
              )}
            </div>

            {calc && (
              <>
                <div className="divider"></div>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                    Syringe Calculator
                  </h4>
                  <div className="alert alert-info" style={{ marginBottom: '0.75rem' }}>
                    <strong>Draw {calc.units} units</strong> on a U-100 insulin syringe
                    <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                      {calc.dosesInVial} doses per vial
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowCalculation(!showCalculation)}
                  >
                    {showCalculation ? '📖 Hide' : '📖 Show'} How This Was Calculated
                  </button>

                  {showCalculation && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                        <div style={{ marginBottom: '0.5rem' }}>1. {calc.formula.step1}</div>
                        <div style={{ marginBottom: '0.5rem' }}>2. {calc.formula.step2}</div>
                        <div style={{ marginBottom: '0.5rem' }}>3. {calc.formula.step3}</div>
                        <div>4. {calc.formula.step4}</div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {peptide.routes.length > 0 && (
              <>
                <div className="divider"></div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Administration Routes</h4>
                  {peptide.routes.map((route) => (
                    <div key={route} style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      <strong>{route}:</strong> <span style={{ color: 'var(--text-secondary)' }}>{routeInfo[route]}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {peptide.notes && (
              <>
                <div className="divider"></div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>📝 Notes</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {peptide.notes}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
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
      <h1>Peptide Library</h1>
      <div className="alert alert-info" style={{ fontSize: '0.875rem' }}>
        <strong>For reference only.</strong> Tap any peptide for detailed information. Always consult a healthcare professional.
      </div>

      {/* Search */}
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search peptides..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="filter-tabs">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`filter-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon} {cat.label}
          </div>
        ))}
      </div>

      {/* Results */}
      {filteredPeptides.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>No peptides found matching your search.</p>
        </div>
      ) : (
        <div>
          {filteredPeptides.map((peptide) => (
            <PeptideCard key={peptide.id} peptide={peptide} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPeptide && (
        <PeptideDetailModal
          peptide={selectedPeptide}
          onClose={() => {
            setSelectedPeptide(null);
            setShowCalculation(false);
          }}
        />
      )}
    </div>
  );
}
