import { IsNotEmpty, IsNumber, IsPositive, Max, Min } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";

@Entity()
export class TransactionConstants extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(28)
  @Column({ type: "int", nullable: false })
  feeDay: number;          // Ngày tính học phí hàng tháng (1-28)

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(28)
  @Column({ type: "int", nullable: false })
  feeDueDay: number;       // Ngày trễ hạn học phí (1-28)

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(28)
  @Column({ type: "int", nullable: false })
  salaryDay: number;       // Ngày tính lương hàng tháng (1-28)

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({
    type: "decimal",
    precision: 9,
    scale: 0,
    nullable: false,
    transformer: {
      to(value) { return value; },
      from(value) { return parseFloat(value); },
    },
  })
  baseSalary: number;         // Lương cơ bản

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({
    type: "decimal",
    precision: 3,
    scale: 2,
    nullable: false,
    transformer: {
      to(value) { return value; },
      from(value) { return parseFloat(value); },
    },
  })
  teacherProportion: number;         // Phần trăm giá buổi học dành cho giáo viên khi tính lương

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({
    type: "decimal",
    precision: 3,
    scale: 2,
    nullable: false,
    transformer: {
      to(value) { return value; },
      from(value) { return parseFloat(value); },
    },
  })
  tutorProportion: number;         // Phần trăm giá buổi học dành cho trợ giảng khi tính lương
}
