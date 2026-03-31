import React, { useState, useEffect } from "react";
import axios from "axios";

function UserForm({ refresh, selectedUser }) {
    const currentUser = Number(localStorage.getItem("user_id"));
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    year: "",
  });

  const [selectedId, setSelectedId] = useState(null);
  const [skills, setSkills] = useState("");

  // 🔥 Auto-fill when user is clicked
  useEffect(() => {
    if (selectedUser) {
      setForm({
        first_name: selectedUser[1],
        last_name: selectedUser[2],
        email: selectedUser[3],
        department: selectedUser[4],
        year: selectedUser[5],
      });
  
      setSelectedId(selectedUser[0]);
  
      // 🔥 ADD THIS (skills string from UserList)
      if (selectedUser[6]) {
        setSkills(selectedUser[6]); 
      }
    }
  }, [selectedUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addUser = async () => {
    try {
      await axios.post("http://localhost:3000/users", {
        ...form,
        skills
      });
      refresh();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const updateUser = async () => {
    if (!selectedId) {
      alert("Select a user first");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/users/${selectedId}`,
        {
          ...form,
          skills   // 🔥 important
        }
      );
      refresh();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      department: "",
      year: "",
    });
    setSelectedId(null);
    setSkills(""); // 🔥 add this
  };

  return (
    <div className="card">
      <h2>Update User</h2>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          name={key}
          placeholder={key}
          value={form[key]}
          onChange={handleChange}
        />
      ))}
      <input
  placeholder="skills (e.g. Python-Advanced, SQL-Intermediate)"
  value={skills}
  onChange={(e) => setSkills(e.target.value)}
/>

      <div className="btn-group">
        {/* <button onClick={addUser}>Add</button> */}
        <button
            onClick={updateUser}
            disabled={selectedId !== currentUser}
            >
            Update
            </button>
      </div>
    </div>
  );
}

export default UserForm;