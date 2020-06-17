import { ExpressReceiver } from "@slack/bolt";
import { Request, Response } from "express";

export const registerKeepAlive = (receiver: ExpressReceiver) => {
  receiver.app.get('/keep-alive', (req: Request, res: Response) => {
    res.statusCode = 200;
    return res.json({});
  });
};
