"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const TaskStatusChart = ({ tasks }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const pendingCount = tasks.filter(
      (task) => task.status === "pending"
    ).length;
    const inProgressCount = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;
    const completedCount = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const ctx = chartRef.current.getContext("2d");

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Pending", "In Progress", "Completed"],
        datasets: [
          {
            data: [pendingCount, inProgressCount, completedCount],
            backgroundColor: [
              "#FFC107", // Pending - amber
              "#2196F3", // In Progress - blue
              "#4CAF50", // Completed - green
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [tasks]);

  return (
    <div style={{ height: "200px" }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default TaskStatusChart;
