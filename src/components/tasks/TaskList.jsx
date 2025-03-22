"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = await api.get(`/api/v1/task?${queryParams}`);
      setTasks(response.data.data);
    } catch (err) {
      setError("Failed to load tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading && tasks.length === 0) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h1>All Tasks</h1>
        <Link to="/tasks/create" className="btn btn-primary">
          Create New Task
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <h3>Filters</h3>
        <div className="filter-form">
          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <button onClick={resetFilters} className="btn btn-secondary">
            Reset Filters
          </button>
        </div>
      </div>

      {tasks.length > 0 ? (
        <div className="task-grid">
          {tasks.map((task) => (
            <div key={task._id} className={`task-card ${task.status}`}>
              <div className="task-card-header">
                <h3>{task.name}</h3>
                <span className={`status-badge ${task.status}`}>
                  {task.status}
                </span>
              </div>

              <div className="task-card-body">
                <p className="task-details">
                  {task.details.substring(0, 100)}...
                </p>

                <div className="task-meta">
                  <div className="task-dates">
                    <div>
                      <strong>Start:</strong> {formatDate(task.startDate)}
                    </div>
                    <div>
                      <strong>End:</strong> {formatDate(task.endDate)}
                    </div>
                  </div>

                  {task.assignedtoUsername && (
                    <div className="assigned-to">
                      <strong>Assigned to:</strong> {task.assignedtoUsername}
                    </div>
                  )}

                  {task.assignedBy && (
                    <div className="assigned-by">
                      <strong>Created by:</strong> {task.assignedBy.username}
                    </div>
                  )}
                </div>
              </div>

              <div className="task-card-footer">
                <Link to={`/tasks/${task._id}`} className="btn btn-secondary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-tasks">
          <p>
            No tasks found. Try adjusting your filters or create a new task.
          </p>
          <Link to="/tasks/create" className="btn btn-primary">
            Create New Task
          </Link>
        </div>
      )}
    </div>
  );
};

export default TaskList;
