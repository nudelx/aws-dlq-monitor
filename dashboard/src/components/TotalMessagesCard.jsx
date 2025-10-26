import React from "react"
import StatCard from "./StatCard.jsx"

function TotalMessagesCard({ totalMessages }) {
  return (
    <StatCard
      icon="📨"
      value={totalMessages}
      label="Total Messages"
      variant="messages"
    />
  )
}

export default TotalMessagesCard
