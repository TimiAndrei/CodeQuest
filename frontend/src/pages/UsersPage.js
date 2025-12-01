import React, { useEffect, useState } from "react";
import { getUsers } from "../api/users";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch users. Please try again later.");
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Users List</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
