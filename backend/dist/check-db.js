"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./src/users/user.entity");
async function checkUsers() {
    const connection = await (0, typeorm_1.createConnection)({
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [user_entity_1.User],
    });
    const userRepository = connection.getRepository(user_entity_1.User);
    const users = await userRepository.find();
    console.log('--- ALL USERS ---');
    users.forEach(u => {
        console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Status: ${u.approvalStatus}, Qualifications: ${u.qualifications}`);
    });
    await connection.close();
}
checkUsers().catch(console.error);
//# sourceMappingURL=check-db.js.map