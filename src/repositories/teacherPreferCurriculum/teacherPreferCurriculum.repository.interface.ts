export default interface TeacherPreferCurriculumRepository {
    deletePreferCurriculum: (teacherId: number, curriculumId: number) => Promise<boolean>;
}