import mqtt from "mqtt"
import { createContext, useContext, useEffect, useState } from "react"
import { json } from "react-router-dom"

// Create a context for MQTT
const MqttContext = createContext()

export const MqttProvider = ({ children }) => {
  const [client, setClient] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [guestUserId, setGuestUserId] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [session, setSession] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSessionEnded, setIsSessionEnded] = useState(false)
  const lastWeightComparisonData = sessionStorage.getItem("physicalWeight") || 0
  console.log("last physical wiegh tis ", lastWeightComparisonData)
  const [weightComparisonResult, setWeightComparisonResult] = useState(
    JSON.parse(lastWeightComparisonData)
  )
  const [trolleyStatus, setTrolleyStatus] = useState(null)
  let userId

  // Function to connect to the MQTT broker
  const connect = () => {
    if (client) return
    console.log("connecting mqtt")
    const mqttClient = mqtt.connect("wss://trolley.searchintech.in/mqtt/", {
      will: {
        topic: "server/weightComparisonResult",
        payload: JSON.stringify({ alertLight: "disconnected" }),
        qos: 1,
        retain: false,
        reconnectPeriod: 0,
      },
    })

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker")
      mqttClient.publish(
        "server/weightComparisonResult",
        JSON.stringify({ alertLight: "connected" })
      )
      setIsConnected(true)

      // Subscribe to topics when connected
      subscribeToTopics(mqttClient)
    })

    mqttClient.on("error", (err) => {
      console.error("MQTT Connection error:", err)
      setIsConnected(false)
      const token = localStorage.getItem("accessToken")
      if (token) {
        console.log("token is present reconnecting ")
        setTimeout(() => {
          console.log("Attempting to reconnect...")
          connect()
        }, 5000)
      }
      console.log("not ")
    })

    mqttClient.on("disconnect", () => {
      console.log("Disconnected from MQTT broker")
      setIsConnected(false)
    })

    mqttClient.on("message", (topic, message) => {
      handleIncomingMessage(topic, message)
    })

    setClient(mqttClient)
  }

  // Function to subscribe to predefined topics
  const subscribeToTopics = (mqttClient) => {
    if (mqttClient) {
      mqttClient.subscribe(`server/userJoined`, (err) => {
        if (err) {
          console.error("Subscribe error:", err)
        } else {
          console.log(`Subscribed to server/userJoined`)
        }
      })

      mqttClient.subscribe("trolley/status", (err) => {
        if (err) {
          console.error("Subscribe error:", err)
        } else {
          console.log("Subscribed to  trolley/status")
        }
      })

      mqttClient.subscribe("server/weightComparisonResult", (err) => {
        if (err) {
          console.error("Subscribe error:", err)
        } else {
          console.log("Subscribed to server/weightComparisonResult")
        }
      })

      // mqttClient.subscribe("guestUser/endSession", (err) => {
      //   if (err) {
      //     console.error("Subscribe error:", err);
      //   } else {
      //     console.log("Subscribed to guestUser/endSession");
      //   }
      // });
    }
  }

  // Function to handle incoming MQTT messages
  const handleIncomingMessage = (topic, message) => {
    console.log(`Message received on topic ${topic}: ${message.toString()}`)

    // Process messages based on topic
    switch (topic) {
      case `server/userJoined`:
        const session = JSON.parse(message.toString())
        console.log("Join Session Data:", session)
        localStorage.setItem("session", session?._id)
        setSession(session)
        break
      case "server/weightComparisonResult":
        const weightData = JSON.parse(message.toString())
        console.log("Virtual Cart Weight Data:", weightData)
        if (weightData?.trolley?.physicalWeight) {
          console.log("setting", weightData?.trolley?.physicalWeight)
          setWeightComparisonResult(weightData)
          sessionStorage.setItem("physicalWeight", JSON.stringify(weightData))
        }

        break
        // case "guestUser/endSession":
        const endSessionData = JSON.parse(message.toString())
        console.log("End Session Data:", endSessionData)
        // Handle end session data
        break
      case `trolley/status`:
        const trolleyData = JSON.parse(message.toString())
        console.log("Trolley status is :", trolleyData)
        const trolleyStatus = trolleyData?.trolleyStatus
        setTrolleyStatus(trolleyStatus)
        break
      default:
        console.log("Unknown topic:", topic)
    }
  }

  // Function to disconnect from the MQTT broker
  const disconnect = () => {
    if (client) {
      client.end()
      setClient(null)
      setIsConnected(false)
    }
  }

  // Function to publish a message to a topic
  const publish = (topic, message) => {
    // if (!client) {
    //   connect();
    //   client.publish(topic, JSON.stringify(message)); // Convert object to JSON string
    //   console.log("published from function ", topic, message);
    // }

    if (client) {
      client.publish(topic, JSON.stringify(message)) // Convert object to JSON string
      console.log("published from function ", topic, message)
    } else {
      console.log("publishing connect")
      connect()
      if (!client) {
        console.error("MQTT client not connected")
      }
    }
  }

  const joinUserSession = () => {
    publish("guestUser/joinSession", {
      guestUserId: guestUserId,
      qrCode: qrCode,
    })
  }

  const updateVirtualCartWeight = (virtualWeight) => {
    publish("guestUser/updateVirtualCartWeight", {
      virtualWeight: virtualWeight,
    })
    console.log("vw and tid", virtualWeight)
  }

  const endUserSession = () => {
    publish("guestUser/endSession", { sessionId: session._id })
  }

  useEffect(() => {
    if (isConnected) {
      userId = localStorage.getItem("user")
    }
  }, [isConnected])

  // useEffect(() => {
  //   const handleOnline = () => {
  //     setIsOnline(true);
  //     if (client.connected) {
  //       console.log("web app  reconected");
  //       publish("guestuser/status", { alertLight: "reconnected" });
  //     }
  //   };

  //   const handleOffline = () => {
  //     setIsOnline(false);
  //     if (client.connected) {
  //       console.log("disconnected due to connectivity");
  //       publish("guestuser/status", {
  //         alertLight: "disconnected",
  //       });
  //     }
  //   };

  //   window.addEventListener("online", handleOnline);
  //   window.addEventListener("offline", handleOffline);

  //   // Initial status publish
  //   // if (client.connected) {
  //   //   client.publish(TOPIC, isOnline ? 'reconnected' : 'disconnected');
  //   // }

  //   // Cleanup event listeners on unmount
  //   return () => {
  //     window.removeEventListener("online", handleOnline);
  //     window.removeEventListener("offline", handleOffline);
  //   };
  // }, [client, isOnline]);

  useEffect(() => {
    const trolley = localStorage.getItem("trolley")
    const token = localStorage.getItem("accessToken")
    if (!isConnected && !isSessionEnded && trolley && token) {
      // If not connected, attempt to reconnect
      const token = localStorage.getItem("accessToken")
      if (token) {
        console.log("isSessionEnded value ", isSessionEnded)
        console.log("reconnecting ")
        connect()
      }
    }
  }, [isConnected])

  console.log("mqtt connected status ", isConnected)

  const value = {
    client,
    isConnected,
    isSessionEnded,
    weightComparisonResult,
    trolleyStatus,
    connect,
    disconnect,
    publish,
    joinUserSession,
    updateVirtualCartWeight,
    endUserSession,
    setGuestUserId,
    setQrCode,
    setSession,
    setIsSessionEnded,
  }

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>
}

// Custom hook to use MQTT context
export const useMqtt = () => {
  return useContext(MqttContext)
}
