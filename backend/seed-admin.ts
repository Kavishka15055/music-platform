
import { createConnection } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, ApprovalStatus } from './src/users/user.entity';

async function seedAdmin() {
  const connection = await createConnection({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [User],
  });

  const userRepository = connection.getRepository(User);
  
  const adminEmail = 'admin@example.com';
  const existing = await userRepository.findOneBy({ email: adminEmail });

  if (existing) {
    console.log('Admin user already exists');
  } else {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
    });
    await userRepository.save(admin);
    console.log('Admin user seeded: admin@example.com / admin123');
  }

  await connection.close();
}

seedAdmin().catch(console.error);
