import express from 'express';
import {
    getAllBlogs,
    getBlogBySlug,
    adminGetAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    getMyBlogs,
    approveBlog,
    toggleReadingList,
    checkReadingListStatus,
    getReadingList
} from '../controllers/blogController.js';
import upload from '../configs/multer.js';
import userAuth from '../middlewares/userAuth.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const blogRouter = express.Router();

// Specific named routes MUST come before the wildcard /:slug
// User routes
blogRouter.get('/my-blogs', userAuth, getMyBlogs);
// Reading List routes (must come before /:slug wildcard)
blogRouter.get('/reading-list', userAuth, getReadingList);
blogRouter.post('/reading-list/toggle/:blogId', userAuth, toggleReadingList);
blogRouter.get('/reading-list/status/:blogId', userAuth, checkReadingListStatus);

blogRouter.put('/update/:id', userAuth, upload.single('image'), updateBlog);
blogRouter.post('/create', userAuth, upload.single('image'), createBlog);
blogRouter.delete('/:id', userAuth, deleteBlog);

// Admin Routes
blogRouter.get('/admin/all', protectAdmin, adminGetAllBlogs);
blogRouter.post('/admin', upload.single('image'), protectAdmin, createBlog);
blogRouter.patch('/admin/approve/:id', protectAdmin, approveBlog);
blogRouter.patch('/admin/:id', upload.single('image'), protectAdmin, updateBlog);
blogRouter.delete('/admin/:id', protectAdmin, deleteBlog);

// Public routes — wildcard LAST to avoid swallowing specific routes
blogRouter.get('/', getAllBlogs);
blogRouter.get('/:slug', getBlogBySlug);

export default blogRouter;
