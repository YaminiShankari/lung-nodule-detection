import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("No scan uploaded yet.");
  const [loading, setLoading] = useState(false);

  const handleFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setResult(`Selected file: ${selected.name}`);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult("Analyzing scan...");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        setResult("Error: " + data.error);
      } else {
        setResult(data.prediction);
      }
    } catch {
      setResult("Server error. Backend not running.");
    }

    setLoading(false);
  };

  return (
    <div className="app-shell">

      {/* HEADER */}
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">🩺</span>
          <h1>Lung Cancer Detection AI</h1>
        </div>

        <div className="header-right">
          <span className="version">v1.0</span>
          <span className="user-badge">DR</span>
        </div>
      </header>

      {/* MAIN CARD */}
      <main className="card">
        <h2>CT Scan Analysis</h2>
        <p className="description">
          Upload a CT scan image for AI-based screening.
        </p>

        {/* DROP ZONE */}
        <div
          className={`drop-zone ${file ? "active" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="drop-content">

            <div className="cloud">☁</div>

            <h3>
              {file ? "File Ready" : "Drag & Drop your scan"}
            </h3>

            <p>
              {file ? file.name : "PNG / JPG supported"}
            </p>

            <button
              className="small-button"
              onClick={() => document.getElementById("fileInput").click()}
            >
              Select File
            </button>

            <input
              id="fileInput"
              type="file"
              hidden
              accept="image/png,image/jpeg"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          className="primary-button"
          disabled={!file || loading}
          onClick={handleUpload}
        >
          {loading ? "Analyzing..." : "Analyze CT Scan"}
        </button>

        {/* RESULT */}
        <section className="result-box">
          <h4>Result</h4>

          {loading ? (
            <p className="loading">Processing image...</p>
          ) : result === "Cancerous" ? (
            <p className="danger">⚠ Cancer Detected</p>
          ) : result === "Non-Cancerous" ? (
            <p className="success">✓ No Cancer Detected</p>
          ) : (
            <p>{result}</p>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="app-footer">
        <p>
          © 2026 Pulmonary AI Systems — Research Use Only
        </p>
      </footer>

    </div>
  );
}

export default App;