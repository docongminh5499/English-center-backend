import { Course } from "../entities/Course";
import { Curriculum } from "../entities/Curriculum";
import { Lecture } from "../entities/Lecture"
import { UserTeacher } from "../entities/UserTeacher";
import { TermCourse } from "../utils/constants/termCuorse.constant";
export async function initData(){

    // const teacherMinh = await UserTeacher.save(UserTeacher.create({
    //     id: 2000001
    // }));

    const curriculumEnglish10 = await Curriculum.save(Curriculum.create({
        name: "Chương trình tiếng anh lớp 10",
        desc: "Khóa học Tiếng Anh 10 chương trình mới này bao gồm những bài học được sắp xếp một cách có hệ thống, logic thông qua những hoạt động đa dạng, những trò chơi thú vị để bạn học kiến thức, từ vựng một cách dễ dàng mà không cảm thấy nhàm chán. Chủ đề trong bài cũng vô cùng phong phú, ví dụ như về Đời sống gia đình, Âm nhạc, Những phát minh, Môi trường, Xã hội... bạn không chỉ được bổ sung về ngữ pháp mà còn được tích lũy thêm nhiều kiến thức ngoài xã hội nữa. Nhờ vậy, bạn sẽ nhanh chóng xây dựng được cho mình một nền tảng cơ bản để phát triển dần các kỹ năng ngôn ngữ.",
        image: "Image",
    }));

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

    await Course.save(Course.create({
        name: "Khóa học tiếng anh lớp 10",
        maxNumberOfStudent: 30,
        type: TermCourse.LongTerm,
        price: 300000,
        openingDate: new Date(2022, 1, 1),
        closingDate: new Date(2022, 5, 31),
        image: "Image",
        curriculum: curriculumEnglish10,
    }));
}

