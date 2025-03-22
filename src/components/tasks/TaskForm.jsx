"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";

const TaskForm = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    details: "",
    startDate: "",
    endDate: "",
    assignedtoUsername: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingTask, setFetchingTask] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch users for assignment dropdown
    const fetchUsers = async () => {
      try {
        const response = await api.get("/api/v1/admin/get-all-user");
        setUsers(response.data.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();

    // If taskId exists, fetch task data for editing
    if (taskId) {
      setIsEditing(true);
      setFetchingTask(true);

      const fetchTask = async () => {
        try {
          const response = await api.get(`/api/v1/task/${taskId}`);
          const task = response.data.data;

          // Format dates for form inputs (YYYY-MM-DD)
          const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toISOString().split("T")[0];
          };

          setFormData({
            name: task.name,
            details: task.details,
            startDate: formatDate(task.startDate),
            endDate: formatDate(task.endDate),
            assignedtoUsername: task.assignedtoUsername || "",
            status: task.status,
          });
        } catch (err) {
          setError("Failed to load task data");
          console.error(err);
        } finally {
          setFetchingTask(false);
        }
      };

      fetchTask();
    }
  }, [taskId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditing) {
        // Update existing task
        await api.patch(`/api/v1/task/${taskId}`, formData);
        navigate(`/tasks/${taskId}`);
      } else {
        // Create new task
        const response = await api.post("/api/v1/task/create-task", formData);
        navigate(`/tasks/${response.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTask) {
    return <div className="loading">Loading task data...</div>;
  }

  return (
    <div className="task-form-container">
      <h1>{isEditing ? "Edit Task" : "Create New Task"}</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="name">Task Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="details">Task Details</label>
          <textarea
            id="details"
            name="details"
            value={formData.details}
            onChange={handleChange}
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="assignedtoUsername">Assign To</label>
          <select
            id="assignedtoUsername"
            name="assignedtoUsername"
            value={formData.assignedtoUsername}
            onChange={handleChange}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user._id} value={user.username}>
                {user.name} ({user.username})
              </option>
            ))}
          </select>
        </div>

        {isEditing && (
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
