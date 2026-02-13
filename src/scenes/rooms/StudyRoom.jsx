// src/scenes/rooms/StudyRoom.jsx
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS } from '../../core/constants.jsx';
import studyRoomImg from '../../assets/images/StudyRoom/study_room.jpeg';

export default class StudyRoom extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.STUDY.title,
            subtitle: ROOM_CONFIGS.STUDY.subtitle,
            backgroundImage: studyRoomImg,
            backgroundColor: ROOM_CONFIGS.STUDY.color,
            gradientTop: ROOM_CONFIGS.STUDY.gradientTop,
            gradientBottom: ROOM_CONFIGS.STUDY.gradientBottom,
        });
    }
}
