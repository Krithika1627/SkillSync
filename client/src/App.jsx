import React, { useState } from "react";

// pages
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Requests from "./pages/Requests";

// components
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(localStorage.getItem("user_id"));
  const [page, setPage] = useState("dashboard");

  // 🔥 IF NOT LOGGED IN → SHOW LOGIN
  if (!user) {
    return <Login setUser={setUser} />;
  }

  // 🔥 AFTER LOGIN → FULL APP
  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;

      case "users":
        return <Users />;

      case "projects":
        return <Projects />;

      case "requests":
        return <Requests />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="layout">

      <Sidebar setPage={setPage} />

      <div className="main">
        {renderPage()}
      </div>

    </div>
  );
}

export default App;