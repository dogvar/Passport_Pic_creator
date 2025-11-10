
import React, { useState, useCallback } from 'react';
import { FeatureMode } from './types';
import Header from './components/Header';
import Toggle from './components/Toggle';
import PassportPhotoConverter from './features/passport/PassportPhotoConverter';
import PortraitGenerator from './features/portrait/PortraitGenerator';
import PrivacyNotice from './components/PrivacyNotice';

const App: React.FC = () => {
  const [mode, setMode] = useState<FeatureMode>('passport');

  const handleModeChange = useCallback((newMode: FeatureMode) => {
    setMode(newMode);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          <Toggle currentMode={mode} onModeChange={handleModeChange} />
          <div className="mt-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 min-h-[600px]">
            {mode === 'passport' ? <PassportPhotoConverter /> : <PortraitGenerator />}
          </div>
        </main>
        <PrivacyNotice />
      </div>
    </div>
  );
};

export default App;
