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
exports.UserEmployee = void 0;
const typeorm_1 = require("typeorm");
const UserEntity_1 = require("./UserEntity");
const UserTeacher_1 = require("./UserTeacher");
const UserTutor_1 = require("./UserTutor");
const Salary_1 = require("./Salary");
const role_constant_1 = require("../utils/constants/role.constant");
const class_validator_1 = require("class-validator");
let UserEmployee = class UserEmployee extends UserEntity_1.User {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserEmployee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserEmployee.prototype, "roles", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserEmployee.prototype, "coefficients", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 20),
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], UserEmployee.prototype, "nation", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Length)(0, 20),
    (0, typeorm_1.Column)({ length: 20, unique: true, nullable: false }),
    __metadata("design:type", Number)
], UserEmployee.prototype, "passport", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 20),
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], UserEmployee.prototype, "domicile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserTeacher_1.UserTeacher, userTeacher => userTeacher.id),
    __metadata("design:type", Array)
], UserEmployee.prototype, "userTeacher", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserTutor_1.UserTutor, userTutor => userTutor.id),
    __metadata("design:type", Array)
], UserEmployee.prototype, "userTutor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Salary_1.Salary, salary => salary.id),
    __metadata("design:type", Salary_1.Salary)
], UserEmployee.prototype, "salary", void 0);
UserEmployee = __decorate([
    (0, typeorm_1.Entity)()
], UserEmployee);
exports.UserEmployee = UserEmployee;
