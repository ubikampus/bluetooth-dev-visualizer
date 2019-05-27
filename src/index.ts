import { deserializeMessage, MqttMessage } from './mqttDeserialize';
import { drawScreen } from './screen';
import { drawScreen3d } from './screen3d';

const MQTT_BUS_URL = 'mqtt://localhost:1883';

const generateMockMessage = (beaconHash: string): string => {
  const x = Math.floor((Math.random() * 1024) / 2);
  const y = Math.floor((Math.random() * 768) / 2);
  return JSON.stringify({ beaconHash, x, y });
};

const main = () => {
  // drawScreen(sprite => {
  //   setInterval(() => {
  //     try {
  //       const messageStr = generateMockMessage('beacon-1');
  //       const message = deserializeMessage(messageStr);
  //       console.log('received:', messageStr);
  //
  //       sprite.position.x = message.x;
  //       sprite.position.y = message.y;
  //     } catch (error) {
  //       console.error('Error:', error);
  //     }
  //   }, 2000);
  // });

  drawScreen3d();
};

main();
