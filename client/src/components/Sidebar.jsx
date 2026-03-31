import React from "react";

function Sidebar({ setPage, currentPage }) {
  return (
    <div className="sidebar">

      <h2 className="logo">SkillSync</h2>

      <div className="menu">
        <button
          className={currentPage === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={currentPage === "users" ? "active" : ""}
          onClick={() => setPage("users")}
        >
          Users
        </button>

        <button
          className={currentPage === "projects" ? "active" : ""}
          onClick={() => setPage("projects")}
        >
          Projects
        </button>

        <button
          className={currentPage === "requests" ? "active" : ""}
          onClick={() => setPage("requests")}
        >
          Requests
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          Logout
        </button>
      </div>

    </div>
  );
}

export default Sidebar;