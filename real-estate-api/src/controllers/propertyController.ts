import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// Endpoint Público: Búsqueda veloz de propiedades
export const getProperties = async (req: Request, res: Response) => {
  const { location, type, maxPrice } = req.query;

  const filters: any = {};

  if (location) {
    filters.location = { contains: String(location), mode: 'insensitive' };
  }
  
  if (type && type !== 'Todos') {
    filters.type = String(type);
  }

  if (maxPrice && maxPrice !== 'Sin Límite') {
    // Parse maxPrice from '€500,000' to 500000
    const parsedPrice = parseInt(String(maxPrice).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsedPrice)) {
      filters.price = { lte: parsedPrice };
    }
  }

  const properties = await prisma.property.findMany({
    where: filters,
    include: {
      images: true,
      agent: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ success: true, data: properties });
};

// Endpoint Público: Detalle de propiedad por ID
export const getPropertyById = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      agent: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  if (!property) {
    return res.status(404).json({ success: false, error: 'Propiedad no encontrada' });
  }

  res.json({ success: true, data: property });
};

// Endpoint Privado: Crear propiedad (Requiere JWT)
export const createProperty = async (req: Request, res: Response) => {
  const agentId = String((req as any).user.id);
  const { title, description, price, location, type, status, bedrooms, bathrooms, area, featured } = req.body;
  
  // Archivos de imagen subidos vía Multer
  const files = req.files as Express.Multer.File[];
  const imagesData = files ? files.map(file => ({ url: `/uploads/${file.filename}` })) : [];

  const property = await prisma.property.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      location,
      type,
      status,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      area: parseFloat(area),
      featured: featured === 'true',
      agentId,
      images: {
        create: imagesData
      }
    },
    include: { images: true }
  });

  res.status(201).json({ success: true, data: property });
};

// Endpoint Privado: Eliminar propiedad
export const deleteProperty = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const agentId = String((req as any).user.id);

  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    return res.status(404).json({ success: false, error: 'Propiedad no encontrada' });
  }

  // Verifica que solo el agente creador (o un admin supremo) pueda borrarla
  if (property.agentId !== agentId) {
    return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar esta propiedad' });
  }

  await prisma.property.delete({ where: { id } });

  res.json({ success: true, message: 'Propiedad eliminada correctamente' });
};

// Endpoint Privado: Actualizar propiedad
export const updateProperty = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const agentId = String((req as any).user.id);
  
  const existingProperty = await prisma.property.findUnique({ where: { id } });
  
  if (!existingProperty) {
    return res.status(404).json({ success: false, error: 'Propiedad no encontrada' });
  }

  if (existingProperty.agentId !== agentId) {
    return res.status(403).json({ success: false, error: 'No tienes permiso para editar esta propiedad' });
  }

  const { title, description, price, location, type, status, bedrooms, bathrooms, area, featured } = req.body;
  
  // Archivos de imagen subidos vía Multer
  const files = req.files as Express.Multer.File[];
  
  const updateData: any = {
    title,
    description,
    price: price ? parseFloat(price) : undefined,
    location,
    type,
    status,
    bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
    bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
    area: area ? parseFloat(area) : undefined,
    featured: featured !== undefined ? featured === 'true' || featured === true : undefined,
  };

  if (files && files.length > 0) {
    // Si se subieron nuevas imágenes, borramos las anteriores y creamos las nuevas
    await prisma.image.deleteMany({ where: { propertyId: id } });
    const imagesData = files.map(file => ({ url: `/uploads/${file.filename}` }));
    updateData.images = {
      create: imagesData
    };
  }

  const property = await prisma.property.update({
    where: { id },
    data: updateData,
    include: { images: true }
  });

  res.json({ success: true, data: property });
};
