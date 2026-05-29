import Event from '../models/Event.js';
import EventEnrollment from '../models/EventEnrollment.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Razorpay: Create Order for Event
export const createEventOrder = async (req, res) => {
    try {
        const { eventId, userId } = req.body;
        const event = await Event.findByPk(eventId);
        if (!event) return res.json({ success: false, message: 'Event Not Found' });

        const amount = Math.round(event.price * 100); // in paise
        const currency = process.env.CURRENCY || 'INR';

        const options = {
            amount,
            currency,
            receipt: `event_${eventId}_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Razorpay: Verify Payment and Enroll
export const verifyEventPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            eventId,
            name,
            email,
            userId,
            amount
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Check if already enrolled
            const existing = await EventEnrollment.findOne({ where: { eventId, email } });
            if (existing) {
                return res.json({ success: false, message: 'Already enrolled' });
            }

            // Create enrollment
            const enrollment = await EventEnrollment.create({
                eventId,
                userId: userId || null,
                name,
                email,
                amount,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                paymentStatus: 'completed'
            });

            res.json({ success: true, message: 'Payment Verified & Enrolled Successfully', enrollment });
        } else {
            res.json({ success: false, message: 'Payment Verification Failed' });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Public: Get all events
export const getEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            order: [['startDate', 'ASC'], ['date', 'ASC']]
        });
        res.json({ success: true, events });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Public: Get event by ID
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);
        if (!event) return res.json({ success: false, message: 'Event Not Found' });
        res.json({ success: true, event });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Public: Enroll in event
export const enrollInEvent = async (req, res) => {
    try {
        const { eventId, name, email, userId } = req.body;
        
        // Basic validation
        if (!eventId || !name || !email) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        const event = await Event.findByPk(eventId);
        if (!event) return res.json({ success: false, message: 'Event Not Found' });

        // Check if already enrolled (optional but good)
        const existing = await EventEnrollment.findOne({ where: { eventId, email } });
        if (existing) {
            return res.json({ success: false, message: 'Already enrolled with this email' });
        }

        const enrollment = await EventEnrollment.create({
            eventId,
            name,
            email,
            userId: userId || null
        });

        res.json({ success: true, message: 'Successfully enrolled in event!', enrollment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Public: Check Enrollment Status
export const checkEnrollmentStatus = async (req, res) => {
    try {
        const { eventId, email } = req.body;
        if (!eventId || !email) return res.json({ success: false, message: 'Missing fields' });

        const enrollment = await EventEnrollment.findOne({ where: { eventId, email } });
        res.json({ success: true, isEnrolled: !!enrollment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Admin: Create Event
export const adminCreateEvent = async (req, res) => {
    try {
        const eventData = JSON.parse(req.body.eventData);
        if (req.file) {
            const baseUrl = process.env.BACKEND_URL || 'https://physiocity.org';
            eventData.image = `${baseUrl}/uploads/events/${req.file.filename}`;
        }
        
        const event = await Event.create(eventData);
        res.json({ success: true, message: 'Event Created Successfully', event });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Admin: Update Event
export const adminUpdateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const eventData = JSON.parse(req.body.eventData);
        const event = await Event.findByPk(id);
        
        if (!event) return res.json({ success: false, message: 'Event Not Found' });

        if (req.file) {
            // Delete old image if it exists locally
            if (event.image && event.image.includes('/uploads/events/')) {
                const oldFilename = event.image.split('/').pop();
                const oldPath = path.join('uploads', 'events', oldFilename);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            const baseUrl = process.env.BACKEND_URL || 'https://physiocity.org';
            eventData.image = `${baseUrl}/uploads/events/${req.file.filename}`;
        }

        await event.update(eventData);
        res.json({ success: true, message: 'Event Updated Successfully', event });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Admin: Delete Event
export const adminDeleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);
        
        if (!event) return res.json({ success: false, message: 'Event Not Found' });

        // Delete image file if it exists locally
        if (event.image && event.image.includes('/uploads/events/')) {
            const filename = event.image.split('/').pop();
            const filePath = path.join('uploads', 'events', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await event.destroy();
        res.json({ success: true, message: 'Event Deleted Successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// User: Get My Enrolled Events
export const getMyEnrolledEvents = async (req, res) => {
    try {
        const { userId } = req.body; // In this project, userId is often passed in body or headers
        if (!userId) return res.json({ success: false, message: 'User ID required' });

        const enrollments = await EventEnrollment.findAll({
            where: { userId },
            include: [{ 
                model: Event, 
                as: 'Event' // Match association alias from associations.js (default is model name)
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, enrollments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Admin: Get Enrolled Candidates for an Event
export const getEventEnrollments = async (req, res) => {
    try {
        const { id } = req.params; // eventId
        const enrollments = await EventEnrollment.findAll({
            where: { eventId: id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, enrollments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Admin: Delete Enrollment
export const adminDeleteEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        const enrollment = await EventEnrollment.findByPk(id);
        
        if (!enrollment) return res.json({ success: false, message: 'Enrollment Not Found' });

        await enrollment.destroy();
        res.json({ success: true, message: 'Enrollment removed successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
