import { Course } from "../entities/Course";
import { StudySession } from "../entities/StudySession";
import { UserTutor } from "../entities/UserTutor";
import { StudySessionState } from "../utils/constants/studySession.constant";
import { cvtWeekDay2Num } from "../utils/constants/weekday.constant";

const dayNum = [1, 2, 3, 4, 5, 6, 0];

export async function createStudySession(course: Course, tutor: UserTutor){
    const openingDate = course.openingDate!;
    const closingDate = course.closingDate !== null? course.closingDate! : course.expectedClosingDate!;

    let week = 1;

    let isEndLoop = false;

    // console.log("START CREATE STUDY SESSION")
    // console.log(`Opening Date: ${openingDate}`);
    // console.log(`Closing Date: ${closingDate}`);
    while (!isEndLoop){
        let dayName = 1;
        for(const schedule of course.schedules){ 
            // console.log("--------------------------------LOOP!----------------------------")
            let studySessionDate = new Date(openingDate);
            let distance = (week - 1) * 7 + (dayNum[cvtWeekDay2Num(schedule.startShift.weekDay) - 2] -  openingDate.getDay());
            studySessionDate.setDate(openingDate.getDate() + distance);
            // console.log(`Study Session Date: ${studySessionDate}`);
            
            if(studySessionDate.getTime() < openingDate.getTime()){
                continue;
            }
                
            if(studySessionDate.getTime() > closingDate.getTime()){
                isEndLoop = true;
                break;
            }
            
            //=============================================================================
            // console.log("START CREATE STUDY SESSION OFFICIAL");
            const studySession = new StudySession();
            studySession.name = `Tuần ${week}, Buổi ${dayName}`;
            studySession.date = studySessionDate;
            studySession.isTeacherAbsent = false;
            studySession.notes = "Teacher Note";
            if(studySessionDate.getTime() > (new Date).getTime())
                studySession.state = StudySessionState.Ready;
            else
                studySession.state = StudySessionState.Finish;
            
            studySession.isSystemCreated = true;
            studySession.lecture = course.curriculum.lectures[0];
            studySession.course = course;
            studySession.shifts = [schedule.startShift, schedule.endShift];
            studySession.tutor = tutor;
            studySession.teacher = course.teacher;
            studySession.classroom = schedule.classroom;
            
            await StudySession.save(studySession);
            dayName++;
        }
        week++;
    }

    
}