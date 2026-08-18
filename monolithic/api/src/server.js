import express from 'express';

const app = express();


app.set('trust proxy', true);


// middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// cors
import cors from 'cors';
import { corsOption } from "./utils/security/cors.js";
app.use(cors(corsOption));


// cookie-parser
import cookieParser from 'cookie-parser';
app.use(cookieParser());


// important security middleware
import helmet from "helmet";
import hpp from "hpp";
app.use(helmet());
app.use(hpp());

export default app;
