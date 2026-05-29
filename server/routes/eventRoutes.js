import express from 'express';
import { getEvents, getEventById, enrollInEvent, checkEnrollmentStatus, createEventOrder, verifyEventPayment, getMyEnrolledEvents } from '../controllers/eventController.js';

const eventRouter = express.Router();

eventRouter.get('/all', getEvents);
eventRouter.get('/:id', getEventById);
eventRouter.post('/enroll', enrollInEvent);
eventRouter.post('/check-enrollment', checkEnrollmentStatus);
eventRouter.post('/create-order', createEventOrder);
eventRouter.post('/verify-payment', verifyEventPayment);
eventRouter.post('/my-enrollments', getMyEnrolledEvents);

export default eventRouter;
