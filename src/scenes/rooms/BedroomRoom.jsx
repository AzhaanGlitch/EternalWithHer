// src/scenes/rooms/BedroomRoom.jsx
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS } from '../../core/constants.jsx';
import bedroomImg from '../../assets/images/bedroom.png';

export default class BedroomRoom extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.BEDROOM.title,
            subtitle: ROOM_CONFIGS.BEDROOM.subtitle,
            backgroundImage: bedroomImg,
            backgroundColor: ROOM_CONFIGS.BEDROOM.color,
            gradientTop: ROOM_CONFIGS.BEDROOM.gradientTop,
            gradientBottom: ROOM_CONFIGS.BEDROOM.gradientBottom,
        });
    }
}
