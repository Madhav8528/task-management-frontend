"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/task/${taskId}`);
      setTask(response.data.data);
    } catch (err) {
      setError("Failed to load task details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdateLoading(true);
      await api.patch(`/api/v1/task/${taskId}`, { status: newStatus });
      setTask((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError("Failed to update task status");
      console.error(err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setDeleteLoading(true);
      await api.delete(`/api/v1/task/${taskId}`);
      navigate("/tasks");
    } catch (err) {
      setError("Failed to delete task");
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading task details...</div>;
  }

  if (!task) {
    return (
      <div className="task-not-found">
        <h2>Task Not Found</h2>
        <p>
          The task you're looking for doesn't exist or you don't have permission
          to view it.
        </p>
        <Link to="/tasks" className="btn btn-primary">
          Back to Tasks
        </Link>
      </div>
    );
  }

  const isCreator = user._id === task.assignedBy._id;
  const isAssignee = user.username === task.assignedtoUsername;
  const canEdit = isCreator;
  const canDelete = isCreator;
  const canUpdateStatus = isCreator || isAssignee;

  return (
    <div className="task-detail-container">
      {error && <div className="error-message">{error}</div>}

      <div className="task-detail-header">
        <h1>{task.name}</h1>
        <span className={`status-badge ${task.status}`}>{task.status}</span>
      </div>

      <div className="task-detail-content">
        <div className="task-detail-section">
          <h3>Details</h3>
          <p>{task.details}</p>
        </div>

        <div className="task-detail-meta">
          <div className="task-detail-dates">
            <div className="meta-item">
              <span className="meta-label">Start Date:</span>
              <span className="meta-value">{formatDate(task.startDate)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">End Date:</span>
              <span className="meta-value">{formatDate(task.endDate)}</span>
            </div>
          </div>

          <div className="task-detail-assignment">
            {task.assignedtoUsername && (
              <div className="meta-item">
                <span className="meta-label">Assigned To:</span>
                <span className="meta-value">{task.assignedtoUsername}</span>
              </div>
            )}

            {task.assignedBy && (
              <div className="meta-item">
                <span className="meta-label">Created By:</span>
                <span className="meta-value">{task.assignedBy.username}</span>
              </div>
            )}

            <div className="meta-item">
              <span className="meta-label">Created At:</span>
              <span className="meta-value">{formatDate(task.createdAt)}</span>
            </div>

            {task.updatedAt && (
              <div className="meta-item">
                <span className="meta-label">Last Updated:</span>
                <span className="meta-value">{formatDate(task.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="task-detail-actions">
        {canUpdateStatus && (
          <div className="status-update-actions">
            <h3>Update Status</h3>
            <div className="status-buttons">
              <button
                className={`btn status-btn pending ${
                  task.status === "pending" ? "active" : ""
                }`}
                onClick={() => handleStatusChange("pending")}
                disabled={statusUpdateLoading || task.status === "pending"}
              >
                Pending
              </button>
              <button
                className={`btn status-btn in-progress ${
                  task.status === "in-progress" ? "active" : ""
                }`}
                onClick={() => handleStatusChange("in-progress")}
                disabled={statusUpdateLoading || task.status === "in-progress"}
              >
                In Progress
              </button>
              <button
                className={`btn status-btn completed ${
                  task.status === "completed" ? "active" : ""
                }`}
                onClick={() => handleStatusChange("completed")}
                disabled={statusUpdateLoading || task.status === "completed"}
              >
                Completed
              </button>
            </div>
          </div>
        )}

        <div className="task-actions">
          <Link to="/tasks" className="btn btn-secondary">
            Back to Tasks
          </Link>

          {canEdit && (
            <Link to={`/tasks/${taskId}/edit`} className="btn btn-primary">
              Edit Task
            </Link>
          )}

          {canDelete && (
            <button
              className="btn btn-danger"
              onClick={handleDeleteTask}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Task"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
