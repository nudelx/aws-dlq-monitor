import React from "react"
import "./DLQCard.css"

function DLQCard({ queue }) {
  const { queueName, status, attributes } = queue

  const messageCount = parseInt(attributes?.approximateNumberOfMessages)
  const notVisibleCount = parseInt(
    attributes?.approximateNumberOfMessagesNotVisible
  )
  const delayedCount = parseInt(attributes?.approximateNumberOfMessagesDelayed)

  const isActive = status === "ACTIVE"
  const hasMessages = messageCount > 0

  const getStatusIcon = () => {
    if (!isActive) return "❌"
    if (hasMessages) return "⚠️"
    return "✅"
  }

  const getStatusText = () => {
    if (!isActive) return "ERROR"
    if (hasMessages) return "HAS MESSAGES"
    return "EMPTY"
  }

  const getStatusClass = () => {
    if (!isActive) return "error"
    if (hasMessages) return "warning"
    return "success"
  }

  const formatTimestamp = timestamp => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className={`dlq-card ${getStatusClass()}`}>
      <div className="card-header">
        <div className="queue-info">
          <h3 className="queue-name">{`💀 ${queueName}`}</h3>
          <div className="status-badge">
            <span className="status-icon">{getStatusIcon()}</span>
            <span className="status-text">{getStatusText()}</span>
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-label">Messages</div>
            <div className="metric-value">{messageCount || 0}</div>
          </div>

          <div className="metric">
            <div className="metric-label">Not Visible</div>
            <div className="metric-value">{notVisibleCount || 0}</div>
          </div>

          <div className="metric">
            <div className="metric-label">Delayed</div>
            <div className="metric-value">{delayedCount || 0}</div>
          </div>
        </div>

        <div className="queue-details">
          <div className="detail-item">
            <span className="detail-label">Created:</span>
            <span className="detail-value">
              {formatTimestamp(attributes?.createdTimestamp)}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Modified:</span>
            <span className="detail-value">
              {formatTimestamp(attributes?.lastModifiedTimestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DLQCard
