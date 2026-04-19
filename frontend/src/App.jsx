import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  History, 
  Trash2, 
  Download, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Cpu,
  X,
  ExternalLink,
  Shirt,
  User as UserIcon
} from 'lucide-react';
import UploadZone from './components/UploadZone.jsx';
import QuotaModal from './components/QuotaModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { Settings as SettingsIcon } from 'lucide-react';

export default function App() {
  const [garmentImage, setGarmentImage] = useState(null);
  const [personImage, setPersonImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [processingState, setProcessingState] = useState('idle'); // idle, processing, complete
  const [recentFits, setRecentFits] = useState([]);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tryon/history`);
        const data = await response.json();
        if (data.success) {
          setRecentFits(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem('fitfusion_recent');
        if (saved) setRecentFits(JSON.parse(saved));
      }
    };
    fetchHistory();
  }, []);

  const handleTryOn = async () => {
    if (!garmentImage || !personImage) return;

    setProcessingState('processing');
    
    // Get custom tokens from localStorage
    const hfToken = localStorage.getItem('ff_hf_token');
    const replicateToken = localStorage.getItem('ff_replicate_token');

    const formData = new FormData();
    formData.append('garment', garmentImage.file);
    formData.append('person', personImage.file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tryon`, {
        method: 'POST',
        headers: {
          'x-hf-token': hfToken || '',
          'x-replicate-token': replicateToken || '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', JSON.stringify(data, null, 2));
        throw new Error(data.message || 'Server error occurred');
      }

      setResultImage(data.resultUrl);
      setProcessingState('complete');
      
      const newFit = {
        id: Date.now(),
        resultUrl: data.resultUrl,
        garmentUrl: garmentImage.url,
        personUrl: personImage.url,
        date: new Date().toLocaleDateString()
      };
      
      const updatedFits = [newFit, ...recentFits].slice(0, 10);
      setRecentFits(updatedFits);
      localStorage.setItem('fitfusion_recent', JSON.stringify(updatedFits));
    } catch (error) {
      console.error('Try-on error:', error);
      if (error.message.includes('quota') || error.message.includes('capacity')) {
        setShowQuotaModal(true);
      } else {
        alert('Error: ' + error.message);
      }
      setProcessingState('idle');
    }
  };

  const clearHistory = async () => {
    if (confirm('Clear all recent generations?')) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/tryon/history`, { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to clear history on server:', error);
      }
      setRecentFits([]);
      localStorage.removeItem('fitfusion_recent');
    }
  };

  const resetStudio = () => {
    setGarmentImage(null);
    setPersonImage(null);
    setResultImage(null);
    setProcessingState('idle');
  };

  const handleDownload = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `fitfusion-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="app-wrapper">
      {/* Background Decor */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo" onClick={resetStudio}>
          <img src="/favicon.svg" alt="FitFusion Logo" className="navbar-logo-icon" />
          FitFusion <span className="navbar-badge">Studio</span>
        </div>
        <div className="navbar-actions">
          <button className="btn-ghost" onClick={() => setShowSettings(true)} title="API Settings">
            <SettingsIcon size={16} />
          </button>
          <button className="btn-ghost" onClick={resetStudio}>
            <RefreshCw size={16} />
            <span>New Session</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        {/* Hero Section */}
        <header className="hero">
          <div className="hero-tag">
            <div className="hero-tag-dot"></div>
            Next-Gen Virtual Try-On
          </div>
          <h1>
            Transform Your <br />
            <span className="highlight">Fashion Experience</span>
          </h1>
          <p>
            Upload a garment and a person's photo to instantly see the fit using our high-fidelity AI engine.
          </p>
        </header>

        {/* Studio Pipeline Grid */}
        <div className="studio-grid">
          <UploadZone 
            title="Step 1: Garment" 
            subtitle="The clothing item"
            file={garmentImage}
            onFileChange={setGarmentImage}
            icon={Shirt}
          />
          <UploadZone 
            title="Step 2: Person" 
            subtitle="The model or you"
            file={personImage}
            onFileChange={setPersonImage}
            icon={UserIcon}
          />
          <div className="upload-card result-preview-card">
            <div className="upload-card-header">
              <div className="upload-card-label">
                <div className="upload-card-icon">
                  <Sparkles size={18} />
                </div>
                Step 3: Final Fit
              </div>
              <div className="upload-card-tip">AI Generation</div>
            </div>
            <div className="upload-area result-placeholder">
              {resultImage ? (
                <div className="preview-container">
                  <img src={resultImage} alt="Result" className="preview-image" />
                  <div className="preview-overlay">
                    <button onClick={() => handleDownload(resultImage)} className="preview-change-btn" style={{ textDecoration: 'none' }}>
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-area-inner">
                  <div className="upload-icon-wrap" style={{ borderStyle: 'solid', background: 'rgba(112, 0, 255, 0.1)', color: 'var(--accent-purple)' }}>
                    <Zap size={28} />
                  </div>
                  <div className="upload-label-primary">Ready to Blend</div>
                  <div className="upload-label-secondary">Click Generate below</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="action-bar">
          <button 
            className="btn-generate"
            disabled={!garmentImage || !personImage || processingState === 'processing'}
            onClick={handleTryOn}
          >
            <Sparkles size={20} />
            {processingState === 'processing' ? 'Thinking...' : 'Generate Try-On'}
          </button>
        </div>

        {/* Recent Generations */}
        {recentFits.length > 0 && (
          <section className="recent-section">
            <div className="section-header">
              <div className="section-title">
                <History size={20} />
                Recent Results
                <span className="section-count">{recentFits.length}/10</span>
              </div>
              <button className="btn-clear" onClick={clearHistory}>
                <Trash2 size={14} />
                Clear
              </button>
            </div>
            
            <div className="recent-grid">
              {recentFits.map(fit => (
                <div key={fit._id || fit.id} className="recent-card" onClick={() => {
                  setResultImage(fit.resultUrl);
                }}>
                  <img src={fit.resultUrl} alt="Recent" className="recent-thumb" />
                  <div className="recent-overlay">
                    <button className="recent-overlay-btn">
                      <ExternalLink size={14} />
                      Load Output
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-text">© 2026 FitFusion AI. Built with FitFusion-AI.</div>
        <div className="footer-links">
          <div className="footer-badge">
            <Sparkles size={12} />
            Experimental Studio
          </div>
        </div>
      </footer>

      {/* Result Layer */}
      {processingState === 'processing' && (
        <div className="result-layer">
          <button className="result-close" onClick={() => setProcessingState('idle')}>
            <X size={20} />
          </button>

          <div className="processing-wrap">
            <div className="spinner-outer">
              <div className="spinner-core"></div>
            </div>
            <div className="processing-title">Generating Your Fit...</div>
            <p className="processing-sub">
              Our AI is carefully stitching the garment onto your photo. This can take 30-60 seconds on the free tier.
            </p>
            <div className="processing-steps">
              <div className="step-item"><div className="step-dot"></div> Analyzing human pose...</div>
              <div className="step-item"><div className="step-dot" style={{ animationDelay: '0.5s' }}></div> Extracting garment features...</div>
              <div className="step-item"><div className="step-dot" style={{ animationDelay: '1s' }}></div> Warping pixels...</div>
            </div>
          </div>
        </div>
      )}

      {/* Quota Error Modal */}
      <QuotaModal 
        isOpen={showQuotaModal} 
        onClose={() => setShowQuotaModal(false)} 
        onOpenSettings={() => {
          setShowQuotaModal(false);
          setShowSettings(true);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}
