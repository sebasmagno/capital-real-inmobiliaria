import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.settings.findFirst({
      where: { id: 'singleton' }
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.settings.create({
        data: {
          id: 'singleton',
          companyName: 'CAPITAL REAL INMOBILIARIA',
          contactEmail: 'info@capitalreal.com',
          phone: '+57 300 000 0000',
          address: 'Pereira, Risaralda, Colombia',
          businessHours: 'Lunes a Viernes, 9am - 6pm'
        }
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Error al obtener configuración' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { companyName, contactEmail, phone, address, facebookUrl, instagramUrl, twitterUrl, businessHours } = req.body;
    const file = req.file as Express.Multer.File;

    const data: any = {
      companyName,
      contactEmail,
      phone,
      address,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      businessHours
    };

    if (file) {
      data.logoUrl = `/uploads/${file.filename}`;
    }

    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: {
        id: 'singleton',
        ...data
      }
    });

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar configuración' });
  }
};
