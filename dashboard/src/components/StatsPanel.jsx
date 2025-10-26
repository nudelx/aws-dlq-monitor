import React from "react"
import "./StatsPanel.css"
import TotalQueuesCard from "./TotalQueuesCard.jsx"
import ActiveQueuesCard from "./ActiveQueuesCard.jsx"
import ErrorQueuesCard from "./ErrorQueuesCard.jsx"
import TotalMessagesCard from "./TotalMessagesCard.jsx"

function StatsPanel({ activeQueues, errorQueues, totalMessages, totalQueues }) {
  return (
    <div className="stats-panel">
      <TotalQueuesCard totalQueues={totalQueues} />
      <ActiveQueuesCard activeQueues={activeQueues} />
      <ErrorQueuesCard errorQueues={errorQueues} />
      <TotalMessagesCard totalMessages={totalMessages} />
    </div>
  )
}

export default StatsPanel
