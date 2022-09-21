import React from "react";

const TaskTemp = () => {
  return (
    <div
      style={{
        margin: "1rem 5px 5px 5px",
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
        <p
          style={{
            width: "90%",
            backgroundColor: "#e0e0e0",
            height: "15px",
            borderRadius: "20px",
          }}
        ></p>
      </div>
      <div
        style={{
          width: "45%",
          height: "15px",
          marginTop: "15px",
          backgroundColor: "#e0e0e0",
          borderRadius: "20px",
        }}
      ></div>
      <div
        style={{
          width: "35%",
          marginTop: "8px",
          height: "15px",
          backgroundColor: "#e0e0e0",
          borderRadius: "20px",
        }}
      ></div>
    </div>
  );
};
export default TaskTemp;
