import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalProperties = await prisma.property.count();
    
    const propertiesByStatus = await prisma.property.groupBy({
      by: ['status'],
      _count: {
        _all: true
      }
    });

    const propertiesByType = await prisma.property.groupBy({
      by: ['type'],
      _count: {
        _all: true
      }
    });

    const recentProperties = await prisma.property.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        images: {
          take: 1
        }
      }
    });

    const featuredCount = await prisma.property.count({
      where: {
        featured: true
      }
    });

    // Simple monthly distribution for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await prisma.property.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const distribution = Array(6).fill(0).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthName = months[d.getMonth()];
      const count = monthlyStats.filter(p => 
        p.createdAt.getMonth() === d.getMonth() && 
        p.createdAt.getFullYear() === d.getFullYear()
      ).length;
      return { month: monthName, count };
    });

    const [totalLeads, newLeadsCount, leadsByStatus, recentLeads] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NUEVO' } }),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
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
              name: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalProperties,
        featuredCount,
        propertiesByStatus,
        propertiesByType,
        recentProperties,
        monthlyDistribution: distribution,
        totalLeads,
        newLeadsCount,
        leadsByStatus,
        recentLeads
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
