import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Steam Analytics API Çalışıyor!');
});

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor...`);
});