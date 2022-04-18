import { Curriculum } from "../entities/Curriculum";
import { Lecture } from "../entities/Lecture"
export async function initData(){
    await Curriculum.save(Curriculum.create({
        name: "Chương trình tiếng anh lớp 10",
        desc: "Khóa học Tiếng Anh 10 chương trình mới này bao gồm những bài học được sắp xếp một cách có hệ thống, logic thông qua những hoạt động đa dạng, những trò chơi thú vị để bạn học kiến thức, từ vựng một cách dễ dàng mà không cảm thấy nhàm chán. Chủ đề trong bài cũng vô cùng phong phú, ví dụ như về Đời sống gia đình, Âm nhạc, Những phát minh, Môi trường, Xã hội... bạn không chỉ được bổ sung về ngữ pháp mà còn được tích lũy thêm nhiều kiến thức ngoài xã hội nữa. Nhờ vậy, bạn sẽ nhanh chóng xây dựng được cho mình một nền tảng cơ bản để phát triển dần các kỹ năng ngôn ngữ.",
        image: "Image",
    }));

    await Lecture.save(Lecture.create({
        name: "Unit 1: A day in the life of - Một ngày trong đời:",
        desc: "Unit 1: A day in the life of - Một ngày trong đời",
    }));

    await Lecture.save(Lecture.create({
        name: "Unit 2: School Talks - Nói chuyện về trường học",
        desc: "Unit 2: School Talks - Nói chuyện về trường học",
    }));

    await Lecture.save(Lecture.create({
        name: "Unit 3:",
        desc: "People's Background - Tiểu sử",
    }));

    await Lecture.save(Lecture.create({
        name: "Unit 4:",
        desc: "Special Education - Giáo dục đặc biệt",
    }));

    await Lecture.save(Lecture.create({
        name: "Unit 5:",
        desc: "Technology and You - Công nghệ và bạn",
    }));
}

