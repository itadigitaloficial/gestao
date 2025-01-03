import { Router } from 'express';
import ProjectController from '../controllers/projectController';

const router = Router();
const projectController = new ProjectController();

export function setProjectRoutes(app) {
    app.use('/api/projects', router);

    router.post('/', projectController.createProject.bind(projectController));
    router.get('/:id', projectController.getProject.bind(projectController));
    router.put('/:id', projectController.updateProject.bind(projectController));
    router.delete('/:id', projectController.deleteProject.bind(projectController));
}