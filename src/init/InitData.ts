import * as bcrypt from "bcryptjs";

import { Account } from "../entities/Account";
import { Course } from "../entities/Course";
import { Curriculum } from "../entities/Curriculum";
import { Lecture } from "../entities/Lecture"
import { User } from "../entities/UserEntity";
import { UserTeacher } from "../entities/UserTeacher";
import { Worker } from "../entities/Worker";
import { AccountRole, UserRole } from "../utils/constants/role.constant";
import { TermCourse } from "../utils/constants/termCuorse.constant";

export async function initData(){

    //Create User role Teacher
    const userMinh = await User.save(User.create({
        id: 2000001,
        email: "meozzz123@gmail.com",
        fullName: "Do Cong Minh",
        phone: "9999999999",
        age: 40,
        sex: 1,
        address: "Đồng Nai",
        roles: UserRole.TEACHER,
    }));
    console.log(userMinh)
    //Create Worker for Teacher
    const workerMinh = await Worker.save(Worker.create({
        user: userMinh,
    }));

    //Create UserTeacher
    const teacherMinh = await UserTeacher.save(UserTeacher.create({
        worker: workerMinh,
    }));

    //Create Account for UserTeacher
    const hash = bcrypt.hashSync("doremon123", 10);
    await Account.save(Account.create({
        username: "minh5499",
        password: hash,
        role: AccountRole.TEACHER,
        user: teacherMinh,
    }));

    //Create Curriculum
    const curriculumEnglish10 = await Curriculum.save(Curriculum.create({
        name: "Chương trình tiếng anh lớp 10",
        desc: "Khóa học Tiếng Anh 10 chương trình mới này bao gồm những bài học được sắp xếp một cách có hệ thống, logic thông qua những hoạt động đa dạng, những trò chơi thú vị để bạn học kiến thức, từ vựng một cách dễ dàng mà không cảm thấy nhàm chán. Chủ đề trong bài cũng vô cùng phong phú, ví dụ như về Đời sống gia đình, Âm nhạc, Những phát minh, Môi trường, Xã hội... bạn không chỉ được bổ sung về ngữ pháp mà còn được tích lũy thêm nhiều kiến thức ngoài xã hội nữa. Nhờ vậy, bạn sẽ nhanh chóng xây dựng được cho mình một nền tảng cơ bản để phát triển dần các kỹ năng ngôn ngữ.",
        image: "Image",
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
    await Course.save(Course.create({
        name: "Khóa học tiếng anh lớp 10 mùa xuân",
        maxNumberOfStudent: 30,
        type: TermCourse.LongTerm,
        price: 300000,
        openingDate: new Date(2022, 1, 1),
        closingDate: new Date(2022, 5, 31),
        image: "Image",
        curriculum: curriculumEnglish10,
        teacher: teacherMinh,
    }));

    //Create Course
    await Course.save(Course.create({
        name: "Khóa học tiếng anh lớp 10",
        maxNumberOfStudent: 30,
        type: TermCourse.LongTerm,
        price: 300000,
        openingDate: new Date(2022, 1, 1),
        closingDate: new Date(2022, 5, 31),
        image: "Image",
        curriculum: curriculumEnglish10,
        teacher: teacherMinh,
    }));

    //=====================================================================================================================================================================================================
    //Create Curriculum
    const curriculumToeic550_650 = await Curriculum.save(Curriculum.create({
        name: "KHÓA HỌC TOEIC 550 - 650+",
        desc: "Lấy lại kiến thức căn bản tiếng Anh (Basic TOEIC) và 250 - 300 (Pre TOEIC), 350 - 400 (TOEIC A)",
        image: "Image",
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
    await Course.save(Course.create({
        name: "KHÓA HỌC TOEIC 550 - 650+ mùa Hè 2021",
        maxNumberOfStudent: 40,
        type: TermCourse.ShortTerm,
        price: 1000000,
        openingDate: new Date(2021, 6, 1),
        closingDate: new Date(2022, 9, 30),
        image: "Image",
        curriculum: curriculumToeic550_650,
        teacher: teacherMinh,
    }));

    //Create Course
    await Course.save(Course.create({
        name: "KHÓA HỌC TOEIC 550 - 650+ mùa Xuân 2022",
        maxNumberOfStudent: 40,
        type: TermCourse.ShortTerm,
        price: 1100000,
        openingDate: new Date(2022, 2, 15),
        closingDate: new Date(2022, 5, 15),
        image: "Image",
        curriculum: curriculumToeic550_650,
        teacher: teacherMinh,
    }));
}

