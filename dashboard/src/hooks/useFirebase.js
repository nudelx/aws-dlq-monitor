import { useState, useEffect } from "react"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, get, onValue } from "firebase/database"
import { firebaseConfig } from "@aws-dlq-monitor/config/firebase-config.js"

export const useFirebase = () => {
  const [dlqData, setDlqData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [database, setDatabase] = useState(null)

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig)
      const db = getDatabase(app)
      setDatabase(db)
      console.log("✅ Firebase Realtime Database initialized")
    } catch (error) {
      console.error("❌ Error initializing Firebase:", error)
      setError("Failed to initialize Firebase")
    }
  }, [])

  const fetchDLQData = async () => {
    if (!database) {
      setError("Firebase not initialized")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const dbRef = ref(database, "dlq-monitoring/latest")
      const snapshot = await get(dbRef)

      if (snapshot.exists()) {
        const data = snapshot.val()

        if (data && data.results) {
          setDlqData(data.results)
          setLastUpdated(new Date(data.localTimestamp))
        } else {
          setError("No valid DLQ data found in Firebase")
        }
      } else {
        setError("No data found in Firebase")
      }
    } catch (err) {
      setError("Failed to fetch DLQ data from Firebase")
      console.error("Error fetching DLQ data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!database) return

    setLoading(true)
    setError(null)

    const dbRef = ref(database, "dlq-monitoring/latest")

    const unsubscribe = onValue(
      dbRef,
      snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val()

          if (data && data.results) {
            setDlqData(data.results)
            setLastUpdated(new Date(data.localTimestamp))
            setError(null)
          } else {
            setError("No valid DLQ data found in Firebase")
          }
        } else {
          setError("No data found in Firebase")
        }
        setLoading(false)
      },
      error => {
        console.error("Firebase listener error:", error)
        setError("Failed to connect to Firebase")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [database])

  return {
    dlqData,
    loading,
    error,
    lastUpdated,
    fetchDLQData,
  }
}
