import React from "react"
import "./Header.css"
import Pulse from "./Pulse"

function Header({ lastUpdated, showOnlyWithMessages, onToggleFilter }) {
  const [date, time] = lastUpdated
    ? lastUpdated?.toLocaleString().split(",")
    : ["Never", "Never"]
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="title">
            <span className="icon">😎</span>
            REC-TEAM <font color="yellow">REALTIME</font> DLQ Monitor
          </h1>
          <p className="subtitle padding-left">
            Dead Letter Queue Status Dashboard
          </p>
        </div>
        <div className="header-center">
          <Pulse />
        </div>

        <div className="header-right">
          <div className="filter-controls">
            <button
              className={`filter-btn ${showOnlyWithMessages ? "active" : ""}`}
              onClick={onToggleFilter}
              title={
                showOnlyWithMessages
                  ? "Show all queues"
                  : "Show only queues with messages"
              }
            >
              {showOnlyWithMessages ? "📋 All Queues" : "⚠️ With Messages"}
            </button>
          </div>
          <div className="last-updated">
            <span className="label">Last updated:</span>
            <span className="time">{date ? date : "Never"}</span>
            <span className="time">{time ? time : "Never"}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
