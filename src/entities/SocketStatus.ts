import { IsNotEmpty, IsString } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";
import { User } from "./UserEntity";

@Entity()
export class SocketStatus extends MyBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @IsNotEmpty()
    @Column({ length: 255, nullable: false })
    socketId: string;

    @ManyToOne(() => User, (user) => user.socketStatuses, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;
}