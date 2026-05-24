import { useState, useEffect } from "react";
import "./App.css";

const API=" https://ai-resume-analyser-backend-3.onrender.com"

function App() {
  // AUTH
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // RESUME
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const [hiddenIds, setHiddenIds] = useState([]);

  // AUTO LOGIN
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      fetchHistory(savedToken);
    }
  }, []);

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  // SIGNUP (JSON FIXED)
  async function signup() {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        email,
        password
      })
    });

    const data = await res.json();
    alert(data.message || "Signup completed");
  }

  // LOGIN (🔥 FIXED - NO 422 ERROR)
  async function login() {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

    console.log("LOGIN RESPONSE:", data);

    if (data.access_token) {
      setToken(data.access_token);
      localStorage.setItem("token", data.access_token);
      setIsLoggedIn(true);
      fetchHistory(data.access_token);
    } else {
      alert(data.message || "Login failed");
    }
  }

  // LOGOUT
  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setIsLoggedIn(false);
    setResult(null);
    setHistory([]);
    setHiddenIds([]);
  }

  // HISTORY
  async function fetchHistory(tokenValue) {
    const res = await fetch(`${API}/resumes`, {
      headers: {
        Authorization: `Bearer ${tokenValue || token}`,
      },
    });

    const data = await res.json();
    setHistory(data);
  }

  // UPLOAD
  async function uploadResume() {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    setResult(data);
    setLoading(false);
    fetchHistory(token);
  }

  // REMOVE SINGLE
  function hideResume(id) {
    setHiddenIds([...hiddenIds, id]);
  }

  // CLEAR ALL
  function clearAllHistory() {
    setHistory([]);
    setHiddenIds([]);
  }

  const visibleHistory = history.filter(
    (item) => !hiddenIds.includes(item.id)
  );

  return (
    <div className="main-container">
      <div className="card">

        {/* AUTH */}
        {!isLoggedIn && (
          <div className="auth-section">
            <h2>Authentication</h2>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="auth-buttons">
              <button onClick={signup}>Signup</button>
              <button onClick={login}>Login</button>
            </div>
          </div>
        )}

        {/* MAIN APP */}
        {isLoggedIn && (
          <>
            <div className="top-bar">
              <h1>AI Resume Analyzer</h1>
              <button onClick={logout}>Logout</button>
            </div>

            <p>Upload resume and get ATS score instantly</p>

            {/* UPLOAD */}
            <input type="file" onChange={handleFileChange} />

            <button onClick={uploadResume}>
              Upload Resume
            </button>

            {loading && <p>Analyzing...</p>}

            {/* RESULT */}
            {result && (
              <div>
                <h2>ATS Score: {result.analysis?.resume_score}</h2>
                <h3>Role: {result.analysis?.predicted_role}</h3>

                <h4>Skills:</h4>
                <ul>
                  {(result.analysis?.skills_found || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>

                <h4>Suggestions:</h4>
                <ul>
                  {(result.analysis?.suggestions || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* HISTORY */}
            <div>
              <h2>Resume History</h2>

              <button onClick={clearAllHistory}>
                Clear History
              </button>

              {visibleHistory.map((item) => (
                <div key={item.id}>
                  <p><b>File:</b> {item.filename}</p>
                  <p><b>Score:</b> {item.score}</p>
                  <p><b>Role:</b> {item.role}</p>

                  <button onClick={() => hideResume(item.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

          </>
        )}

      </div>
    </div>
  );
}

export default App;