import React, { useEffect, useState } from "react";
import axios from "axios";

const currentUser = Number(localStorage.getItem("user_id"));

function Requests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await axios.get("http://localhost:3000/requests");
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const acceptRequest = async (id) => {
    await axios.put(`http://localhost:3000/requests/accept/${id}`);
    alert("Request Accepted!");
    fetchRequests();
  };

  const rejectRequest = async (id) => {
    await axios.put(`http://localhost:3000/requests/reject/${id}`);
    alert("Request Rejected!")
    fetchRequests();
  };

  return (
    <div>

      <h1 className="page-title">Join Requests</h1>

      <div className="card">

        {requests.map((r, i) => (
          <div key={i} className="user-card">

            <div>
              <strong>{r[1]}</strong> wants to join{" "}
              <strong>{r[2]}</strong>
              <br />
              <small>Status: {r[3]}</small>
            </div>

            <div className="btn-group">
              {Number(r[4]) === currentUser && r[3]?.trim() === "Pending" && (
                <>
                  <button onClick={() => acceptRequest(r[0])}>
                    Accept
                  </button>

                  <button onClick={() => rejectRequest(r[0])}>
                    Reject
                  </button>
                </>
              )}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Requests;