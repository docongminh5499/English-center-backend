"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongAnswer = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const MyBaseEntity_1 = require("./MyBaseEntity");
const Question_1 = require("./Question");
let WrongAnswer = class WrongAnswer extends MyBaseEntity_1.MyBaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WrongAnswer.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 255),
    (0, typeorm_1.Column)({ length: 255, nullable: false }),
    __metadata("design:type", String)
], WrongAnswer.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Question_1.Question, {
        nullable: false,
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Question_1.Question)
], WrongAnswer.prototype, "question", void 0);
WrongAnswer = __decorate([
    (0, typeorm_1.Entity)()
], WrongAnswer);
exports.WrongAnswer = WrongAnswer;
