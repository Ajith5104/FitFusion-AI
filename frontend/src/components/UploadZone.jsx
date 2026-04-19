import { useRef, useState } from 'react';
import { Upload, ImageIcon, Sparkles, X } from 'lucide-react';

export default function UploadZone({ title, subtitle, file, onFileChange, icon: Icon }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onFileChange({ file, url });
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="upload-card">
      <div className="upload-card-header">
        <div className="upload-card-label">
          <div className="upload-card-icon">
            <Icon size={18} />
          </div>
          {title}
        </div>
        <div className="upload-card-tip">{subtitle}</div>
      </div>
      
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={file ? undefined : onButtonClick}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="upload-input-file" 
          accept="image/*" 
          onChange={handleChange}
        />
        
        {file ? (
          <div className="preview-container">
            <img src={file.url} alt="Preview" className="preview-image" />
            <div className="preview-overlay">
              <button className="preview-change-btn" onClick={(e) => {
                e.stopPropagation();
                onButtonClick();
              }}>
                <ImageIcon size={16} />
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-area-inner">
            <div className="upload-icon-wrap">
              <Upload size={28} />
            </div>
            <div className="upload-label-primary">Drop image here</div>
            <div className="upload-label-secondary">or click to browse library</div>
            <div className="upload-formats">JPG, PNG, WebP</div>
          </div>
        )}
      </div>
    </div>
  );
}
