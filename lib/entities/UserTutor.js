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
exports.UserTutor = void 0;
const typeorm_1 = require("typeorm");
const UserEntity_1 = require("./UserEntity");
const role_constant_1 = require("../utils/constants/role.constant");
const Salary_1 = require("./Salary");
const class_validator_1 = require("class-validator");
let UserTutor = class UserTutor extends UserEntity_1.User {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserTutor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserTutor.prototype, "roles", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserTutor.prototype, "coefficients", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 20),
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], UserTutor.prototype, "nation", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Length)(0, 20),
    (0, typeorm_1.Column)({ length: 20, unique: true, nullable: false }),
    __metadata("design:type", Number)
], UserTutor.prototype, "passport", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 20),
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], UserTutor.prototype, "domicile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Salary_1.Salary, salary => salary.id),
    __metadata("design:type", Salary_1.Salary)
], UserTutor.prototype, "salary", void 0);
UserTutor = __decorate([
    (0, typeorm_1.Entity)()
], UserTutor);
exports.UserTutor = UserTutor;
