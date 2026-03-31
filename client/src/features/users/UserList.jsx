import React, { useMemo } from 'react';
import axios from "axios";

function UserList({ users, refresh, onSelect, onMessage }) {

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:3000/users/${id}`);
    refresh();
  };

  // 🔥 GROUP USERS + SKILLS
  const finalUsers = useMemo(() => {
    const grouped = {};

    users.forEach((u) => {
      const id = u[0];

      if (!grouped[id]) {
        grouped[id] = {
          user_id: u[0],
          first_name: u[1],
          last_name: u[2],
          email: u[3],
          department: u[4],
          year: u[5],
          skills: []
        };
      }

      if (u[6] && u[6] !== null) {
        grouped[id].skills.push({
          name: u[6],
          level: u[7] || null
        });
      }
    });

    return Object.values(grouped);
  }, [users]);

  return (
    <div className='card'>
      <h2>All Users</h2>

      <div className='user-list'>
        {finalUsers.map((u) => (
          <div key={u.user_id} className="user-card">

            {/* 🔥 CLICK TO SELECT USER */}
            <div
              className="user-info"
              onClick={() =>
                onSelect([
                  u.user_id,
                  u.first_name,
                  u.last_name,
                  u.email,
                  u.department,
                  u.year
                ])
              }
            >
              <div className="user-name">
                #{u.user_id} • {u.first_name} {u.last_name}
              </div>

              <div className="user-details">
                <span>{u.email}</span>
                <span>{u.department}</span>
                <span>Year {u.year}</span>

                <span>
                    Skills:{" "}
                    {u.skills.filter(s => s.name).length > 0
                        ? u.skills
                            .filter(s => s.name)
                            .map(s => `${s.name}${s.level ? ` (${s.level})` : ""}`)
                            .join(", ")
                        : "None"}
                </span>
              </div>
            </div>
                      
            <button onClick={() => onMessage(u.user_id)}>
              Message
            </button>

            {/* 🔥 DELETE BUTTON */}
             {/* <div className='btn-group'>
              <button onClick={() => deleteUser(u.user_id)}>
                Delete
              </button>
            </div>  */}

          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;