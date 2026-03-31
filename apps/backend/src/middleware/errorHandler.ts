import {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";

export function errorHandler(
    err : unknown, 
    _req : Request, 
    res : Response, 
    _next : NextFunction
) {

    console.log(err);
    res.status(500).json({
        message:"An unexpected error occured"
    });
}

export function asyncHandler(
     fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
        return (req , res ,next ) => {
            Promise.resolve(fn(req,res,next)).catch(next);
        }
     }

