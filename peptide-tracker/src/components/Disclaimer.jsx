import { useState } from 'react';

export default function Disclaimer({ onAccept }) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>⚠️ Important Disclaimer</h2>
        </div>
        <div className="modal-body">
          <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
            <strong>This app is for tracking and logging purposes only.</strong>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4>Please Read Carefully:</h4>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li><strong>Not Medical Advice:</strong> This app does NOT provide medical advice, diagnosis, or treatment recommendations.</li>
              <li><strong>Consult Healthcare Providers:</strong> Always consult with a qualified healthcare professional before starting, stopping, or changing any peptide protocol.</li>
              <li><strong>Reference Data Only:</strong> All dosing ranges, frequencies, and recommendations are for reference purposes only and may not be appropriate for you.</li>
              <li><strong>No Liability:</strong> By using this app, you acknowledge that you are solely responsible for your health decisions.</li>
              <li><strong>Legal Compliance:</strong> Ensure all substances are obtained and used in compliance with local laws and regulations.</li>
            </ul>
          </div>

          <div className="alert alert-info">
            <strong>Data Privacy:</strong> All data is stored locally on your device. No information is sent to external servers.
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9375rem' }}>
                I understand and acknowledge this disclaimer. I will consult a healthcare professional before making any health-related decisions.
              </span>
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-primary btn-block"
            onClick={onAccept}
            disabled={!acknowledged}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
