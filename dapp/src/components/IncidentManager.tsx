import { useState } from 'react';
import LandingPage from './LandingPage';
import IncidentWizard from './IncidentWizard';
import IncidentDashboard from './IncidentDashboard';

type AppMode = 'landing' | 'report' | 'dashboard';

export default function IncidentManager() {
  const [currentMode, setCurrentMode] = useState<AppMode>('landing');

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const renderCurrentView = () => {
    switch (currentMode) {
      case 'landing':
        return (
          <LandingPage
            onReportIncident={() => handleModeChange('report')}
            onViewDashboard={() => handleModeChange('dashboard')}
          />
        );
      case 'dashboard':
        return (
          <IncidentDashboard
            onBack={() => handleModeChange('landing')}
          />
        );
      case 'report':
        return <IncidentWizard onBackToHome={() => handleModeChange('landing')} />;
      default:
        return null;
    }
  };

  return renderCurrentView();
}