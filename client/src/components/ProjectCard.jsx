import React from "react";
import axios from "axios";

const currentUser = 1;

function ProjectCard({ project, refresh }) {

  const deleteProject = async () => {
    try {
      await axios.delete(`http://localhost:3000/projects/${project.project_id}`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async () => {
    try {
      await axios.post("http://localhost:3000/request", {
        request_id: Math.floor(Math.random() * 1000),
        user_id: currentUser,
        project_id: project.project_id
      });

      alert("Request sent!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="project-card">

      <div className="project-info">
        <h3>{project.title}</h3>
        <p>{project.description}</p>

        <div className="project-meta">
          <span>👤 {project.first_name} {project.last_name}</span>
          <span>📌 {project.status}</span>
        </div>
      </div>

      <div className="btn-group">
        <button onClick={sendRequest}>
          Request
        </button>

        {project.user_id === currentUser && (
          <button onClick={deleteProject}>
            Delete
          </button>
        )}
      </div>

    </div>
  );
}

export default ProjectCard;