import React from "react"
import StatCard from "./StatCard.jsx"

function TotalQueuesCard({ totalQueues }) {
  return (
    <StatCard
      icon="📊"
      value={totalQueues}
      label="Total Queues"
      variant="default"
    />
  )
}

export default TotalQueuesCard
