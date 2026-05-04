import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando datos en la base de datos...');

  // 1. Crear un administrador base
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@capitalreal.com' },
    update: {},
    create: {
      email: 'admin@capitalreal.com',
      name: 'Administrador Principal',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log(`Usuario administrador creado: ${admin.email}`);

  // 2. Crear una propiedad de ejemplo
  const propertyCount = await prisma.property.count();
  
  if (propertyCount === 0) {
    const prop1 = await prisma.property.create({
      data: {
        title: 'Villa Moderna en la Costa',
        description: 'Impresionante villa con vistas al mar, diseño minimalista y piscina infinita.',
        price: 1250000,
        location: 'Marbella, España',
        type: 'Casas',
        status: 'Venta',
        bedrooms: 4,
        bathrooms: 3,
        area: 320,
        featured: true,
        agentId: admin.id,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' },
            { url: 'https://images.unsplash.com/photo-1600607687931-ce8e0026e6c1?w=800&q=80' }
          ]
        }
      }
    });
    console.log(`Propiedad creada: ${prop1.title}`);
  }

  console.log('Siembra completada.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
