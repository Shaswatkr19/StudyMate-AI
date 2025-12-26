import { useState } from 'react';
import LandingPage from "./components/LandingPage";
import NotebookLMStudyTool from "./components/NotebookLMStudyTool";

export default function App() {
  const [showApp, setShowApp] = useState(false);

  console.log('Current showApp state:', showApp);

  const handleBack = () => {
    console.log('handleBack called!');
    setShowApp(false);
  };

  if (showApp) {
    return (
      <NotebookLMStudyTool 
        onBack={handleBack}
      />
    );
  }

  return <LandingPage onGetStarted={() => {
    console.log('Get Started clicked!');
    setShowApp(true);
  }} />;
}
