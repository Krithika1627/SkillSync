import React from "react";
import axios from "axios";

function UserCard({ user, onSelect, refresh }) {

  const deleteUser = async (e) => {
    e.stopPropagation(); // 🔥 prevent triggering select

    try {
      await axios.delete(`http://localhost:3000/users/${user[0]}`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="user-card"
      onClick={() => onSelect(user)}   // 🔥 click = edit
    >
      <div className="user-info">
        <div className="user-name">
          #{user[0]} • {user[1]} {user[2]}
        </div>

        <div className="user-details">
          <span>{user[3]}</span>
          <span>{user[4]}</span>
          <span>Year {user[5]}</span>
        </div>
      </div>

      <button onClick={deleteUser}>
        Delete
      </button>
    </div>
  );
}

export default UserCard;