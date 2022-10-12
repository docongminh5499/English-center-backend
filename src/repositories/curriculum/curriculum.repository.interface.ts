import { Curriculum } from "../../entities/Curriculum";

export default interface CurriculumRepository {
    getCurriculumList: () => Promise<Curriculum[]>;

    getCurriculumById: (curriculumId: number) => Promise<Curriculum | null>;

    deleteCurriculumById: (curriculumId: number) => Promise<boolean>;

    setNullCurriculumById: (curriculumId: number) => Promise<boolean>;
}