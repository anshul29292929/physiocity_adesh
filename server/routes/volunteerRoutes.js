import express from 'express';
import { submitVolunteerForm } from '../controllers/volunteerController.js';

const volunteerRouter = express.Router();

volunteerRouter.post('/submit', submitVolunteerForm);

export default volunteerRouter;
