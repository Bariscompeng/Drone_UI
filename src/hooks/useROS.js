import { useEffect, useState, useCallback } from 'react';

// Mock ROS için - gerçek ROS kullanmak isterseniz roslib import edin
// import ROSLIB from 'roslib';

export const useROS = (url = 'ws://localhost:9090') => {
  const [connected, setConnected] = useState(false);
  const [ros, setRos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock mode - gerçek ROS için aşağıdaki yorumları kaldırın
    /*
    const rosInstance = new ROSLIB.Ros({
      url: url
    });

    rosInstance.on('connection', () => {
      console.log('Connected to ROS websocket server.');
      setConnected(true);
      setError(null);
    });

    rosInstance.on('error', (error) => {
      console.log('Error connecting to ROS websocket server:', error);
      setConnected(false);
      setError(error);
    });

    rosInstance.on('close', () => {
      console.log('Connection to ROS websocket server closed.');
      setConnected(false);
    });

    setRos(rosInstance);

    return () => {
      if (rosInstance) {
        rosInstance.close();
      }
    };
    */

    // Mock mode - demo için
    setTimeout(() => {
      setConnected(true);
      setRos({ mock: true });
    }, 1000);

    return () => {};
  }, [url]);

  return { ros, connected, error };
};

export const useROSTopic = (ros, topicName, messageType) => {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!ros || !topicName) return;

    // Mock mode - gerçek ROS için roslib kullanın
    /*
    const topic = new ROSLIB.Topic({
      ros: ros,
      name: topicName,
      messageType: messageType
    });

    topic.subscribe((message) => {
      setData(message);
      setLastUpdate(new Date());
    });

    return () => {
      topic.unsubscribe();
    };
    */

    // Mock data - demo için
    const interval = setInterval(() => {
      const mockData = generateMockData(topicName, messageType);
      setData(mockData);
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [ros, topicName, messageType]);

  return { data, lastUpdate };
};

// Mock data generator
const generateMockData = (topicName, messageType) => {
  if (topicName.includes('gps') || topicName.includes('fix')) {
    return {
      latitude: 39.9334 + (Math.random() - 0.5) * 0.001,
      longitude: 32.8597 + (Math.random() - 0.5) * 0.001,
      altitude: 100 + Math.random() * 10
    };
  }

  if (topicName.includes('imu')) {
    return {
      orientation: {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1,
        w: 0.9 + Math.random() * 0.1
      },
      angular_velocity: {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5
      }
    };
  }

  if (topicName.includes('battery')) {
    return {
      voltage: 11.5 + Math.random() * 1,
      current: 2 + Math.random() * 1,
      percentage: 80 + Math.random() * 10
    };
  }

  if (topicName.includes('cmd_vel') || topicName.includes('odom')) {
    return {
      linear: { x: 10 + Math.random() * 5, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: (Math.random() - 0.5) * 2 }
    };
  }

  return {};
};

export const useROSService = (ros, serviceName, serviceType) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callService = useCallback(async (request) => {
    if (!ros || !serviceName) return null;

    setLoading(true);
    setError(null);

    try {
      // Mock mode
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
      return { success: true, message: 'Service call successful' };

      // Gerçek ROS için:
      /*
      const service = new ROSLIB.Service({
        ros: ros,
        name: serviceName,
        serviceType: serviceType
      });

      return new Promise((resolve, reject) => {
        service.callService(
          new ROSLIB.ServiceRequest(request),
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
      */
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  }, [ros, serviceName, serviceType]);

  return { callService, loading, error };
};
