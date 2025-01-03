import express from 'express';
import { setProjectRoutes } from './routes/projectRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

setProjectRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});