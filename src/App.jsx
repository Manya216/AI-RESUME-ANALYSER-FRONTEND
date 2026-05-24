import { useState, useEffect } from "react";
import "./App.css";

const API = "https://ai-resume-analyser-backend-3.onrender.com";

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

  // FILE INPUT

  function handleFileChange(e) {

    setFile(e.target.files[0]);
  }

  // SIGNUP

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

  // LOGIN

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

    if (data.access_token) {

      setToken(data.access_token);

      localStorage.setItem(
        "token",
        data.access_token
      );

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

  // FETCH HISTORY

  async function fetchHistory(tokenValue) {

    const res = await fetch(`${API}/resumes`, {

      headers: {

        Authorization: `Bearer ${tokenValue || token}`,
      },
    });

    const data = await res.json();

    setHistory(data);
  }

  // UPLOAD RESUME

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

  // CLEAR HISTORY

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

        {/* AUTH SECTION */}

        {!isLoggedIn && (

          <div className="auth-section">

            <h2>

              Authentication

            </h2>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <div className="auth-buttons">

              <button onClick={signup}>

                Signup

              </button>

              <button onClick={login}>

                Login

              </button>

            </div>

          </div>
        )}

        {/* MAIN APP */}

        {isLoggedIn && (

          <>

            {/* TOP BAR */}

            <div className="top-bar">

              <h1 className="title">

                AI Resume Analyzer

              </h1>

              <button
                className="logout-btn"
                onClick={logout}
              >

                Logout

              </button>

            </div>

            {/* SUBTITLE */}

            <p className="subtitle">

              Upload resume and get ATS score instantly

            </p>

            {/* UPLOAD SECTION */}

            <div className="upload-container">

              <input
                type="file"
                onChange={handleFileChange}
              />

              <br />

              <button
                className="upload-btn"
                onClick={uploadResume}
              >

                Upload Resume

              </button>

            </div>

            {/* LOADING */}

            {loading && (

              <p className="subtitle">

                Analyzing Resume...

              </p>
            )}

            {/* RESULT */}

            {result && (

              <div className="results-section">

                {/* SCORE */}

                <div className="score-display">

                  <p className="ats-label">

                    ATS Score

                  </p>

                  <p className="big-text">

                    {result.analysis?.resume_score}

                  </p>

                  <p className="role-text">

                    {result.analysis?.predicted_role}

                  </p>

                </div>

                {/* SKILLS */}

                <div className="skills-section">

                  <h3 className="skills-heading">

                    Skills Found

                  </h3>

                  <ul className="skills-container">

                    {(result.analysis?.skills_found || []).map(

                      (skill, index) => (

                        <li key={index}>

                          {skill}

                        </li>
                      )
                    )}

                  </ul>

                </div>

                {/* SUGGESTIONS */}

                <div className="suggestions-panel">

                  <h3 style={{ marginBottom: "10px" }}>

                    Suggestions

                  </h3>

                  {(result.analysis?.suggestions || []).length > 0

                    ? result.analysis.suggestions.join(" • ")

                    : "No suggestions available"}

                </div>

                {/* HISTORY */}

                <div className="history-section">

                  <div className="history-header">

                    <h2 className="history-title">

                      Resume History

                    </h2>

                    <button
                      className="clear-history-btn"
                      onClick={clearAllHistory}
                    >

                      Clear History

                    </button>

                  </div>

                  {visibleHistory.map((item) => (

                    <div
                      className="history-card"
                      key={item.id}
                    >

                      <div className="history-meta">

                        <p className="history-file">

                          {item.filename}

                        </p>

                        <p className="history-role">

                          {item.role}

                        </p>

                      </div>

                      <div className="history-score-badge">

                        {item.score}

                      </div>

                      <button
                        className="hide-btn"
                        onClick={() => hideResume(item.id)}
                      >

                        Remove

                      </button>

                    </div>
                  ))}

                </div>

              </div>
            )}

          </>
        )}

      </div>

    </div>
  );
}

export default App;