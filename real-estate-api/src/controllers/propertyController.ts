import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// Helper para parsear números opcionales desde FormData
const parseOptionalFloat = (val: any): number | null => {
  if (val === undefined || val === null || val === '' || val === 'null' || val === 'undefined') return null;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? null : parsed;
};

const parseOptionalInt = (val: any): number | null => {
  if (val === undefined || val === null || val === '' || val === 'null' || val === 'undefined') return null;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? null : parsed;
};

const parseAmenities = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
      } catch {
        return [];
      }
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

// Endpoint Público: Búsqueda veloz y avanzada de propiedades
export const getProperties = async (req: Request, res: Response) => {
  const { location, type, status, maxPrice, minBedrooms, minBathrooms, minGarages, stratum } = req.query;

  const filters: any = {};

  if (location) {
    filters.OR = [
      { location: { contains: String(location), mode: 'insensitive' } },
      { title: { contains: String(location), mode: 'insensitive' } },
      { code: { contains: String(location), mode: 'insensitive' } }
    ];
  }
  
  if (type && type !== 'Todos') {
    filters.type = String(type);
  }

  if (status && status !== 'Todos') {
    filters.status = String(status);
  }

  if (maxPrice && maxPrice !== 'Sin Límite') {
    const parsedPrice = parseInt(String(maxPrice).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsedPrice)) {
      filters.price = { lte: parsedPrice };
    }
  }

  if (minBedrooms && minBedrooms !== 'Todos' && Number(minBedrooms) > 0) {
    filters.bedrooms = { gte: parseInt(String(minBedrooms), 10) };
  }

  if (minBathrooms && minBathrooms !== 'Todos' && Number(minBathrooms) > 0) {
    filters.bathrooms = { gte: parseInt(String(minBathrooms), 10) };
  }

  if (minGarages && minGarages !== 'Todos' && Number(minGarages) > 0) {
    filters.garages = { gte: parseInt(String(minGarages), 10) };
  }

  if (stratum && stratum !== 'Todos' && Number(stratum) > 0) {
    filters.stratum = parseInt(String(stratum), 10);
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

import { StorageService } from '../services/storageService';

// Endpoint Privado: Crear propiedad (Requiere JWT)
export const createProperty = async (req: Request, res: Response) => {
  try {
    const agentId = String((req as any).user.id);
    const {
      code,
      title,
      description,
      price,
      adminFee,
      location,
      latitude,
      longitude,
      type,
      status,
      propertyCondition,
      bedrooms,
      bathrooms,
      garages,
      area,
      builtArea,
      stratum,
      floor,
      yearBuilt,
      amenities,
      videoUrl,
      virtualTourUrl,
      featured
    } = req.body;
    
    // Archivos de imagen subidos vía Multer (ahora en memoria)
    const files = req.files as Express.Multer.File[];
    
    // Subir cada archivo a Supabase Storage (o disco local)
    const uploadPromises = files ? files.map(file => StorageService.uploadFile(file, 'properties')) : [];
    const imageUrls = await Promise.all(uploadPromises);
    
    const imagesData = imageUrls.map(url => ({ url }));

    const generatedCode =
      code && String(code).trim().length > 0
        ? String(code).trim().toUpperCase()
        : `CR-${Math.floor(1000 + Math.random() * 9000)}`;

    const property = await prisma.property.create({
      data: {
        code: generatedCode,
        title,
        description,
        price: parseFloat(price),
        adminFee: parseOptionalFloat(adminFee),
        location,
        latitude: parseOptionalFloat(latitude),
        longitude: parseOptionalFloat(longitude),
        type,
        status,
        propertyCondition: propertyCondition ? String(propertyCondition) : 'Excelente',
        bedrooms: parseInt(bedrooms, 10) || 0,
        bathrooms: parseInt(bathrooms, 10) || 0,
        garages: parseInt(garages, 10) || 0,
        area: parseFloat(area),
        builtArea: parseOptionalFloat(builtArea),
        stratum: parseOptionalInt(stratum),
        floor: parseOptionalInt(floor),
        yearBuilt: parseOptionalInt(yearBuilt),
        amenities: parseAmenities(amenities),
        videoUrl: videoUrl && String(videoUrl).trim() ? String(videoUrl).trim() : null,
        virtualTourUrl: virtualTourUrl && String(virtualTourUrl).trim() ? String(virtualTourUrl).trim() : null,
        featured: featured === 'true' || featured === true,
        agentId,
        images: {
          create: imagesData
        }
      },
      include: { images: true }
    });

    res.status(201).json({ success: true, data: property });
  } catch (error: any) {
    console.error('[createProperty] Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al crear la propiedad' });
  }
};

// Endpoint Privado: Eliminar propiedad
export const deleteProperty = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const user = (req as any).user;
  const agentId = String(user.id);
  const userRole = user.role;

  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    return res.status(404).json({ success: false, error: 'Propiedad no encontrada' });
  }

  // Verifica que sea el creador O un administrador
  if (property.agentId !== agentId && userRole !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar esta propiedad' });
  }

  await prisma.property.delete({ where: { id } });

  res.json({ success: true, message: 'Propiedad eliminada correctamente' });
};

// Endpoint Privado: Actualizar propiedad
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = (req as any).user;
    const agentId = String(user.id);
    const userRole = user.role;
    
    const existingProperty = await prisma.property.findUnique({ 
      where: { id },
      include: { images: true }
    });
    
    if (!existingProperty) {
      return res.status(404).json({ success: false, error: 'Propiedad no encontrada' });
    }

    if (existingProperty.agentId !== agentId && userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'No tienes permiso para editar esta propiedad' });
    }

    const {
      code,
      title,
      description,
      price,
      adminFee,
      location,
      latitude,
      longitude,
      type,
      status,
      propertyCondition,
      bedrooms,
      bathrooms,
      garages,
      area,
      builtArea,
      stratum,
      floor,
      yearBuilt,
      amenities,
      videoUrl,
      virtualTourUrl,
      featured
    } = req.body;
    const files = req.files as Express.Multer.File[];
    
    const updateData: any = {
      title,
      description,
      price: price ? parseFloat(price) : undefined,
      location,
      type,
      status,
      bedrooms: bedrooms !== undefined ? parseInt(bedrooms, 10) : undefined,
      bathrooms: bathrooms !== undefined ? parseInt(bathrooms, 10) : undefined,
      garages: garages !== undefined ? parseInt(garages, 10) || 0 : undefined,
      area: area ? parseFloat(area) : undefined,
      featured: featured !== undefined ? featured === 'true' || featured === true : undefined,
    };

    if (code !== undefined) {
      updateData.code = code && String(code).trim() ? String(code).trim().toUpperCase() : existingProperty.code;
    }
    if (propertyCondition !== undefined) {
      updateData.propertyCondition = propertyCondition ? String(propertyCondition) : 'Excelente';
    }
    if (adminFee !== undefined) {
      updateData.adminFee = parseOptionalFloat(adminFee);
    }
    if (builtArea !== undefined) {
      updateData.builtArea = parseOptionalFloat(builtArea);
    }
    if (stratum !== undefined) {
      updateData.stratum = parseOptionalInt(stratum);
    }
    if (floor !== undefined) {
      updateData.floor = parseOptionalInt(floor);
    }
    if (yearBuilt !== undefined) {
      updateData.yearBuilt = parseOptionalInt(yearBuilt);
    }
    if (amenities !== undefined) {
      updateData.amenities = parseAmenities(amenities);
    }
    if (videoUrl !== undefined) {
      updateData.videoUrl = videoUrl && String(videoUrl).trim() && videoUrl !== 'null' ? String(videoUrl).trim() : null;
    }
    if (virtualTourUrl !== undefined) {
      updateData.virtualTourUrl = virtualTourUrl && String(virtualTourUrl).trim() && virtualTourUrl !== 'null' ? String(virtualTourUrl).trim() : null;
    }
    if (latitude !== undefined) {
      updateData.latitude = parseOptionalFloat(latitude);
    }
    if (longitude !== undefined) {
      updateData.longitude = parseOptionalFloat(longitude);
    }

    if (files && files.length > 0) {
      // 1. Eliminar imágenes anteriores
      const deletePromises = existingProperty.images.map(img => StorageService.deleteFile(img.url));
      await Promise.all(deletePromises);

      // 2. Eliminar de la DB
      await prisma.image.deleteMany({ where: { propertyId: id } });

      // 3. Subir nuevas
      const uploadPromises = files.map(file => StorageService.uploadFile(file, 'properties'));
      const imageUrls = await Promise.all(uploadPromises);
      
      updateData.images = {
        create: imageUrls.map(url => ({ url }))
      };
    }

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: { images: true }
    });

    res.json({ success: true, data: property });
  } catch (error: any) {
    console.error('[updateProperty] Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al actualizar' });
  }
};
