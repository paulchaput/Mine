import { useState, useEffect } from 'react';
import PeptideLibrary from './components/PeptideLibrary';
import DoseCalculator from './components/DoseCalculator';
import CycleTracker from './components/CycleTracker';
import Calendar from './components/Calendar';
import History from './components/History';
import BottomNav from './components/BottomNav';
import Disclaimer from './components/Disclaimer';
import { loadSettings, saveSettings } from './utils/storage';

function App() {
  const [currentPage, setCurrentPage] = useState('library');
  const [settings, setSettings] = useState(loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const handleAcceptDisclaimer = () => {
    setSettings({ ...settings, disclaimerAccepted: true });
  };

  if (!settings.disclaimerAccepted) {
    return <Disclaimer onAccept={handleAcceptDisclaimer} />;
  }

  return (
    <div className="app">
      <div className="page">
        {currentPage === 'library' && <PeptideLibrary />}
        {currentPage === 'calculator' && <DoseCalculator />}
        {currentPage === 'tracker' && <CycleTracker />}
        {currentPage === 'calendar' && <Calendar />}
        {currentPage === 'history' && <History />}
      </div>
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}

export default App;
