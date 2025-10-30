import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const favoriteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: z.enum(['Movie', 'TV Show']),
  director: z.string().min(1, 'Director is required').max(200),
  budget: z.string().min(1, 'Budget is required'),
  location: z.string().min(1, 'Location is required').max(200),
  duration: z.string().min(1, 'Duration is required'),
  year: z.string().min(4).max(4),
  posterUrl: z.string().url().optional().or(z.literal('')),
});

export const createFavorite = async (req, res) => {
  try {
    const validatedData = favoriteSchema.parse(req.body);
    
    const favorite = await prisma.favorite.create({
      data: {
        ...validatedData,
        userId: req.user.userId,
        posterUrl: validatedData.posterUrl || null,
      },
    });

    res.status(201).json(favorite);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create favorite' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const { page = '1', limit = '10', type, year, budgetMin, budgetMax, search } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId: req.user.userId, 
    };

    if (type) {
      where.type = type;
    }

    if (year) {
      where.year = year;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { director: { contains: search } },
      ];
    }

    if (budgetMin || budgetMax) {
      const budgetFilter = [];
      if (budgetMin && budgetMax) {
        const min = parseFloat(budgetMin);
        const max = parseFloat(budgetMax);
        where.budget = {
          AND: [
            { gte: min.toString() },
            { lte: max === 999 ? '9999999' : max.toString() },
          ],
        };
      }
    }

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.favorite.count({ where }),
    ]);

    res.json({
      data: favorites,
      total,
      page: pageNum,
      limit: limitNum,
      hasMore: skip + favorites.length < total,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};

export const updateFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = favoriteSchema.parse(req.body);


    const existing = await prisma.favorite.findFirst({
      where: { id: parseInt(id), userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    const favorite = await prisma.favorite.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        posterUrl: validatedData.posterUrl || null,
      },
    });

    res.json(favorite);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update favorite' });
  }
};

export const deleteFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.favorite.findFirst({
      where: { id: parseInt(id), userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    await prisma.favorite.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Favorite deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
};
