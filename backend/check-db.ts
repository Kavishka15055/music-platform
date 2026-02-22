
import { createConnection } from 'typeorm';
import { User } from './src/users/user.entity';

async function checkUsers() {
  const connection = await createConnection({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [User],
  });

  const userRepository = connection.getRepository(User);
  const users = await userRepository.find();
  console.log('--- ALL USERS ---');
  users.forEach(u => {
    console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Status: ${u.approvalStatus}, Qualifications: ${u.qualifications}`);
  });
  await connection.close();
}

checkUsers().catch(console.error);
