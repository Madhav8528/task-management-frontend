"use client";

import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";
import TaskStatusChart from "./TaskStatusChart";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [myTasks, setMyTasks] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch tasks assigned to the user
        const myTasksResponse = await api.get("/api/v1/task/my-tasks");
        setMyTasks(myTasksResponse.data.data);

        // Fetch tasks created by the user
        const createdTasksResponse = await api.get(
          "/api/v1/task/task-created-by-me"
        );
        setCreatedTasks(createdTasksResponse.data.data);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate task statistics
  const getTaskStats = (tasks) => {
    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "pending").length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    };
  };

  const myTaskStats = getTaskStats(myTasks);
  const createdTaskStats = getTaskStats(createdTasks);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-actions">
        <Link to="/tasks/create" className="btn btn-primary">
          Create New Task
        </Link>
        <Link to="/tasks" className="btn btn-secondary">
          View All Tasks
        </Link>
        <Link to="/lobby" className="btn btn-secondary">
          Meeting Lobby
        </Link>
      </div>
      

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>My Tasks</h2>
          <div className="task-stats">
            <div className="stat-item">
              <span className="stat-value">{myTaskStats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item pending">
              <span className="stat-value">{myTaskStats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item in-progress">
              <span className="stat-value">{myTaskStats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item completed">
              <span className="stat-value">{myTaskStats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          {myTasks.length > 0 ? (
            <div className="chart-container">
              <TaskStatusChart tasks={myTasks} />
            </div>
          ) : (
            <p className="no-data">No tasks assigned to you yet.</p>
          )}

          <h3>Recent Tasks</h3>
          {myTasks.length > 0 ? (
            <ul className="task-list">
              {myTasks.slice(0, 3).map((task) => (
                <li key={task._id} className={`task-item ${task.status}`}>
                  <Link to={`/tasks/${task._id}`}>
                    <span className="task-name">{task.name}</span>
                    <span className="task-status">{task.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No tasks assigned to you yet.</p>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Tasks Created by Me</h2>
          <div className="task-stats">
            <div className="stat-item">
              <span className="stat-value">{createdTaskStats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item pending">
              <span className="stat-value">{createdTaskStats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item in-progress">
              <span className="stat-value">{createdTaskStats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item completed">
              <span className="stat-value">{createdTaskStats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          {createdTasks.length > 0 ? (
            <div className="chart-container">
              <TaskStatusChart tasks={createdTasks} />
            </div>
          ) : (
            <p className="no-data">You haven't created any tasks yet.</p>
          )}

          <h3>Recent Created Tasks</h3>
          {createdTasks.length > 0 ? (
            <ul className="task-list">
              {createdTasks.slice(0, 3).map((task) => (
                <li key={task._id} className={`task-item ${task.status}`}>
                  <Link to={`/tasks/${task._id}`}>
                    <span className="task-name">{task.name}</span>
                    <span className="task-status">{task.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">You haven't created any tasks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
