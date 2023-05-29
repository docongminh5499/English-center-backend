import { faker } from "@faker-js/faker";
import { Branch } from "../entities/Branch";

export const createBranches = async () => {
  const branches = [];
  for (let index = 0; index < 3; index++) {
    const streetName = faker.address.street();
    const branch = await Branch.save(Branch.create({
      phoneNumber: faker.phone.number('0#########'),
      address: streetName + ", " + faker.address.state() + ", " + faker.address.city(),
      name: "Chi nhánh " + streetName,
    }));
    branches.push(branch);
  }
  console.log(`Created ${branches.length} branches`);
  return branches;
}