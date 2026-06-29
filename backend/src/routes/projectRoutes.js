import { Router } from 'express';
import { createProject, listProjects, getProject, updateProject, deleteProject } from '../controllers/projectController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validate } from '../middleware/errorHandler.js';
import { projectValidation, mongoIdParam, paginationQuery } from '../utils/validators.js';

const router = Router();

router.use(authMiddleware);

router.post('/', projectValidation, validate, createProject);
router.get('/', paginationQuery, validate, listProjects);
router.get('/:id', mongoIdParam, validate, getProject);
router.put('/:id', mongoIdParam, projectValidation, validate, updateProject);
router.delete('/:id', mongoIdParam, validate, deleteProject);

export default router;
