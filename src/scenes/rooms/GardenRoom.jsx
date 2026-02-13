// src/scenes/rooms/GardenRoom.jsx
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS } from '../../core/constants.jsx';
import gardenImg from '../../assets/images/garden.jpeg';

export default class GardenRoom extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.GARDEN.title,
            subtitle: ROOM_CONFIGS.GARDEN.subtitle,
            backgroundImage: gardenImg,
            backgroundColor: ROOM_CONFIGS.GARDEN.color,
            gradientTop: ROOM_CONFIGS.GARDEN.gradientTop,
            gradientBottom: ROOM_CONFIGS.GARDEN.gradientBottom,
        });
    }
}
