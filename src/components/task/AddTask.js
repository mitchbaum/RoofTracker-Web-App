import React from "react";

import { useState } from "react";
import { doc, collection, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

const AddTask = ({ open, onClose, name, companyId }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [text, setText] = useState("");
  const [textError, setTextError] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [author, setAuthor] = useState("Keith Thompson");

  if (!open) return null;

  const onSubmit = (e) => {
    setMessage("Saving...");
    setError("");
    // preventDefault means the form wont submit to a page
    e.preventDefault();
    if (!text) {
      setTextError(true);
      return;
    }

    addTask({
      text: text,
      deadline: deadline,
      author: name,
    });
  };

  const addTask = async (task) => {
    // add new document to collection "Companies" with randomly generated id
    const docRef = doc(collection(db, `Companies/${companyId}/Tasks`));
    const id = docRef.id;
    const newTask = { id, ...task };

    await setDoc(docRef, newTask)
      .then(() => {
        onClose(false);
        setText("");
        setDeadline("");
        setError("");
        setMessage("");
      })
      .catch((err) => {
        setMessage("");
        return setError("Unable to save task");
      });
  };

  const handleFocus = (e) => {
    setTextError(true);
  };

  return (
    <form
      className="form"
      style={{ padding: "0px 10px", marginTop: "10px" }}
      onSubmit={onSubmit}
    >
      <div className="input-group">
        <label>Task</label>
        <input
          type="text"
          placeholder="Enter task"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required={true}
          onBlur={handleFocus}
          focused={textError.toString()}
        ></input>
        <p className="error-message">Please add a task</p>
      </div>
      <div className="input-group">
        <label>Deadline</label>
        <input
          type="text"
          placeholder="Enter date and time"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        ></input>
      </div>
      <input
        className="status-btn deactivate"
        type="submit"
        value="Save Task"
      />
      <p
        className="error-message"
        style={{ color: "#676767", display: "block" }}
      >
        {message}
      </p>
      <p
        className="error-message"
        style={{ color: "#d30b0e", display: "block" }}
      >
        {error}
      </p>
    </form>
  );
};

export default AddTask;
