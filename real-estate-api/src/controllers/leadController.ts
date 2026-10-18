import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

const VALID_STATUSES = [
  'NUEVO',
  'CONTACTADO',
  'VISITA_AGENDADA',
  'EN_NEGOCIACION',
  'CERRADO',
  'DESCARTADO'
] as const;

const VALID_SOURCES = [
  'WEB_PROPIEDAD',
  'WHATSAPP_PROPIEDAD',
  'WEB_CONTACTO',
  'WHATSAPP_CONTACTO'
] as const;

/**
 * Endpoint Público: Registrar un nuevo Lead / Prospecto desde la web
 */
export const createLead = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      source = 'WEB_CONTACTO',
      preferredDate,
      propertyId
    } = req.body;

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es obligatorio (mínimo 2 caracteres).'
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: 'Debes proporcionar al menos un correo electrónico o un teléfono.'
      });
    }

    if (!message || String(message).trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje es obligatorio.'
      });
    }

    let assignedAgentId: string | null = null;
    let validPropertyId: string | null = null;

    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: String(propertyId) },
        select: { id: true, agentId: true }
      });

      if (property) {
        validPropertyId = property.id;
        assignedAgentId = property.agentId;
      }
    }

    let parsedDate: Date | null = null;
    if (preferredDate) {
      const d = new Date(preferredDate);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    }

    const normalizedSource = VALID_SOURCES.includes(source as any)
      ? String(source)
      : 'WEB_CONTACTO';

    const lead = await prisma.lead.create({
      data: {
        name: String(name).trim(),
        email: email ? String(email).trim() : '',
        phone: phone ? String(phone).trim() : null,
        message: String(message).trim(),
        source: normalizedSource,
        status: parsedDate ? 'VISITA_AGENDADA' : 'NUEVO',
        preferredDate: parsedDate,
        propertyId: validPropertyId,
        assignedAgentId
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true
          }
        },
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ success: true, data: lead });
  } catch (error: any) {
    console.error('[createLead] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar tu solicitud. Intenta nuevamente.'
    });
  }
};

/**
 * Endpoint Privado: Obtener listado de Leads con filtros y resumen de conteo por estado
 */
export const getLeads = async (req: Request, res: Response) => {
  try {
    const { status, source, assignedAgentId, propertyId, search } = req.query;

    const where: any = {};

    if (status && status !== 'TODOS') {
      where.status = String(status);
    }

    if (source && source !== 'TODOS') {
      where.source = String(source);
    }

    if (assignedAgentId && assignedAgentId !== 'TODOS') {
      where.assignedAgentId = String(assignedAgentId);
    }

    if (propertyId) {
      where.propertyId = String(propertyId);
    }

    if (search && String(search).trim() !== '') {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
        { property: { title: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const [leads, countsByStatus] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              price: true,
              status: true,
              images: {
                take: 1,
                select: { url: true }
              }
            }
          },
          assignedAgent: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              imageUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { _all: true }
      })
    ]);

    const statusSummary: Record<string, number> = {
      TODOS: 0,
      NUEVO: 0,
      CONTACTADO: 0,
      VISITA_AGENDADA: 0,
      EN_NEGOCIACION: 0,
      CERRADO: 0,
      DESCARTADO: 0
    };

    for (const item of countsByStatus) {
      statusSummary[item.status] = item._count._all;
      statusSummary.TODOS += item._count._all;
    }

    res.json({
      success: true,
      data: leads,
      summary: statusSummary
    });
  } catch (error: any) {
    console.error('[getLeads] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el listado de leads'
    });
  }
};

/**
 * Endpoint Privado: Actualizar un Lead (estado, notas de seguimiento, agente asignado, fecha visita)
 */
export const updateLead = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, notes, preferredDate, assignedAgentId } = req.body;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Lead no encontrado'
      });
    }

    const updateData: any = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Estado de lead no válido'
        });
      }
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes === null ? null : String(notes);
    }

    if (preferredDate !== undefined) {
      if (!preferredDate) {
        updateData.preferredDate = null;
      } else {
        const parsed = new Date(preferredDate);
        if (!isNaN(parsed.getTime())) {
          updateData.preferredDate = parsed;
        }
      }
    }

    if (assignedAgentId !== undefined) {
      updateData.assignedAgentId = assignedAgentId || null;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            status: true,
            images: {
              take: 1,
              select: { url: true }
            }
          }
        },
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            imageUrl: true
          }
        }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[updateLead] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el lead'
    });
  }
};

/**
 * Endpoint Privado: Eliminar un Lead
 */
export const deleteLead = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Lead no encontrado'
      });
    }

    await prisma.lead.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Lead eliminado correctamente'
    });
  } catch (error: any) {
    console.error('[deleteLead] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el lead'
    });
  }
};
