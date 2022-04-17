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
exports.UserParent = void 0;
const typeorm_1 = require("typeorm");
const UserEntity_1 = require("./UserEntity");
const UserStudent_1 = require("./UserStudent");
const role_constant_1 = require("../utils/constants/role.constant");
let UserParent = class UserParent extends UserEntity_1.User {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserParent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserParent.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserStudent_1.UserStudent, userStudent => userStudent.id),
    __metadata("design:type", Array)
], UserParent.prototype, "userStudent", void 0);
UserParent = __decorate([
    (0, typeorm_1.Entity)()
], UserParent);
exports.UserParent = UserParent;
