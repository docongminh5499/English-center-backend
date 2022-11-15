import { faker } from "@faker-js/faker";
import { Curriculum } from "../entities/Curriculum";
import { Lecture } from "../entities/Lecture";
import { Tag } from "../entities/Tag";
import { CurriculumLevel } from "../utils/constants/curriculum.constant";
import { TermCourse } from "../utils/constants/termCuorse.constant";

export const createCurriculums = async (tags: Tag[]) => {
  const curriculums = [];

  //Create Curriculum
  const curriculumEnglish10 = await Curriculum.save(Curriculum.create({
    name: "Chương trình tiếng anh lớp 10",
    desc: "Khóa học Tiếng Anh 10 chương trình mới này bao gồm những bài học được sắp xếp một cách có hệ thống, logic thông qua những hoạt động đa dạng, những trò chơi thú vị để bạn học kiến thức, từ vựng một cách dễ dàng mà không cảm thấy nhàm chán. Chủ đề trong bài cũng vô cùng phong phú, ví dụ như về Đời sống gia đình, Âm nhạc, Những phát minh, Môi trường, Xã hội... bạn không chỉ được bổ sung về ngữ pháp mà còn được tích lũy thêm nhiều kiến thức ngoài xã hội nữa. Nhờ vậy, bạn sẽ nhanh chóng xây dựng được cho mình một nền tảng cơ bản để phát triển dần các kỹ năng ngôn ngữ.",
    image: "/assets/images/cirriculum/init_image.jpg",
    type: TermCourse.LongTerm,
    latest: true,
    shiftsPerSession: faker.datatype.number({ min: 1, max: 4 }),
    level: CurriculumLevel.Intermediate,
    tags: faker.helpers.arrayElements(tags, 3)
  }));

  //Create Lectures of Curriculum
  const lecture1 = await Lecture.save(Lecture.create({
    order: 1,
    name: "Unit 1: A day in the life of - Một ngày trong đời:",
    detail: "Chi tiết unit 1",
    desc: "Bài giảng Unit 1 A day in the life of mở đầu môn Tiếng Anh lớp 10 sau đây gồm các phần Reading, Speaking, Listening, Language Focus và Vocabulary được HOC247 biên soạn đầy đủ và bám sát với nội dung SGK nhằm giúp các em ôn tập, chuẩn bị bài thật tốt. Hệ thống các câu hỏi trắc nghiệm, hỏi đáp theo chủ đề về Một ngày trong đời giúp các em có thể phát triển thêm ý, từ vựng và giải quyết nhiều câu hỏi khó một cách nhanh chóng ",
    curriculum: curriculumEnglish10,
  }));

  const lecture2 = await Lecture.save(Lecture.create({
    order: 2,
    name: "Unit 2: School Talks - Nói chuyện về trường học",
    detail: "Chi tiết unit 2",
    desc: "Bài giảng tiếp theo của môn Tiếng Anh lớp 10 mà các em sẽ được tìm hiểu là Unit 2 School Talks gồm các phần Reading, Speaking, Listening, Language Focus và Vocabulary liên quan đến trường học. Bên cạnh giúp các em nắm vững lý thuyết, HOC247 còn cung cấp thêm các câu hỏi trắc nghiệm cùng hệ thống hỏi đáp về chủ đề Nói chuyện về trường học nhằm giúp các em ôn tập, phát triển thêm từ vựng và giải quyết các câu hỏi khó một cách nhanh chóng ",
    curriculum: curriculumEnglish10,
  }));

  const lecture3 = await Lecture.save(Lecture.create({
    order: 3,
    name: "Unit 3: People's Background - Tiểu sử",
    detail: "Chi tiết unit 3",
    desc: "Tiểu sử là nội dung mà các em sẽ được tìm hiểu ở Unit 3 People's Background​ của môn Tiếng Anh lớp 10. Bài giảng gồm các phần Reading, Speaking, Listening, Language Focus và Vocabulary cùng hệ thống các câu hỏi trắc nghiệm, hỏi đáp đi kèm sẽ giúp các em ôn tập, chuẩn bị bài thật tốt cũng như có thể phát triển thêm vốn từ cho mình. Ngoài ra bên cạnh đó phần hỏi đáp sẽ giúp các em trao đổi các dạng câu hỏi khó, thắc mắc liên quan đến bài học, chia sẻ đề cùng nhau tiến bộ hơn. Mời các em cùng theo dõi nội dung chi tiết bên dưới.",
    curriculum: curriculumEnglish10,
  }));

  const lecture4 = await Lecture.save(Lecture.create({
    order: 4,
    name: "Unit 4: Special Education - Giáo dục đặc biệt",
    detail: "Chi tiết unit 4",
    desc: "Giáo dục đặc biệt là nội dung mà các em sẽ được tìm hiểu ở Unit 4 Special Education của môn Tiếng Anh lớp 10. Bài giảng gồm các phần Reading, Speaking, Listening, Language Focus và Vocabulary cùng hệ thống các câu hỏi trắc nghiệm, hỏi đáp đi kèm sẽ giúp các em ôn tập, chuẩn bị bài thật tốt cũng như có thể phát triển thêm vốn từ cho mình. Ngoài ra bên cạnh đó phần hỏi đáp sẽ giúp các em trao đổi các dạng câu hỏi khó, thắc mắc liên quan đến bài học, chi sẻ đề cùng nhau tiến bộ hơn. Mời các em cùng theo dõi nội dung chi tiết bên dưới.",
    curriculum: curriculumEnglish10,
  }));

  const lecture5 = await Lecture.save(Lecture.create({
    order: 5,
    name: "Unit 5: Technology and You - Công nghệ và bạn",
    detail: "Chi tiết unit 5",
    desc: "Nội dung bài giảng Unit 5 Technology and You của môn Tiếng Anh lớp 10 sau đây sẽ giúp các em tìm hiểu các nội dung về Lựa chọn ngành nghề qua 7 phần cơ bản Reading, Speaking, Listening, Language Focus và Vocabulary. Để ôn tập và chuẩn bị bài thật tốt các em có luyện tập thêm các câu hỏi trắc nghiệm. Hệ thống hỏi đáp về chủ đề Công nghệ và bạn sẽ giúp các em phát triển vốn từ vựng và giải quyết nhiều câu hỏi khó một cách nhanh chóng. ",
    curriculum: curriculumEnglish10,
  }));
  curriculumEnglish10.lectures = [lecture1, lecture2, lecture3, lecture4, lecture5];
  await Curriculum.save(curriculumEnglish10);
  curriculums.push(curriculumEnglish10);

  //Create Curriculum
  const curriculumToeic550_650 = await Curriculum.save(Curriculum.create({
    name: "KHÓA HỌC TOEIC 550 - 650+",
    desc: "Lấy lại kiến thức căn bản tiếng Anh (Basic TOEIC) và 250 - 300 (Pre TOEIC), 350 - 400 (TOEIC A)",
    image: "/assets/images/cirriculum/init_image.jpg",
    type: TermCourse.ShortTerm,
    latest: true,
    shiftsPerSession: faker.datatype.number({ min: 1, max: 4 }),
    level: CurriculumLevel.Intermediate,
    tags: faker.helpers.arrayElements(tags, 3)
  }));

  //Create Lectures of Curriculum
  const lecture6 = await Lecture.save(Lecture.create({
    order: 1,
    name: "Giai đoạn 1: BASIC TOEIC",
    detail: "Chi tiết giai đoạn 1",
    desc: "Lấy lại kiến thức căn bản tiếng Anh, hệ thống lại nền tảng kiến thức. Học Listening và điền từ",
    curriculum: curriculumToeic550_650,
  }));

  const lecture7 = await Lecture.save(Lecture.create({
    order: 2,
    name: "Giai đoạn 2: PRE TOEIC",
    detail: "Chi tiết giai đoạn 2",
    desc: "Lấy lại kiến thức căn bản tiếng Anh. Chia làm 2 phần; 11 buổi Listening, 11 buổi Reading, 01 buổi Mid Term và 01 buổi final Term.",
    curriculum: curriculumToeic550_650,
  }));

  const lecture8 = await Lecture.save(Lecture.create({
    order: 3,
    name: "Giai đoạn 3: TOEIC A",
    detail: "Chi tiết giai đoạn 3",
    desc: "450-500+ điểm TOEIC. Chia làm 2 phần; 11 buổi Listening, 11 buổi Reading, 01 buổi Mid Term và 01 buổi final Term.",
    curriculum: curriculumToeic550_650,
  }));

  const lecture9 = await Lecture.save(Lecture.create({
    order: 4,
    name: "Giai đoạn 4: TOEIC B",
    detail: "Chi tiết giai đoạn 4",
    desc: "550-650+ điểm TOEIC. Chia làm 2 phần; 11 buổi Listening, 11 buổi Reading, 01 buổi Mid Term và 01 buổi final Term.",
    curriculum: curriculumToeic550_650,
  }));

  curriculumToeic550_650.lectures = [lecture6, lecture7, lecture8, lecture9];
  await Curriculum.save(curriculumToeic550_650);
  curriculums.push(curriculumToeic550_650);


  const numberOfCurriculums = faker.datatype.number({ min: 5, max: 10 });
  for (let index = 0; index < numberOfCurriculums; index++) {
    const lectures = [];
    const curriculum = await Curriculum.save(Curriculum.create({
      name: faker.lorem.sentence(),
      desc: faker.lorem.paragraphs(),
      image: "/assets/images/cirriculum/init_image.jpg",
      type: faker.helpers.arrayElement([TermCourse.ShortTerm, TermCourse.LongTerm]),
      latest: true,
      shiftsPerSession: faker.datatype.number({ min: 1, max: 3 }),
      level: faker.helpers.arrayElement([
        CurriculumLevel.Beginer,
        CurriculumLevel.Intermediate,
        CurriculumLevel.Advance,
      ]),
      tags: faker.helpers.arrayElements(tags, 3)
    }));

    const numberOfLectures = curriculum.type === TermCourse.ShortTerm
      ? faker.datatype.number({ min: 12, max: 20 })
      : faker.datatype.number({ min: 80, max: 100 });
    for (let lectureIndex = 0; lectureIndex < numberOfLectures; lectureIndex++) {
      const lecture = await Lecture.save(Lecture.create({
        order: lectureIndex + 1,
        name: faker.lorem.sentence(),
        detail: faker.lorem.paragraphs(),
        desc: faker.lorem.paragraphs(),
        curriculum: curriculumToeic550_650,
      }));
      lectures.push(lecture);
    }
    curriculum.lectures = lectures;
    await Curriculum.save(curriculum);
    curriculums.push(curriculum);
  }
  console.log(`Created ${curriculums.length} curriculumns`);
  return curriculums;
}