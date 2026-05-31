import { WhatsAppLog, WhatsAppChatMessage } from '../models/associations.js';
import { Op } from 'sequelize';
import { syncCampaignConversions } from '../utils/conversionUtils.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Admin online tracking for disabling auto-reply
const getAdminActivityPath = () => path.join(process.cwd(), 'admin_active.txt');
const updateAdminActivity = () => { try { fs.writeFileSync(getAdminActivityPath(), String(Date.now())); } catch (e) { } };
const isAdminOnline = () => {
    try {
        if (fs.existsSync(getAdminActivityPath())) {
            const lastActive = parseInt(fs.readFileSync(getAdminActivityPath(), 'utf8'), 10);
            return (Date.now() - lastActive) < 15000; // 15 seconds
        }
    } catch (e) { }
    return false;
};