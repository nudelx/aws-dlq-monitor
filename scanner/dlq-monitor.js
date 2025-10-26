import { fromIni } from "@aws-sdk/credential-provider-ini"
import {
  SQSClient,
  GetQueueAttributesCommand,
  ListQueuesCommand,
} from "@aws-sdk/client-sqs"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, set, serverTimestamp } from "firebase/database"
import dotenv from "dotenv"
import { dlqNames as DLQ_NAMES } from "@aws-dlq-monitor/config/dlq-names.js"

dotenv.config()

import { firebaseConfig } from "@aws-dlq-monitor/config/firebase-config.js"

let firebaseApp = null
let database = null

function initializeFirebase() {
  if (!firebaseApp) {
    try {
      firebaseApp = initializeApp(firebaseConfig)
      database = getDatabase(firebaseApp)
      console.log("✅ Firebase Realtime Database initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Firebase:", error.message)
      return false
    }
  }
  return true
}

const AWS_REGION = process.env.AWS_REGION || "eu-west-1"

function createSQSClient() {
  return new SQSClient({
    region: AWS_REGION,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? undefined
        : fromIni({ profile: "default" }),
  })
}

async function getQueueUrl(sqsClient, queueName) {
  try {
    const command = new ListQueuesCommand({
      QueueNamePrefix: queueName,
    })
    const response = await sqsClient.send(command)

    if (response.QueueUrls && response.QueueUrls.length > 0) {
      return response.QueueUrls.find(url => url.includes(queueName))
    }
    return null
  } catch (error) {
    console.error(`Error getting queue URL for ${queueName}:`, error.message)
    return null
  }
}

async function getQueueAttributes(sqsClient, queueUrl) {
  try {
    const command = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: [
        "ApproximateNumberOfMessages",
        "ApproximateNumberOfMessagesNotVisible",
        "ApproximateNumberOfMessagesDelayed",
        "CreatedTimestamp",
        "LastModifiedTimestamp",
        "QueueArn",
      ],
    })

    const response = await sqsClient.send(command)
    return response.Attributes
  } catch (error) {
    console.error(
      `Error getting attributes for queue ${queueUrl}:`,
      error.message
    )
    return null
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "N/A"
  return new Date(parseInt(timestamp) * 1000).toISOString()
}

async function getDLQStatus(sqsClient, queueName) {
  const queueUrl = await getQueueUrl(sqsClient, queueName)

  if (!queueUrl) {
    return {
      queueName,
      status: "NOT_FOUND",
      message: `Queue '${queueName}' not found`,
    }
  }

  const attributes = await getQueueAttributes(sqsClient, queueUrl)

  if (!attributes) {
    return {
      queueName,
      status: "ERROR",
      message: "Failed to retrieve queue attributes",
    }
  }

  return {
    queueName,
    status: "ACTIVE",
    queueUrl,
    attributes: {
      approximateNumberOfMessages:
        attributes.ApproximateNumberOfMessages || "0",
      approximateNumberOfMessagesNotVisible:
        attributes.ApproximateNumberOfMessagesNotVisible || "0",
      approximateNumberOfMessagesDelayed:
        attributes.ApproximateNumberOfMessagesDelayed || "0",
      createdTimestamp: formatTimestamp(attributes.CreatedTimestamp),
      lastModifiedTimestamp: formatTimestamp(attributes.LastModifiedTimestamp),
      queueArn: attributes.QueueArn,
    },
  }
}

async function monitorAllDLQs(sqsClient, dlqNames) {
  console.log("🔍 Monitoring AWS Dead Letter Queues...\n")

  const results = await dlqNames.reduce(async (promiseAcc, dlqName) => {
    const acc = await promiseAcc
    console.log(`📋 Checking DLQ: ${dlqName}`)
    const status = await getDLQStatus(sqsClient, dlqName)

    if (status.status === "ACTIVE") {
      console.log(
        `✅ ${dlqName}: ${status.attributes.approximateNumberOfMessages} messages`
      )
      console.log(
        `   - Not visible: ${status.attributes.approximateNumberOfMessagesNotVisible}`
      )
      console.log(
        `   - Delayed: ${status.attributes.approximateNumberOfMessagesDelayed}`
      )
      console.log(`   - Created: ${status.attributes.createdTimestamp}`)
      console.log(`   - Modified: ${status.attributes.lastModifiedTimestamp}`)
    } else {
      console.log(`❌ ${dlqName}: ${status.message}`)
    }
    console.log("")

    return [...acc, status]
  }, Promise.resolve([]))

  return results
}

function generateReport(results) {
  console.log("📊 DLQ Status Report")
  console.log("====================\n")

  const activeQueues = results.filter(r => r.status === "ACTIVE")
  const errorQueues = results.filter(r => r.status !== "ACTIVE")

  console.log(`✅ Active Queues: ${activeQueues.length}`)
  console.log(`❌ Error/Not Found: ${errorQueues.length}\n`)

  if (activeQueues.length > 0) {
    console.log("Active DLQs:")
    activeQueues.forEach(queue => {
      const msgCount = parseInt(queue.attributes.approximateNumberOfMessages)
      const status = msgCount > 0 ? "⚠️  HAS MESSAGES" : "✅ EMPTY"
      console.log(`  - ${queue.queueName}: ${msgCount} messages ${status}`)
    })
  }

  if (errorQueues.length > 0) {
    console.log("\nQueues with Issues:")
    errorQueues.forEach(queue => {
      console.log(`  - ${queue.queueName}: ${queue.message}`)
    })
  }
}

async function storeResultsInFirebase(results, options = {}) {
  if (!database) {
    console.error("❌ Firebase not initialized")
    return false
  }

  try {
    const timestamp = new Date()
    const dataToStore = {
      timestamp: serverTimestamp(),
      localTimestamp: timestamp.toISOString(),
      totalQueues: results.length,
      activeQueues: results.filter(r => r.status === "ACTIVE").length,
      errorQueues: results.filter(r => r.status !== "ACTIVE").length,
      results: results,
      summary: {
        queuesWithMessages: results.filter(
          r =>
            r.status === "ACTIVE" &&
            parseInt(r.attributes?.approximateNumberOfMessages || "0") > 0
        ).length,
        totalMessages: results.reduce(
          (sum, r) =>
            sum + parseInt(r.attributes?.approximateNumberOfMessages || "0"),
          0
        ),
        totalNotVisible: results.reduce(
          (sum, r) =>
            sum +
            parseInt(
              r.attributes?.approximateNumberOfMessagesNotVisible || "0"
            ),
          0
        ),
        totalDelayed: results.reduce(
          (sum, r) =>
            sum +
            parseInt(r.attributes?.approximateNumberOfMessagesDelayed || "0"),
          0
        ),
      },
      metadata: {
        region: AWS_REGION,
        dlqNames: DLQ_NAMES,
        ...options,
      },
    }

    const dbRef = ref(database, "dlq-monitoring/latest")
    await set(dbRef, dataToStore)
    console.log(
      `✅ Results stored in Firebase Realtime Database with key: latest`
    )
    return "latest"
  } catch (error) {
    console.error("❌ Error storing results in Firebase:", error.message)
    return false
  }
}

function validateEnvironment() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error(
      "❌ Error: AWS credentials not found in environment variables"
    )
    console.log("Please set the following environment variables:")
    console.log("  - AWS_ACCESS_KEY_ID")
    console.log("  - AWS_SECRET_ACCESS_KEY")
    console.log("  - AWS_REGION (optional, defaults to eu-west-1)")
    console.log("\nYou can create a .env file with these variables.")
    console.log(
      "\nAlternatively, ensure your AWS credentials file (~/.aws/credentials) has valid credentials."
    )
    return false
  }
  return true
}

async function main() {
  const args = process.argv.slice(2)
  const shouldStoreInFirebase =
    args.includes("--firebase") || args.includes("-f")
  const helpRequested = args.includes("--help") || args.includes("-h")

  if (helpRequested) {
    console.log("AWS DLQ Monitor")
    console.log("===============")
    console.log("Usage: node dlq-monitor.js [options]")
    console.log("")
    console.log("Options:")
    console.log("  --firebase, -f    Store results in Firebase Firestore")
    console.log("  --help, -h        Show this help message")
    console.log("")
    console.log("Environment Variables:")
    console.log("  AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION")
    console.log("  Firebase config (in .env file):")
    console.log("    apiKey, authDomain, projectId, storageBucket")
    console.log("    messagingSenderId, appId, databaseURL, measurementId")
    return
  }

  const sqsClient = createSQSClient()

  if (shouldStoreInFirebase) {
    if (!initializeFirebase()) {
      console.error("❌ Failed to initialize Firebase. Exiting...")
      process.exit(1)
    }
  }

  try {
    const results = await monitorAllDLQs(sqsClient, DLQ_NAMES)
    generateReport(results)

    if (shouldStoreInFirebase) {
      console.log("\n📊 Storing results in Firebase...")
      const docId = await storeResultsInFirebase(results, {
        source: "cli",
        command: process.argv.join(" "),
      })
      if (docId) {
        console.log(`✅ Monitoring results stored successfully!`)
      }
    }

    console.log("\n🏁 Monitoring completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error monitoring DLQs:", error.message)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export {
  createSQSClient,
  getQueueUrl,
  getQueueAttributes,
  getDLQStatus,
  monitorAllDLQs,
  generateReport,
  validateEnvironment,
  initializeFirebase,
  storeResultsInFirebase,
}
