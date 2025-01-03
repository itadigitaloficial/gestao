class ProjectController {
    private projects: any[] = [];

    createProject(req: any, res: any) {
        const newProject = req.body;
        this.projects.push(newProject);
        res.status(201).json(newProject);
    }

    getProject(req: any, res: any) {
        const projectId = req.params.id;
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            res.status(200).json(project);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    }

    updateProject(req: any, res: any) {
        const projectId = req.params.id;
        const updatedData = req.body;
        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        
        if (projectIndex !== -1) {
            this.projects[projectIndex] = { ...this.projects[projectIndex], ...updatedData };
            res.status(200).json(this.projects[projectIndex]);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    }

    deleteProject(req: any, res: any) {
        const projectId = req.params.id;
        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        
        if (projectIndex !== -1) {
            this.projects.splice(projectIndex, 1);
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    }
}

export default ProjectController;