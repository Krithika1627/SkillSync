import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    requests: 0,
  });

  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [skills, setSkills] = useState([]);

  const currentUser = Number(localStorage.getItem("user_id"));

  const fetchData = async () => {
    try {
      // ✅ stats
      const statsRes = await axios.get("http://localhost:3000/dashboard");
      setStats(statsRes.data);

      // ✅ projects
      const projRes = await axios.get("http://localhost:3000/projects");
      setProjects(projRes.data);

      // ✅ requests
      const reqRes = await axios.get("http://localhost:3000/requests");
      setRequests(reqRes.data);

      // ✅ skills (SAFE)
      try {
        const skillRes = await axios.get(
          `http://localhost:3000/user-skills/${currentUser}`
        );
        setSkills(skillRes.data);
      } catch {
        setSkills([]); // no crash
      }

    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>

      <h1 className="page-title">Dashboard</h1>

      {/* 🔥 STATS */}
      <div className="stats">
        <div className="stat-card">
          <h3>Users</h3>
          <p>{stats.users}</p>
        </div>

        <div className="stat-card">
          <h3>Projects</h3>
          <p>{stats.projects}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p>{stats.requests}</p>
        </div>
      </div>

      {/* 🔥 GRID */}
      <div className="dashboard-grid">

        {/* PROJECTS */}
        <div className="card">
          <h2>Recent Projects</h2>

          {projects.length > 0 ? (
            projects.slice(0, 3).map((p) => (
              <div key={p.project_id} className="mini-card">
                <h4>{p.title}</h4>
                <p>{p.description}</p>
              </div>
            ))
          ) : (
            <p>No projects</p>
          )}
        </div>

        {/* REQUESTS */}
        <div className="card">
          <h2>Recent Requests</h2>

          {requests.length > 0 ? (
            requests.slice(0, 3).map((r, i) => (
              <div key={r[0] || i} className="mini-card">
                <p>
                  <b>{r[1]}</b> → {r[2]}
                </p>
                <small>{r[3]}</small>
              </div>
            
            ))
          ) : (
            <p>No requests</p>
          )}
        </div>

        {/* SKILLS */}
        <div className="card">
          <h2>Your Skills</h2>

          {skills.length > 0 ? (
            skills.map((s, i) => (
              <span key={i} className="skill-badge">
                <p>{s.SKILL_NAME} ({s.PROFICIENCY_LEVEL})</p>
              </span>
            ))
          ) : (
            <p>No skills added</p>
          )}
        </div>

      </div>

    </div>
  );
}

export default Dashboard;