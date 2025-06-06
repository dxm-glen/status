import type { Response } from "express";

export function createErrorResponse(res: Response, status: number, message: string, details?: any) {
  return res.status(status).json({ message, ...(details && { details }) });
}

export function createSuccessResponse(res: Response, data: any, message?: string) {
  return res.json({ ...(message && { message }), ...data });
}

export function handleAsyncRoute(handler: (req: any, res: any) => Promise<void>) {
  return async (req: any, res: any) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error("Route error:", error);
      createErrorResponse(res, 500, "Internal server error");
    }
  };
}

export function requireAuth(req: any, res: Response): number | null {
  const userId = req.session.userId;
  if (!userId) {
    createErrorResponse(res, 401, "Not authenticated");
    return null;
  }
  return userId;
}