import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        type: true,
        imageUrl: true,
        phone: true,
        bio: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        type: true,
        imageUrl: true,
        phone: true,
        bio: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user by id:', error);
    res.status(500).json({ success: false, error: 'Error al obtener usuario' });
  }
};

import { StorageService } from '../services/storageService';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, type, phone, bio } = req.body;
    const file = req.file as Express.Multer.File;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Subir a Supabase si hay archivo
    const imageUrl = file ? await StorageService.uploadFile(file, 'agents') : null;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'ADMIN',
        type: type || 'Agente',
        imageUrl,
        phone,
        bio
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        type: true,
        imageUrl: true,
        phone: true,
        bio: true,
        createdAt: true
      }
    });

    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al crear usuario' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { email, password, name, role, type, phone, bio } = req.body;
    const file = req.file as Express.Multer.File;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const data: any = {
      email,
      name,
      role,
      type,
      phone,
      bio
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (file) {
      // 1. Eliminar imagen anterior si existe
      if (existingUser.imageUrl) {
        await StorageService.deleteFile(existingUser.imageUrl);
      }
      // 2. Subir nueva
      data.imageUrl = await StorageService.uploadFile(file, 'agents');
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        type: true,
        imageUrl: true,
        phone: true,
        bio: true,
        createdAt: true
      }
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al actualizar usuario' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const currentUser = (req as any).user;

    if (currentUser.id === id) {
      return res.status(400).json({ success: false, error: 'No puedes eliminarte a ti mismo' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
  }
};

// Public endpoint for agents page
export const getPublicAgents = async (req: Request, res: Response) => {
  try {
    const agents = await prisma.user.findMany({
      where: {
        OR: [
          { type: 'Agente' },
          { type: 'Ambos' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        imageUrl: true,
        phone: true,
        bio: true
      }
    });
    res.json({ success: true, data: agents });
  } catch (error) {
    console.error('Error fetching public agents:', error);
    res.status(500).json({ success: false, error: 'Error al obtener agentes' });
  }
};
