import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
//app.use(cors({origin: 'http://localhost:5173'})); //TODO: Configure CORS later
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use('/api', routes)

export default app;