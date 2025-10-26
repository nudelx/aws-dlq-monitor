import React from "react"
import StatCard from "./StatCard.jsx"

function ErrorQueuesCard({ errorQueues }) {
  return (
    <StatCard
      icon="❌"
      value={errorQueues}
      label="Error Queues"
      variant="error"
    />
  )
}

export default ErrorQueuesCard
