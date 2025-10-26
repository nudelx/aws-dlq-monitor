import React, { useState, useEffect } from "react"
import "./App.css"
import DLQCard from "./components/DLQCard.jsx"
import Header from "./components/Header.jsx"
import StatsPanel from "./components/StatsPanel.jsx"
import Loading from "./components/Loading.jsx"
import Error from "./components/Error.jsx"
import { dlqNames } from "@aws-dlq-monitor/config/dlq-names.js"
import { useFirebase } from "./hooks/useFirebase.js"
import AllGood from "./components/AllGood.jsx"

function App() {
  const [showOnlyWithMessages, setShowOnlyWithMessages] = useState(true)
  const [DLQ_NAMES, setDLQ_NAMES] = useState([])

  const { dlqData, loading, error, lastUpdated, fetchDLQData } = useFirebase()

  useEffect(() => {
    setDLQ_NAMES(dlqNames)
  }, [])

  const activeQueues = dlqData.filter(queue => queue.status === "ACTIVE")
  const errorQueues = dlqData.filter(queue => queue.status !== "ACTIVE")
  const totalMessages = activeQueues.reduce(
    (sum, queue) =>
      sum + parseInt(queue.attributes?.approximateNumberOfMessages || "0"),
    0
  )

  const filteredQueues = showOnlyWithMessages
    ? dlqData.filter(
        queue =>
          queue.status === "ACTIVE" &&
          parseInt(queue.attributes?.approximateNumberOfMessages || "0") > 0
      )
    : dlqData

  const toggleFilter = () => {
    setShowOnlyWithMessages(!showOnlyWithMessages)
  }

  return (
    <div className="App">
      <Header
        onRefresh={fetchDLQData}
        lastUpdated={lastUpdated}
        showOnlyWithMessages={showOnlyWithMessages}
        onToggleFilter={toggleFilter}
      />

      <div className="container">
        <StatsPanel
          activeQueues={
            showOnlyWithMessages
              ? filteredQueues.filter(q => q.status === "ACTIVE").length
              : activeQueues.length || 0
          }
          errorQueues={
            showOnlyWithMessages
              ? filteredQueues.filter(q => q.status !== "ACTIVE").length
              : errorQueues.length || 0
          }
          totalMessages={
            showOnlyWithMessages
              ? filteredQueues.reduce(
                  (sum, queue) =>
                    sum +
                    parseInt(
                      queue.attributes?.approximateNumberOfMessages || "0"
                    ),
                  0
                )
              : totalMessages || 0
          }
          totalQueues={
            showOnlyWithMessages ? filteredQueues.length : DLQ_NAMES.length || 0
          }
        />

        <div className="content">
          {loading && <Loading />}

          {error && <Error error={error} onRetry={fetchDLQData} />}
          {!loading && !error && (
            <div className="dlq-grid">
              {filteredQueues.length ? (
                filteredQueues.map((queue, index) => (
                  <DLQCard key={index} queue={queue} />
                ))
              ) : (
                <AllGood />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
