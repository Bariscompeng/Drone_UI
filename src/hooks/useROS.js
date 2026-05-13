import { useState, useEffect, useCallback } from 'react';
import ROSLIB from 'roslib';

export const useROS = (config = {}) => {
  const {
    url = 'ws://192.168.1.117:9090',
    autoConnect = true,
    reconnectInterval = 3000
  } = config;

  const [ros, setRos] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);

  const connect = useCallback(() => {
    console.log('🔌 Attempting to connect to ROS:', url);
    
    try {
      const rosInstance = new ROSLIB.Ros({
        url: url
      });

      rosInstance.on('connection', () => {
        console.log('✅ Connected to ROS at', url);
        setConnected(true);
        setError(null);
        setReconnecting(false);
      });

      rosInstance.on('error', (error) => {
        console.error('❌ ROS connection error:', error);
        setConnected(false);
        setError(error.toString());
      });

      rosInstance.on('close', () => {
        console.log('🔌 Disconnected from ROS');
        setConnected(false);
        
        if (autoConnect) {
          setReconnecting(true);
          setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
      });

      setRos(rosInstance);
      console.log('📡 ROS instance created:', rosInstance);
    } catch (err) {
      console.error('Failed to create ROS connection:', err);
      setError(err.toString());
    }
  }, [url, autoConnect, reconnectInterval]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (ros) {
        console.log('🔌 Closing ROS connection');
        ros.close();
      }
    };
  }, [autoConnect, connect]);

  return { ros, connected, error, reconnecting, connect };
};

export const useROSTopic = (ros, topicName, messageType, throttleRate = 100, options = {}) => {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const { compression = 'cbor', queueLength = 1, queueSize = 1 } = options;

  useEffect(() => {
    console.log('🎯 useROSTopic called:', { ros: !!ros, topicName, messageType });
    
    if (!ros || !topicName) {
      console.warn('⚠️ Missing ros or topicName:', { ros: !!ros, topicName });
      return;
    }

    console.log('📡 Creating topic subscription:', topicName);
    
    const topic = new ROSLIB.Topic({
      ros: ros,
      name: topicName,
      messageType: messageType,
      throttle_rate: throttleRate,
      queue_length: queueLength,
      queue_size:   queueSize,
      compression:  compression,
    });

    const handleMessage = (message) => {
      setData(message);
      setLastUpdate(new Date());
    };

    topic.subscribe(handleMessage);
    console.log('✅ Subscribed to topic:', topicName);

    return () => {
      console.log('🔌 Unsubscribing from topic:', topicName);
      topic.unsubscribe(handleMessage);
    };
  }, [ros, topicName, messageType, throttleRate, compression, queueLength, queueSize]);

  return { data, lastUpdate };
};

export const useROSService = (ros, serviceName, serviceType) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callService = useCallback((request) => {
    return new Promise((resolve, reject) => {
      if (!ros) {
        reject(new Error('ROS not connected'));
        return;
      }

      setLoading(true);
      setError(null);

      const service = new ROSLIB.Service({
        ros: ros,
        name: serviceName,
        serviceType: serviceType
      });

      const serviceRequest = new ROSLIB.ServiceRequest(request);

      service.callService(serviceRequest, 
        (result) => {
          setLoading(false);
          resolve(result);
        },
        (error) => {
          setLoading(false);
          setError(error);
          reject(error);
        }
      );
    });
  }, [ros, serviceName, serviceType]);

  return { callService, loading, error };
};
