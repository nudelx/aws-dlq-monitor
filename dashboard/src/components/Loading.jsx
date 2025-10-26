import React from "react"
import "./Loading.css"

function Loading({ message = "Loading DLQ data from Firebase..." }) {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  )
}

export default Loading
