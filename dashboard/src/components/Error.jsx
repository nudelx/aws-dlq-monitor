import React from "react"
import "./Error.css"

function Error({ error, onRetry }) {
  return (
    <div className="error">
      <p>❌ {error}</p>
      <button onClick={onRetry} className="retry-btn">
        Retry
      </button>
    </div>
  )
}

export default Error
