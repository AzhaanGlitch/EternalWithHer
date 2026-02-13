// src/scenes/rooms/GamingRoom.jsx
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS } from '../../core/constants.jsx';
import gamingRoomImg from '../../assets/images/GamingRoom/gaming_room.png';

export default class GamingRoom extends BaseRoom {
  constructor(manager) {
    super(manager, {
      title: ROOM_CONFIGS.GAMING.title,
      subtitle: ROOM_CONFIGS.GAMING.subtitle,
      backgroundImage: gamingRoomImg,
      backgroundColor: ROOM_CONFIGS.GAMING.color,
      gradientTop: ROOM_CONFIGS.GAMING.gradientTop,
      gradientBottom: ROOM_CONFIGS.GAMING.gradientBottom,
    });
  }
}
