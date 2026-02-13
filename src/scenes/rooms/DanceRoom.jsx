// src/scenes/rooms/DanceRoom.jsx
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS } from '../../core/constants.jsx';
import danceRoomImg from '../../assets/images/DanceRoom/dance_room.jpeg';

export default class DanceRoom extends BaseRoom {
  constructor(manager) {
    super(manager, {
      title: ROOM_CONFIGS.DANCE.title,
      subtitle: ROOM_CONFIGS.DANCE.subtitle,
      backgroundImage: danceRoomImg,
      backgroundColor: ROOM_CONFIGS.DANCE.color,
      gradientTop: ROOM_CONFIGS.DANCE.gradientTop,
      gradientBottom: ROOM_CONFIGS.DANCE.gradientBottom,
    });
  }
}
