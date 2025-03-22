"use client";

import { useState } from "react";
import api from "../../utils/api";

const UserList = ({ users, onUserDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/v1/admin/delete-user/${userId}`);
      onUserDeleted(userId);
    } catch (err) {
      setError("Failed to delete user");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserTasks = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }

    try {
      setLoadingTasks(true);
      const response = await api.get(`/api/v1/admin/get-user-task/${userId}`);
      setUserTasks(response.data.data);
      setExpandedUser(userId);
    } catch (err) {
      console.error("Failed to fetch user tasks:", err);
      setUserTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  return (
    <div className="user-list">
      {error && <div className="error-message">{error}</div>}

      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <>
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleViewUserTasks(user._id)}
                  >
                    {expandedUser === user._id ? "Hide Tasks" : "View Tasks"}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
              {expandedUser === user._id && (
                <tr className="user-tasks-row">
                  <td colSpan="4">
                    {loadingTasks ? (
                      <div className="loading">Loading user tasks...</div>
                    ) : userTasks.length > 0 ? (
                      <div className="user-tasks">
                        <h4>Tasks for {user.username}</h4>
                        <table className="nested-table">
                          <thead>
                            <tr>
                              <th>Task Name</th>
                              <th>Status</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userTasks.map((task) => (
                              <tr key={task._id}>
                                <td>{task.name}</td>
                                <td>
                                  <span
                                    className={`status-badge ${task.status}`}
                                  >
                                    {task.status}
                                  </span>
                                </td>
                                <td>
                                  {new Date(
                                    task.startDate
                                  ).toLocaleDateString()}
                                </td>
                                <td>
                                  {new Date(task.endDate).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>No tasks assigned to this user.</p>
                    )}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
