// src/scenes/rooms/LivingRoom.jsx
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS } from '../../core/constants.jsx';
import livingRoomImg from '../../assets/images/LivingRoom/living_room.png';

export default class LivingRoom extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.LIVING.title,
            subtitle: ROOM_CONFIGS.LIVING.subtitle,
            backgroundImage: livingRoomImg,
            backgroundColor: ROOM_CONFIGS.LIVING.color,
            gradientTop: ROOM_CONFIGS.LIVING.gradientTop,
            gradientBottom: ROOM_CONFIGS.LIVING.gradientBottom,
        });
    }
}
