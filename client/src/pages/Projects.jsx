import React, { useEffect, useState } from "react";
import axios from "axios";

const currentUser = Number(localStorage.getItem("user_id"));

function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Open",
    skill: ""
  });

  const fetchProjects = async () => {
    const res = await axios.get("http://localhost:3000/projects");
    setProjects(res.data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProject = async () => {
    try {
      await axios.post("http://localhost:3000/projects", {
        ...form,
        user_id: currentUser   // 🔥 auto assign
      });

      fetchProjects();

      // reset form
      setForm({
        title: "",
        description: "",
        status: "Open",
        skill: ""
      });

    } catch (err) {
      console.error(err);
    }
  };

  const deleteProject = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async (project_id) => {
    try {
      await axios.post("http://localhost:3000/request", {
        request_id: Math.floor(Math.random() * 1000),
        user_id: currentUser,
        project_id
      });

      alert("Request sent!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>

      <h1 className="page-title">Projects</h1>

      {/* CREATE PROJECT */}
      <div className="card">
        <h2>Create Project</h2>

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="skill"
          placeholder="Skill (eg. Python,React)"
          onChange={handleChange}
        />

        <div className="btn-group">
          <button onClick={addProject}>Add Project</button>
        </div>
        
      </div>

      {/* PROJECT LIST */}
      <div className="card">
        <h2>All Projects</h2>

        {projects.map((p) => (
          <div key={p.project_id} className="project-card">

            <div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>

              <div>
                <small>👤 {p.first_name} {p.last_name}</small>
                <br />
                <small>📌 {p.status}</small>
              </div>
              <p>🛠 Skills: {p.skills}</p>
            </div>

            <div className="btn-group">
              {p.user_id!==currentUser && (
                <button onClick={() => sendRequest(p.project_id)}>
                  Request
                </button>
              )}
              
              {/* 🔥 only creator can delete */}
              {p.user_id === currentUser && (
                <button onClick={() => deleteProject(p.project_id)}>
                  Delete
                </button>
              )}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Projects;