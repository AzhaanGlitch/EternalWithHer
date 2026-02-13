// src/scenes/rooms/KitchenRoom.jsx
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS } from '../../core/constants.jsx';
import kitchenImg from '../../assets/images/kitchen.png';

export default class KitchenRoom extends BaseRoom {
  constructor(manager) {
    super(manager, {
      title: ROOM_CONFIGS.KITCHEN.title,
      subtitle: ROOM_CONFIGS.KITCHEN.subtitle,
      backgroundImage: kitchenImg,
      backgroundColor: ROOM_CONFIGS.KITCHEN.color,
      gradientTop: ROOM_CONFIGS.KITCHEN.gradientTop,
      gradientBottom: ROOM_CONFIGS.KITCHEN.gradientBottom,
    });
  }
}
