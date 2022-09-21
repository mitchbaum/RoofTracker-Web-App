import React from "react";
import { FaTimes } from "react-icons/fa";

const Task = ({ task, onDelete }) => {
  return (
    <div
      className={`task ${task.reminder ? "reminder" : ""}`}
      style={{
        margin: "5px",
        border: "0.5px lightgrey solid",
        borderRadius: "5px",
        padding: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "",
        }}
      >
        <p style={{ width: "90%", color: "#1d2731" }}>{task.text}</p>
        <FaTimes
          className="btn-animation center delete"
          onClick={() => onDelete(task.id)}
          style={{
            width: "7%",
            height: "7%",
          }}
        />
      </div>

      <p
        style={{
          width: "90%",
          fontSize: "14px",
          marginTop: "8px",
          color: "#777676",
        }}
      >
        Deadline: <span className="FI-message">{task.deadline}</span>
      </p>

      <p
        style={{
          fontSize: "13px",
          color: "darkgray",
          fontWeight: "300",
          marginTop: "4px",
        }}
      >
        {task.author}
      </p>
    </div>
  );
};

export default Task;
