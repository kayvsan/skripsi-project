import { useState, useEffect } from 'react';
import mqtt from 'mqtt';

const MQTT_URL = import.meta.env.VITE_MQTT_URL || `ws://${window.location.hostname}:9001`; // Websocket port of Mosquitto

export const useMqtt = () => {
  const [client, setClient] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [pumpStatus, setPumpStatus] = useState({ pump: 'OFF', duration_percent: 0 });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_URL);

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT via WebSockets');
      setIsConnected(true);
      mqttClient.subscribe('chili/sensors/data');
      mqttClient.subscribe('chili/pump/status');
    });

    mqttClient.on('message', (topic, message) => {
      const payload = JSON.parse(message.toString());
      
      if (topic === 'chili/sensors/data') {
        setLiveData({
          ...payload,
          time: new Date().toLocaleTimeString('id-ID', { hour12: false })
        });
      } else if (topic === 'chili/pump/status') {
        setPumpStatus(payload);
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
      setIsConnected(false);
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  return { isConnected, liveData, pumpStatus };
};
