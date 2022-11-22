import moment = require("moment");
import { StudySession } from "../../entities/StudySession";
import { StudySessionState } from "../constants/studySessionState.constant";

export function getStudySessionState(studySession: StudySession): StudySessionState {
    const currentDate = moment().toDate();
    const studySessionDate = moment(studySession.date).toDate();
  
    if (!studySession.shifts || studySession.shifts.length === 0) {
      if (currentDate.getDate() === studySessionDate.getDate() &&
        currentDate.getMonth() === studySessionDate.getMonth() &&
        currentDate.getFullYear() === studySessionDate.getFullYear()) {
        return StudySessionState.Start;
      }
      if (moment(currentDate).diff(moment(studySessionDate)) < 0)
        return StudySessionState.Ready;
      else return StudySessionState.Finish;
    }
    
    if (currentDate.getDate() === studySessionDate.getDate() &&
      currentDate.getMonth() === studySessionDate.getMonth() &&
      currentDate.getFullYear() === studySessionDate.getFullYear()) {
      const startTime = moment(studySession.shifts[0].startTime).toDate();
      const endTime = moment(studySession.shifts[studySession.shifts.length - 1].endTime).toDate();
  
      startTime.setDate(currentDate.getDate());
      startTime.setMonth(currentDate.getMonth());
      startTime.setFullYear(currentDate.getFullYear());
      endTime.setDate(currentDate.getDate());
      endTime.setMonth(currentDate.getMonth());
      endTime.setFullYear(currentDate.getFullYear());
  
      if (startTime.getTime() > currentDate.getTime())
        return StudySessionState.Ready;
      else if (endTime.getTime() < currentDate.getTime())
        return StudySessionState.Finish;
      else return StudySessionState.Start;
    }
  
    if (moment(currentDate).diff(moment(studySessionDate)) < 0)
      return StudySessionState.Ready;
    else return StudySessionState.Finish;
  }