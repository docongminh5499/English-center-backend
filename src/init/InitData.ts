import * as bcrypt from "bcryptjs";

import { Account } from "../entities/Account";
import { Branch } from "../entities/Branch";
import { Classroom } from "../entities/Classroom";
import { Course } from "../entities/Course";
import { Curriculum } from "../entities/Curriculum";
import { Lecture } from "../entities/Lecture"
import { Schedule } from "../entities/Schedule";
import { Shift } from "../entities/Shift";
import { StudentParticipateCourse } from "../entities/StudentParticipateCourse";
import { UserEmployee } from "../entities/UserEmployee";
import { User } from "../entities/UserEntity";
import { UserStudent } from "../entities/UserStudent";
import { UserTeacher } from "../entities/UserTeacher";
import { UserTutor } from "../entities/UserTutor";
import { Worker } from "../entities/Worker";
import ShiftRepository from "../repositories/shift/shift.repository.impl";
import { AccountRole, UserRole } from "../utils/constants/role.constant";
import { Sex } from "../utils/constants/sex.constant";
import { TermCourse } from "../utils/constants/termCuorse.constant";
import { cvtWeekDay2Num, Weekday } from "../utils/constants/weekday.constant";

export async function initData() {

    console.log("----------------------Starting init data----------------------");

    // Create Branch
    var branch1 = await Branch.save(Branch.create({
        phoneNumber: "1111111111",
        address: "Q1, TP. HCM",
        name: "Trung tâm anh ngữ cơ sở 1",
    }));

    // Create Classroom
    var classroomA = new Classroom();
    classroomA.name = "A",
    classroomA.branch = branch1;
    classroomA.function = "Phòng học";
    classroomA.capacity = 100
    await Classroom.save(classroomA);

    var classroomB = new Classroom();
    classroomB.name = "B",
    classroomB.branch = branch1;
    classroomB.function = "Phòng học";
    classroomB.capacity = 100
    await Classroom.save(classroomB);

    var classroomC = new Classroom();
    classroomC.name = "C",
    classroomC.branch = branch1;
    classroomC.function = "Phòng học";
    classroomC.capacity = 100
    await Classroom.save(classroomC);

    var classroomD = new Classroom();
    classroomD.name = "D",
    classroomD.branch = branch1;
    classroomD.function = "Phòng học";
    classroomD.capacity = 100
    await Classroom.save(classroomD);

    // Create Teacher
    var userMinh = new User();

    userMinh.id = 2000001;
    userMinh.email = "meozzz123@gmail.com";
    userMinh.fullName = "Do Cong Minh";
    userMinh.phone = "9999999999";
    userMinh.dateOfBirth = new Date(1990, 4, 5);
    userMinh.sex = Sex.MALE;
    userMinh.address = "Đồng Nai";
    userMinh.role = UserRole.TEACHER;
    userMinh.avatar = "/assets/images/avatar/teacher.jpg";

    var workerMinh = new Worker();
    workerMinh.user = userMinh;
    workerMinh.startDate = new Date(2021, 6, 1);
    workerMinh.coefficients = 90;
    workerMinh.nation = "Kinh";
    workerMinh.passport = "11111111";
    workerMinh.homeTown = "Tp. HCM";
    workerMinh.branch = branch1;

    var teacherMinh = new UserTeacher();
    teacherMinh.worker = workerMinh;
    teacherMinh.experience = "experience";
    teacherMinh.shortDesc = "shortDesc";

    await User.save(userMinh);
    await Worker.save(workerMinh);
    await UserTeacher.save(teacherMinh);
    // //Create Account for UserTeacher
    const hashTeacherPW = bcrypt.hashSync("doremon123", 10);
    await Account.save(Account.create({
        username: "minh5499",
        password: hashTeacherPW,
        role: AccountRole.TEACHER,
        user: userMinh,
    }));

    // Create Teacher 2
    var userTeacher2 = new User();

    userTeacher2.id = 2000002;
    userTeacher2.email = "teacher2@gmail.com";
    userTeacher2.fullName = "Mike Do";
    userTeacher2.phone = "9999999999";
    userTeacher2.dateOfBirth = new Date(1990, 4, 5);
    userTeacher2.sex = Sex.MALE;
    userTeacher2.address = "Đồng Nai";
    userTeacher2.role = UserRole.TEACHER;
    userTeacher2.avatar = "/assets/images/avatar/teacher.jpg";

    var workerTeacher2 = new Worker();
    workerTeacher2.user = userTeacher2;
    workerTeacher2.startDate = new Date(2021, 6, 1);
    workerTeacher2.coefficients = 90;
    workerTeacher2.nation = "Kinh";
    workerTeacher2.passport = "22222222";
    workerTeacher2.homeTown = "Tp. HCM";
    workerTeacher2.branch = branch1;

    var teacher2 = new UserTeacher();
    teacher2.worker = workerTeacher2;
    teacher2.experience = "experience";
    teacher2.shortDesc = "shortDesc";

    await User.save(userTeacher2);
    await Worker.save(workerTeacher2);
    await UserTeacher.save(teacher2);
    // //Create Account for UserTeacher
    const hashTeacherPW2 = bcrypt.hashSync("minh2", 10);
    await Account.save(Account.create({
        username: "minh2",
        password: hashTeacherPW2,
        role: AccountRole.TEACHER,
        user: userTeacher2,
    }));

    // Create Tutor
    var userTutor1 = new User();

    userTutor1.id = 2000001;
    userTutor1.email = "meozzz@gmail.com";
    userTutor1.fullName = "Do Cong Minh";
    userTutor1.phone = "9999999999";
    userTutor1.dateOfBirth = new Date(1990, 4, 5);
    userTutor1.sex = Sex.MALE;
    userTutor1.address = "Đồng Nai";
    userTutor1.role = UserRole.TEACHER;
    userTutor1.avatar = "/assets/images/avatar/teacher.jpg";

    var workerTutor1 = new Worker();
    workerTutor1.user = userTutor1;
    workerTutor1.startDate = new Date(2021, 6, 1);
    workerTutor1.coefficients = 90;
    workerTutor1.nation = "Kinh";
    workerTutor1.passport = "11111111";
    workerTutor1.homeTown = "Tp. HCM";
    workerTutor1.branch = branch1;

    var tutor1 = new UserTutor();
    tutor1.worker = workerTutor1;

    await User.save(userTutor1);
    await Worker.save(workerTutor1);
    await UserTutor.save(tutor1);
    // //Create Account for UserTeacher
    const hashTutor = bcrypt.hashSync("doremon123", 10);
    await Account.save(Account.create({
        username: "minh5499",
        password: hashTutor,
        role: AccountRole.TUTOR,
        user: userTutor1,
    }));

     // Create employee
     var userEmployee1 = new User();

     userEmployee1.id = 3000001;
     userEmployee1.email = "employee@gmail.com";
     userEmployee1.fullName = "Leonard";
     userEmployee1.phone = "9999999999";
     userEmployee1.dateOfBirth = new Date(1990, 4, 5);
     userEmployee1.sex = Sex.MALE;
     userEmployee1.address = "Đồng Nai";
     userEmployee1.role = UserRole.EMPLOYEE;
     userEmployee1.avatar = "";
 
     var workerEmployee1 = new Worker();
     workerEmployee1.user = userEmployee1;
     workerEmployee1.startDate = new Date(2021, 6, 1);
     workerEmployee1.coefficients = 90;
     workerEmployee1.nation = "Kinh";
     workerEmployee1.passport = "333333333";
     workerEmployee1.homeTown = "Tp. HCM";
     workerEmployee1.branch = branch1;
 
     var employee1 = new UserEmployee();
     employee1.worker = workerEmployee1;
 
     await User.save(userEmployee1);
     await Worker.save(workerEmployee1);
     await UserEmployee.save(employee1);
     //Create Account for User Employee
     const hashEmployeePW1 = bcrypt.hashSync("minh3", 10);
     await Account.save(Account.create({
         username: "minh3",
         password: hashEmployeePW1,
         role: AccountRole.EMPLOYEE,
         user: userEmployee1,
     }));

    //Create Student 1
    var userSttudent1 = new User();

    userSttudent1.id = 1000001;
    userSttudent1.email = "hocdoan1@gmail.com";
    userSttudent1.fullName = "Doan Hoc";
    userSttudent1.phone = "1111111111";
    userSttudent1.dateOfBirth = new Date(1999, 6, 12);
    userSttudent1.sex = Sex.MALE;
    userSttudent1.address = "Đồng Nai";
    userSttudent1.role = UserRole.STUDENT;
    userSttudent1.avatar = "/assets/images/avatar/student1.jpg";

    var student1 = new UserStudent();
    student1.user = userSttudent1;

    await User.save(userSttudent1);
    await UserStudent.save(student1);
    const hashStudent1 = bcrypt.hashSync("hocdoan1", 10);
    await Account.save(Account.create({
        username: "hocdoan1",
        password: hashStudent1,
        role: AccountRole.STUDENT,
        user: userSttudent1,
    }));

    //Create Student 2
    var userSttudent2 = new User();

    userSttudent2.id = 1000002;
    userSttudent2.email = "hocdoan2@gmail.com";
    userSttudent2.fullName = "Doan Thai Hoc";
    userSttudent2.phone = "2222222222";
    userSttudent2.dateOfBirth = new Date(1999, 12, 6);
    userSttudent2.sex = Sex.MALE;
    userSttudent2.address = "Đồng Nai";
    userSttudent2.role = UserRole.STUDENT;
    userSttudent2.avatar = "/assets/images/avatar/student2.jpg";

    var student2 = new UserStudent();
    student2.user = userSttudent2;

    await User.save(userSttudent2);
    await UserStudent.save(student2);
    const hashStudent2 = bcrypt.hashSync("hocdoan2", 10);
    await Account.save(Account.create({
        username: "hocdoan2",
        password: hashStudent2,
        role: AccountRole.STUDENT,
        user: userSttudent2,
    }));
    
    //Create Curriculum
    const curriculumEnglish10 = await Curriculum.save(Curriculum.create({
        name: "Chương trình tiếng anh lớp 10",
        desc: "Khóa học Tiếng Anh 10 chương trình mới này bao gồm những bài học được sắp xếp một cách có hệ thống, logic thông qua những hoạt động đa dạng, những trò chơi thú vị để bạn học kiến thức, từ vựng một cách dễ dàng mà không cảm thấy nhàm chán. Chủ đề trong bài cũng vô cùng phong phú, ví dụ như về Đời sống gia đình, Âm nhạc, Những phát minh, Môi trường, Xã hội... bạn không chỉ được bổ sung về ngữ pháp mà còn được tích lũy thêm nhiều kiến thức ngoài xã hội nữa. Nhờ vậy, bạn sẽ nhanh chóng xây dựng được cho mình một nền tảng cơ bản để phát triển dần các kỹ năng ngôn ngữ.",
        image: "/assets/images/cirriculum/init_image.jpg",
    }));

    //Create Lectures of Curriculum
    await Lecture.save(Lecture.create({
        name: "Unit 1: A day in the life of - Một ngày trong đời:",
        desc: "Bài giảng Unit 1 A day in the life of mở đầu môn Tiếng Anh lớp 10 sau đây gồm các phần Reading, Speaking, Listening, Language Focus và Vocabulary được HOC247 biên soạn đầy đủ và bám sát với nội dung SGK nhằm giúp các em ôn tập, chuẩn bị bài thật tốt. Hệ thống các câu hỏi trắc nghiệm, hỏi đáp theo chủ đề về Một ngày trong đời giúp các em có thể phát triển thêm ý, từ vựng và giải quyết nhiều câu hỏi khó một cách nhanh chóng ",
        curriculum: curriculumEnglish10,
    }));

    await Lecture.save(Lecture.create({
        name: "Unit 2: School Talks - Nói chuyện về trường học",
        desc: "Bài giảng tiếp theo của môn Tiếng Anh lớp 10 mà các em sẽ được tìm hiểu là Unit 2 School Talks gồm các phần Reading, Speaking, Listening, Language Focus và Vocabulary liên quan đến trường học. Bên cạnh giúp các em nắm vững lý thuyết, HOC247 còn cung cấp thêm các câu hỏi trắc nghiệm cùng hệ thống hỏi đáp về chủ đề Nói chuyện về trường học nhằm giúp các em ôn tập, phát triển thêm từ vựng và giải quyết các câu hỏi khó một cách nhanh chóng ",
        curriculum: curriculumEnglish10,
    }));

    await Lecture.save(Lecture.create({
        name: "Unit 3: People's Background - Tiểu sử",
        desc: "Tiểu sử là nội dung mà các em sẽ được tìm hiểu ở Unit 3 People's Background​ của môn Tiếng Anh lớp 10. Bài giảng gồm các phần Reading, Speaking, Listening, Language Focus và Vocabulary cùng hệ thống các câu hỏi trắc nghiệm, hỏi đáp đi kèm sẽ giúp các em ôn tập, chuẩn bị bài thật tốt cũng như có thể phát triển thêm vốn từ cho mình. Ngoài ra bên cạnh đó phần hỏi đáp sẽ giúp các em trao đổi các dạng câu hỏi khó, thắc mắc liên quan đến bài học, chia sẻ đề cùng nhau tiến bộ hơn. Mời các em cùng theo dõi nội dung chi tiết bên dưới.",
        curriculum: curriculumEnglish10,
    }));

    await Lecture.save(Lecture.create({
        name: "Unit 4: Special Education - Giáo dục đặc biệt",
        desc: "Giáo dục đặc biệt là nội dung mà các em sẽ được tìm hiểu ở Unit 4 Special Education của môn Tiếng Anh lớp 10. Bài giảng gồm các phần Reading, Speaking, Listening, Language Focus và Vocabulary cùng hệ thống các câu hỏi trắc nghiệm, hỏi đáp đi kèm sẽ giúp các em ôn tập, chuẩn bị bài thật tốt cũng như có thể phát triển thêm vốn từ cho mình. Ngoài ra bên cạnh đó phần hỏi đáp sẽ giúp các em trao đổi các dạng câu hỏi khó, thắc mắc liên quan đến bài học, chi sẻ đề cùng nhau tiến bộ hơn. Mời các em cùng theo dõi nội dung chi tiết bên dưới.",
        curriculum: curriculumEnglish10,
    }));

    await Lecture.save(Lecture.create({
        name: "Unit 5: Technology and You - Công nghệ và bạn",
        desc: "Nội dung bài giảng Unit 5 Technology and You của môn Tiếng Anh lớp 10 sau đây sẽ giúp các em tìm hiểu các nội dung về Lựa chọn ngành nghề qua 7 phần cơ bản Reading, Speaking, Listening, Language Focus và Vocabulary. Để ôn tập và chuẩn bị bài thật tốt các em có luyện tập thêm các câu hỏi trắc nghiệm. Hệ thống hỏi đáp về chủ đề Công nghệ và bạn sẽ giúp các em phát triển vốn từ vựng và giải quyết nhiều câu hỏi khó một cách nhanh chóng. ",
        curriculum: curriculumEnglish10,
    }));

    //Create Course
    const course1 = await Course.save(Course.create({
        name: "Khóa học tiếng anh lớp 10 mùa xuân",
        maxNumberOfStudent: 30,
        type: TermCourse.LongTerm,
        price: 300000,
        openingDate: new Date(2022, 1, 1),
        closingDate: new Date(2022, 5, 31),
        image: "/assets/images/course/init_course.jpg",
        curriculum: curriculumEnglish10,
        teacher: teacherMinh,
    }));

    //Create Course
    const course2 = await Course.save(Course.create({
        name: "Khóa học tiếng anh lớp 10",
        maxNumberOfStudent: 30,
        type: TermCourse.LongTerm,
        price: 300000,
        openingDate: new Date(2022, 1, 1),
        closingDate: new Date(2022, 5, 31),
        image: "/assets/images/course/init_course.jpg",
        curriculum: curriculumEnglish10,
        teacher: teacherMinh,
    }));

    //=====================================================================================================================================================================================================
    //Create Curriculum
    const curriculumToeic550_650 = await Curriculum.save(Curriculum.create({
        name: "KHÓA HỌC TOEIC 550 - 650+",
        desc: "Lấy lại kiến thức căn bản tiếng Anh (Basic TOEIC) và 250 - 300 (Pre TOEIC), 350 - 400 (TOEIC A)",
        image: "/assets/images/cirriculum/init_image.jpg",
    }));

    //Create Lectures of Curriculum
    await Lecture.save(Lecture.create({
        name: "Giai đoạn 1: BASIC TOEIC",
        desc: "Lấy lại kiến thức căn bản tiếng Anh, hệ thống lại nền tảng kiến thức. Học Listening và điền từ",
        curriculum: curriculumToeic550_650,
    }));

    await Lecture.save(Lecture.create({
        name: "Giai đoạn 2: PRE TOEIC",
        desc: "Lấy lại kiến thức căn bản tiếng Anh. Chia làm 2 phần; 11 buổi Listening, 11 buổi Reading, 01 buổi Mid Term và 01 buổi final Term.",
        curriculum: curriculumToeic550_650,
    }));

    await Lecture.save(Lecture.create({
        name: "Giai đoạn 3: TOEIC A",
        desc: "450-500+ điểm TOEIC. Chia làm 2 phần; 11 buổi Listening, 11 buổi Reading, 01 buổi Mid Term và 01 buổi final Term.",
        curriculum: curriculumToeic550_650,
    }));

    await Lecture.save(Lecture.create({
        name: "Giai đoạn 4: TOEIC B",
        desc: "550-650+ điểm TOEIC. Chia làm 2 phần; 11 buổi Listening, 11 buổi Reading, 01 buổi Mid Term và 01 buổi final Term.",
        curriculum: curriculumToeic550_650,
    }));

    //Create Course
    const course3 = await Course.save(Course.create({
        name: "KHÓA HỌC TOEIC 550 - 650+ mùa Hè 2021",
        maxNumberOfStudent: 40,
        type: TermCourse.ShortTerm,
        price: 1000000,
        openingDate: new Date(2021, 6, 1),
        closingDate: new Date(2022, 9, 30),
        image: "/assets/images/course/init_course.jpg",
        curriculum: curriculumToeic550_650,
        teacher: teacherMinh,
    }));

    //Create Course
    const course4 = await Course.save(Course.create({
        name: "KHÓA HỌC TOEIC 550 - 650+ mùa Xuân 2022",
        maxNumberOfStudent: 40,
        type: TermCourse.ShortTerm,
        price: 1100000,
        openingDate: new Date(2022, 2, 15),
        closingDate: new Date(2022, 5, 15),
        image: "/assets/images/course/init_course.jpg",
        curriculum: curriculumToeic550_650,
        teacher: teacherMinh,
    }));

    // Create Shifts
    await initShifts();

    // TODO: Create Schedule
    // Schedule for Course 1
    const schedule1Course1 = new Schedule();
    schedule1Course1.course = course1;
    schedule1Course1.tutor = tutor1;
    schedule1Course1.classroom = classroomA;
    schedule1Course1.startShift = await ShiftRepository.findById(207);
    schedule1Course1.endShift = await ShiftRepository.findById(210);

    const schedule2Course1 = new Schedule();
    schedule2Course1.course = course1;
    schedule2Course1.tutor = tutor1;
    schedule2Course1.classroom = classroomA;
    schedule2Course1.startShift = await ShiftRepository.findById(307);
    schedule2Course1.endShift = await ShiftRepository.findById(310);

    const schedule3Course1 = new Schedule();
    schedule3Course1.course = course1;
    schedule3Course1.tutor = tutor1;
    schedule3Course1.classroom = classroomA;
    schedule3Course1.startShift = await ShiftRepository.findById(407);
    schedule3Course1.endShift = await ShiftRepository.findById(410);

    const schedule4Course1 = new Schedule();
    schedule4Course1.course = course1;
    schedule4Course1.tutor = tutor1;
    schedule4Course1.classroom = classroomA;
    schedule4Course1.startShift = await ShiftRepository.findById(507);
    schedule4Course1.endShift = await ShiftRepository.findById(510);

    const schedule5Course1 = new Schedule();
    schedule5Course1.course = course1;
    schedule5Course1.tutor = tutor1;
    schedule5Course1.classroom = classroomA;
    schedule5Course1.startShift = await ShiftRepository.findById(607);
    schedule5Course1.endShift = await ShiftRepository.findById(610);

    await Schedule.save(schedule1Course1);
    await Schedule.save(schedule2Course1);
    await Schedule.save(schedule3Course1);
    await Schedule.save(schedule4Course1);
    await Schedule.save(schedule5Course1);

    course1.schedules = [
        schedule1Course1, 
        schedule2Course1,
        schedule3Course1,
        schedule4Course1,
        schedule5Course1,
    ]
    await Course.save(course1);

    // Schedule for Course 2
    const schedule1Course2 = new Schedule();
    schedule1Course2.course = course2;
    schedule1Course2.tutor = tutor1;
    schedule1Course2.classroom = classroomB;
    schedule1Course2.startShift = await ShiftRepository.findById(313);
    schedule1Course2.endShift = await ShiftRepository.findById(316);

    const schedule2Course2 = new Schedule();
    schedule2Course2.course = course2;
    schedule2Course2.tutor = tutor1;
    schedule2Course2.classroom = classroomB;
    schedule2Course2.startShift = await ShiftRepository.findById(513);
    schedule2Course2.endShift = await ShiftRepository.findById(516);

    const schedule3Course2 = new Schedule();
    schedule3Course2.course = course2;
    schedule3Course2.tutor = tutor1;
    schedule3Course2.classroom = classroomB;
    schedule3Course2.startShift = await ShiftRepository.findById(713);
    schedule3Course2.endShift = await ShiftRepository.findById(716);

    await Schedule.save(schedule1Course2);
    await Schedule.save(schedule2Course2);
    await Schedule.save(schedule3Course2);

    course2.schedules = [
        schedule1Course2, 
        schedule2Course2,
        schedule3Course2,
    ]
    await Course.save(course2);

    // Schedule for Course 3
    const schedule1Course3 = new Schedule();
    schedule1Course3.course = course3;
    schedule1Course3.tutor = tutor1;
    schedule1Course3.classroom = classroomA;
    schedule1Course3.startShift = await ShiftRepository.findById(208);
    schedule1Course3.endShift = await ShiftRepository.findById(211);

    const schedule2Course3 = new Schedule();
    schedule2Course3.course = course3;
    schedule2Course3.tutor = tutor1;
    schedule2Course3.classroom = classroomA;
    schedule2Course3.startShift = await ShiftRepository.findById(308);
    schedule2Course3.endShift = await ShiftRepository.findById(311);

    const schedule3Course3 = new Schedule();
    schedule3Course3.course = course3;
    schedule3Course3.tutor = tutor1;
    schedule3Course3.classroom = classroomC;
    schedule3Course3.startShift = await ShiftRepository.findById(508);
    schedule3Course3.endShift = await ShiftRepository.findById(511);

    await Schedule.save(schedule1Course3);
    await Schedule.save(schedule2Course3);
    await Schedule.save(schedule3Course3);

    course3.schedules = [
        schedule1Course3, 
        schedule2Course3,
        schedule3Course3,
    ]
    await Course.save(course3);

    // Schedule for Course 4
    const schedule1Course4 = new Schedule();
    schedule1Course4.course = course4;
    schedule1Course4.tutor = tutor1;
    schedule1Course4.classroom = classroomA;
    schedule1Course4.startShift = await ShiftRepository.findById(208);
    schedule1Course4.endShift = await ShiftRepository.findById(211);

    const schedule2Course4 = new Schedule();
    schedule2Course4.course = course4;
    schedule2Course4.tutor = tutor1;
    schedule2Course4.classroom = classroomA;
    schedule2Course4.startShift = await ShiftRepository.findById(308);
    schedule2Course4.endShift = await ShiftRepository.findById(311);

    const schedule3Course4 = new Schedule();
    schedule3Course4.course = course4;
    schedule3Course4.tutor = tutor1;
    schedule3Course4.classroom = classroomA;
    schedule3Course4.startShift = await ShiftRepository.findById(408);
    schedule3Course4.endShift = await ShiftRepository.findById(411);

    const schedule4Course4 = new Schedule();
    schedule4Course4.course = course4;
    schedule4Course4.tutor = tutor1;
    schedule4Course4.classroom = classroomB;
    schedule4Course4.startShift = await ShiftRepository.findById(513);
    schedule4Course4.endShift = await ShiftRepository.findById(516);

    const schedule5Course4 = new Schedule();
    schedule5Course4.course = course4;
    schedule5Course4.tutor = tutor1;
    schedule5Course4.classroom = classroomB;
    schedule5Course4.startShift = await ShiftRepository.findById(613);
    schedule5Course4.endShift = await ShiftRepository.findById(616);

    await Schedule.save(schedule1Course4);
    await Schedule.save(schedule2Course4);
    await Schedule.save(schedule3Course4);
    await Schedule.save(schedule4Course4);
    await Schedule.save(schedule5Course4);

    course4.schedules = [
        schedule1Course4, 
        schedule2Course4,
        schedule3Course4,
        schedule4Course4,
        schedule5Course4,
    ]
    await Course.save(course4);

    // Create Relation Student Participate Course
    const studentAttendCourse1 = new StudentParticipateCourse();
    studentAttendCourse1.student = student1;
    studentAttendCourse1.course = course1;
    await StudentParticipateCourse.save(studentAttendCourse1);

    const studentAttendCourse2 = new StudentParticipateCourse();
    studentAttendCourse2.student = student1;
    studentAttendCourse2.course = course2;
    await StudentParticipateCourse.save(studentAttendCourse2);

    const studentAttendCourse3 = new StudentParticipateCourse();
    studentAttendCourse3.student = student1;
    studentAttendCourse3.course = course3;
    await StudentParticipateCourse.save(studentAttendCourse3);

    const studentAttendCourse4 = new StudentParticipateCourse();
    studentAttendCourse4.student = student1;
    studentAttendCourse4.course = course4;
    await StudentParticipateCourse.save(studentAttendCourse4);

    console.log("-----------------------Ending init data-----------------------")
}


async function initShifts(){

    const weekDays = [
        Weekday.Monday, 
        Weekday.Tuesday, 
        Weekday. Wednesday, 
        Weekday.Thursday,
        Weekday.Friday,
        Weekday.Saturday,
        Weekday.Sunday,
    ];

    const shiftInDay = 14;

    for (const weekDay of weekDays){
        for (var offset = 0; offset < shiftInDay; offset++){
            var shift = new Shift();
            shift.weekDay = weekDay;
            shift.startTime = new Date(2000, 10, 10, 7 + offset, 0, 0, 0);
            shift.endTime = new Date(2000, 10, 10, 7 + offset + 1, 0, 0, 0);
            shift.id = parseInt(cvtWeekDay2Num(weekDay) + (shift.startTime.getHours() < 10 ? '0' : '') + shift.startTime.getHours());
            await Shift.save(shift);
        }
    }
}