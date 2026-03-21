import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import type { AuthRequest } from '../middlewares/auth.middleware';

export const applyForGuide = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { reportText, title, bio } = req.body;
    const documentUrl = req.body.documentUrl;

    if (!reportText) {
      return res.status(400).json({ error: 'Report text is required' });
    }

    const application = await prisma.guideApplication.upsert({
      where: { userId },
      update: { reportText, documentUrl, status: 'PENDING' },
      create: { userId, reportText, documentUrl, status: 'PENDING' },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { guideStatus: 'PENDING', guideTitle: title || null, guideBio: bio || null },
    });

    res.status(200).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Error applying for guide:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGuides = async (req: Request, res: Response) => {
  try {
    const guides = await prisma.user.findMany({
      where: { isGuide: true, guideStatus: 'APPROVED' },
      select: {
        id: true, name: true, guideTitle: true, guideBio: true,
        profile: { select: { avatar: true, bio: true } }
      }
    });
    res.status(200).json(guides);
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGuideById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const guide = await prisma.user.findFirst({
      where: { id: parseInt(id), isGuide: true, guideStatus: 'APPROVED' },
      select: {
        id: true, name: true, guideTitle: true, guideBio: true, phoneNumber: true,
        profile: { select: { avatar: true, bio: true } }
      }
    });

    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    const { phoneNumber, ...publicGuide } = guide;
    res.status(200).json(publicGuide);
  } catch (error) {
    console.error('Error fetching guide:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Session Management API

export const requestSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { guideId } = req.body;

    if (userId === parseInt(guideId)) return res.status(400).json({ error: 'Cannot request a session with yourself' });

    const guide = await prisma.user.findUnique({ where: { id: parseInt(guideId), isGuide: true } });
    if (!guide) return res.status(404).json({ error: 'Guide not found' });

    const existingSession = await prisma.guidanceSession.findFirst({
      where: { userId, guideId: parseInt(guideId), status: { in: ['PENDING', 'ACCEPTED'] } }
    });
    if (existingSession) return res.status(400).json({ error: 'Session already exists' });

    const session = await prisma.guidanceSession.create({
      data: { userId, guideId: parseInt(guideId), status: 'PENDING' }
    });
    res.status(201).json({ message: 'Session requested', session });
  } catch (error) {
    console.error('Error requesting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIncomingSessions = async (req: AuthRequest, res: Response) => {
  try {
    const guideId = req.user!.id;
    const sessions = await prisma.guidanceSession.findMany({
      where: { guideId, status: 'PENDING' },
      include: { user: { select: { id: true, name: true, email: true, profile: { select: { avatar: true } } } } }
    });
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching incoming sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const respondToSession = async (req: AuthRequest, res: Response) => {
  try {
    const guideId = req.user!.id;
    const sessionId = req.params.sessionId as string;
    const { status, mood, goal } = req.body;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const session = await prisma.guidanceSession.findFirst({ where: { id: sessionId, guideId } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const data: any = { status };
    if (mood) data.mood = mood;
    if (goal) data.goal = goal;

    const updatedSession = await prisma.guidanceSession.update({
      where: { id: sessionId }, data
    });
    res.status(200).json({ message: 'Session updated', session: updatedSession });
  } catch (error) {
    console.error('Error responding to session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSessionIntent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId as string;
    const { mood, goal, summary } = req.body;

    const session = await prisma.guidanceSession.findUnique({ where: { id: sessionId } });
    if (!session || (session.userId !== userId && session.guideId !== userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const data: any = {};
    if (mood !== undefined) data.mood = mood;
    if (goal !== undefined) data.goal = goal;
    if (summary !== undefined && session.guideId === userId) data.summary = summary;

    const updated = await prisma.guidanceSession.update({
      where: { id: sessionId },
      data
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const sessions = await prisma.guidanceSession.findMany({
      where: { OR: [{ userId, status: 'ACCEPTED' }, { guideId: userId, status: 'ACCEPTED' }] },
      include: {
        user: { select: { id: true, name: true, phoneNumber: true, profile: { select: { avatar: true } } } },
        guide: { select: { id: true, name: true, guideTitle: true, profile: { select: { avatar: true } } } }
      }
    });

    const sanitizedSessions = sessions.map(session => {
      const sanitizedUser = { ...session.user };
      if (!session.isDetailsShared || userId !== session.guideId) delete (sanitizedUser as any).phoneNumber;
      return { ...session, user: sanitizedUser };
    });
    res.status(200).json(sanitizedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSessionMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId as string;
    const session = await prisma.guidanceSession.findUnique({ where: { id: sessionId } });

    if (!session || (session.userId !== userId && session.guideId !== userId)) {
      return res.status(403).json({ error: 'Unauthorized access to session' });
    }

    const messages = await prisma.guidanceMessage.findMany({
      where: { sessionId }, orderBy: { createdAt: 'asc' },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const shareSessionDetails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId as string;
    const session = await prisma.guidanceSession.findFirst({ where: { id: sessionId, userId } });

    if (!session) return res.status(404).json({ error: 'Session not found' });

    const updatedSession = await prisma.guidanceSession.update({
      where: { id: sessionId }, data: { isDetailsShared: true }
    });
    res.status(200).json({ message: 'Details shared successfully', session: updatedSession });
  } catch (error) {
    console.error('Error sharing details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
