import { useState } from 'react';
import { peptideLibrary } from '../data/seedData';
import { calculateFullDose, validateDose, mcgToMg } from '../utils/calculations';

export default function DoseCalculator() {
  const [step, setStep] = useState(1);
  const [selectedPeptide, setSelectedPeptide] = useState(null);
  const [vialMg, setVialMg] = useState('');
  const [reconstitutionMl, setReconstitutionMl] = useState('');
  const [targetDose, setTargetDose] = useState('');
  const [unit, setUnit] = useState('mcg');
  const [result, setResult] = useState(null);

  const handleSelectPeptide = (peptide) => {
    setSelectedPeptide(peptide);
    setVialMg(peptide.vialSizeMg || '');
    setReconstitutionMl(peptide.reconstitutionMl || '');
    setTargetDose(peptide.recommendedDose || '');
    setUnit(peptide.unit || 'mcg');
    setStep(2);
    setResult(null);
  };

  const handleCalculate = () => {
    const vial = parseFloat(vialMg);
    const recon = parseFloat(reconstitutionMl);
    const dose = parseFloat(targetDose);

    if (!vial || !recon || !dose) {
      alert('Please fill in all fields');
      return;
    }

    const doseMg = unit === 'mcg' ? mcgToMg(dose) : dose;
    const calc = calculateFullDose(vial, recon, doseMg);

    // Validate if we have reference ranges
    if (selectedPeptide) {
      const refMin = selectedPeptide.unit === 'mcg'
        ? selectedPeptide.referenceRangeMin
        : selectedPeptide.referenceRangeMin * 1000;
      const refMax = selectedPeptide.unit === 'mcg'
        ? selectedPeptide.referenceRangeMax
        : selectedPeptide.referenceRangeMax * 1000;

      const validation = validateDose(
        unit === 'mcg' ? dose : dose * 1000,
        refMin,
        refMax
      );

      setResult({ ...calc, validation });
    } else {
      setResult({ ...calc, validation: { valid: true, message: 'Calculated' } });
    }

    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedPeptide(null);
    setVialMg('');
    setReconstitutionMl('');
    setTargetDose('');
    setUnit('mcg');
    setResult(null);
  };

  return (
    <div className="container">
      <h1>Dose Calculator</h1>
      <div className="alert alert-info" style={{ fontSize: '0.875rem' }}>
        <strong>Step-by-step calculator</strong> to figure out exactly how many units to draw on your syringe.
      </div>

      {/* Progress Indicator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              background: step >= s ? 'var(--accent)' : 'var(--border)',
              borderRadius: '2px',
              transition: 'background 0.3s'
            }}
          />
        ))}
      </div>

      {/* Step 1: Select Peptide */}
      {step === 1 && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Step 1: Select Peptide</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Choose from the library or skip to enter manually
          </p>

          <div style={{ marginBottom: '1rem' }}>
            {peptideLibrary.slice(0, 10).map((peptide) => (
              <div
                key={peptide.id}
                className="list-item"
                onClick={() => handleSelectPeptide(peptide)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {peptide.name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {peptide.primaryPurpose}
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>→</div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-secondary btn-block"
            onClick={() => setStep(2)}
          >
            Skip - Enter Manually
          </button>
        </div>
      )}

      {/* Step 2: Enter Details */}
      {step === 2 && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Step 2: Enter Details</h3>
          {selectedPeptide && (
            <div className="card" style={{ marginBottom: '1rem', background: 'var(--bg-secondary)' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                {selectedPeptide.name}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Reference: {selectedPeptide.referenceRangeMin}–{selectedPeptide.referenceRangeMax} {selectedPeptide.unit}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Vial Amount <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                className="form-input"
                placeholder="5"
                value={vialMg}
                onChange={(e) => setVialMg(e.target.value)}
                step="0.1"
              />
              <span style={{ minWidth: '40px', color: 'var(--text-secondary)' }}>mg</span>
            </div>
            <div className="form-hint">Total mg in your vial (check the label)</div>
          </div>

          <div className="form-group">
            <label className="form-label">
              BAC Water Added <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                className="form-input"
                placeholder="2"
                value={reconstitutionMl}
                onChange={(e) => setReconstitutionMl(e.target.value)}
                step="0.1"
              />
              <span style={{ minWidth: '40px', color: 'var(--text-secondary)' }}>mL</span>
            </div>
            <div className="form-hint">How much bacteriostatic water you added</div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Target Dose <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                className="form-input"
                placeholder="250"
                value={targetDose}
                onChange={(e) => setTargetDose(e.target.value)}
                step="0.1"
                style={{ flex: 1 }}
              />
              <select
                className="form-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{ flex: 'none', width: '100px' }}
              >
                <option value="mcg">mcg</option>
                <option value="mg">mg</option>
              </select>
            </div>
            <div className="form-hint">Your desired dose</div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCalculate}
              style={{ flex: 1 }}
            >
              Calculate →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && result && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>✅ Calculation Complete</h3>

          {/* Main Result */}
          <div className="card" style={{ background: 'var(--accent)', color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', opacity: 0.9 }}>
              Draw on U-100 Syringe
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {result.units}
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              units
            </div>
          </div>

          {/* Validation Warning */}
          {result.validation?.warning && (
            <div className="alert alert-warning">
              ⚠️ {result.validation.message}
            </div>
          )}

          {/* Additional Info */}
          <div className="card">
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Details</h4>
            <div className="info-row">
              <span className="info-label">Concentration</span>
              <span className="info-value">{result.concentration.toFixed(2)} mg/mL</span>
            </div>
            <div className="info-row">
              <span className="info-label">Dose Volume</span>
              <span className="info-value">{result.volumeMl.toFixed(3)} mL</span>
            </div>
            <div className="info-row">
              <span className="info-label">Doses per Vial</span>
              <span className="info-value">{result.dosesInVial} doses</span>
            </div>
          </div>

          {/* Formula */}
          <details className="card">
            <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>
              📖 How This Was Calculated
            </summary>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '0.5rem' }}>1. {result.formula.step1}</div>
              <div style={{ marginBottom: '0.5rem' }}>2. {result.formula.step2}</div>
              <div style={{ marginBottom: '0.5rem' }}>3. {result.formula.step3}</div>
              <div>4. {result.formula.step4}</div>
            </div>
          </details>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>
              ← Adjust
            </button>
            <button className="btn btn-primary" onClick={handleReset} style={{ flex: 1 }}>
              New Calculation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
