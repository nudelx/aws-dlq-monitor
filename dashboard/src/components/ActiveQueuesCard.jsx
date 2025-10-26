import React from "react"
import StatCard from "./StatCard.jsx"

function ActiveQueuesCard({ activeQueues }) {
  return (
    <StatCard
      icon="✅"
      value={activeQueues}
      label="Active Queues"
      variant="active"
    />
  )
}

export default ActiveQueuesCard
