import React from "react";
import PropTypes from "prop-types";

const TaskButton = ({ color, text, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: color, margin: "0", width: "110px" }}
      className="status-btn security-access"
    >
      {text}
    </button>
  );
};

TaskButton.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
  onClick: PropTypes.func,
};

export default TaskButton;
