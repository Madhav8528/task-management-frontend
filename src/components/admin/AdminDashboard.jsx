"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import UserList from "./UserList";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all users
        const usersResponse = await api.post("/api/v1/admin/get-all-user");
        setUsers(usersResponse.data.data);

        // Fetch user count
        const userCountResponse = await api.post(
          "/api/v1/admin/get-number-of-user"
        );
        setUserCount(userCountResponse.data.data);

        // Fetch all tasks
        const tasksResponse = await api.get("/api/v1/task");
        setTasks(tasksResponse.data.data);
      } catch (err) {
        setError("Failed to load admin dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate task statistics
  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "pending").length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    };
  };

  const taskStats = getTaskStats();

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Users</h3>
          <div className="stat-value">{userCount}</div>
          <p>Total registered users</p>
        </div>

        <div className="stat-card">
          <h3>Tasks</h3>
          <div className="stat-value">{taskStats.total}</div>
          <p>Total tasks in system</p>
        </div>

        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <div className="stat-value">{taskStats.pending}</div>
          <p>
            {((taskStats.pending / taskStats.total) * 100).toFixed(1)}% of all
            tasks
          </p>
        </div>

        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <div className="stat-value">{taskStats.completed}</div>
          <p>
            {((taskStats.completed / taskStats.total) * 100).toFixed(1)}% of all
            tasks
          </p>
        </div>
      </div>

      <div className="admin-section">
        <h2>User Management</h2>
        <UserList
          users={users}
          onUserDeleted={(userId) => {
            setUsers(users.filter((user) => user._id !== userId));
            setUserCount((prev) => prev - 1);
          }}
        />
      </div>

      <div className="admin-section">
        <h2>Recent Tasks</h2>
        <div className="admin-task-list">
          <table>
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Assigned To</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 10).map((task) => (
                <tr key={task._id}>
                  <td>{task.name}</td>
                  <td>{task.assignedtoUsername || "Unassigned"}</td>
                  <td>{task.assignedBy?.username || "Unknown"}</td>
                  <td>
                    <span className={`status-badge ${task.status}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/tasks/${task._id}`} className="btn btn-sm">
                      View
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this task?"
                          )
                        ) {
                          try {
                            await api.delete(
                              `/api/v1/admin/delte-user-task/${task._id}`
                            );
                            setTasks(tasks.filter((t) => t._id !== task._id));
                          } catch (err) {
                            setError("Failed to delete task");
                          }
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
