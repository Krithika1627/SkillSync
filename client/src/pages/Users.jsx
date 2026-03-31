import React, { useEffect, useState } from "react";
import axios from "axios";

import UserForm from "../features/users/UserForm";
import UserList from "../features/users/UserList";

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // ===================== ADD THIS (CHAT STATES) =====================
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  // ================================================================

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:3000/users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===================== ADD THIS (CHAT FUNCTIONS) =====================

  const openChat = async (userId) => {
    setChatUser(userId);

    const currentUser = localStorage.getItem("user_id");

    try {
      const res = await axios.get(
        `http://localhost:3000/messages/${currentUser}/${userId}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage) return;

    const sender_id = localStorage.getItem("user_id");

    try {
      await axios.post("http://localhost:3000/message", {
        sender_id,
        receiver_id: chatUser,
        content: newMessage,
      });

      setNewMessage("");

      openChat(chatUser); // refresh messages
    } catch (err) {
      console.error(err);
    }
  };

  // ====================================================================

  return (
    <div>
      <h1 className="page-title">Users</h1>

      <UserForm
        refresh={fetchUsers}
        selectedUser={selectedUser}
      />

      <UserList
        users={users}
        refresh={fetchUsers}
        onSelect={setSelectedUser}

        // ===================== ADD THIS =====================
        onMessage={openChat}
        // ===================================================
      />

      {/* ===================== ADD THIS (CHAT UI) ===================== */}
      {chatUser && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h3>Chat</h3>

          <div style={{ height: "200px", overflowY: "scroll", marginBottom: "10px" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign:
                    msg[0] == localStorage.getItem("user_id")
                      ? "right"
                      : "left",
                }}
              >
                {msg[2]}
              </div>
            ))}
          </div>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <div className="btn-group">
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
      {/* =============================================================== */}
    </div>
  );
}

export default Users;