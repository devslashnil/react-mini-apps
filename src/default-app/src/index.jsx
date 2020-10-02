import React from "react"
import ReactDOM from "react-dom"

console.log("First app")

ReactDOM.render(
  <React.StrictMode>
    <div style={{ margin: "32px", width: "250px" }}>
      <h1> Default App </h1>
    </div>
  </React.StrictMode>,
  document.getElementById("root")
)
