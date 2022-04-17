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
exports.Exercise = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const MyBaseEntity_1 = require("./MyBaseEntity");
const exercise_constant_1 = require("../utils/constants/exercise.constant");
let Exercise = class Exercise extends MyBaseEntity_1.MyBaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Exercise.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Exercise.prototype, "openTime", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Exercise.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(exercise_constant_1.ExerciseStatus),
    (0, typeorm_1.Column)({ type: "enum", enum: exercise_constant_1.ExerciseStatus, nullable: false }),
    __metadata("design:type", String)
], Exercise.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, typeorm_1.Column)({ type: "integer", default: 3 }),
    __metadata("design:type", Number)
], Exercise.prototype, "maxTime", void 0);
Exercise = __decorate([
    (0, typeorm_1.Entity)()
], Exercise);
exports.Exercise = Exercise;
