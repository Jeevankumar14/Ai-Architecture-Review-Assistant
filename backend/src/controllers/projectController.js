import projectService from '../services/projectService.js';

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.create(req.user._id, req.body);
    res.status(201).json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

export const listProjects = async (req, res, next) => {
  try {
    const result = await projectService.listByUser(req.user._id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getById(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.update(req.params.id, req.user._id, req.body);
    res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.delete(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
