import Blog from '../models/Blog.js';
import BlogReadingList from '../models/BlogReadingList.js';
import slugify from 'slugify';
import { v2 as cloudinary } from 'cloudinary';


// Get all approved blogs (Public)
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            where: { status: 'approved' },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get blog by SLUG (Public)
export const getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ where: { slug: req.params.slug } });
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        res.status(200).json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin CRUD Operations
export const adminGetAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createBlog = async (req, res) => {
    try {
        const { title } = req.body;
        const imageFile = req.file;
        const slug = slugify(title, { lower: true, strict: true });
        
        let imageUrl = req.body.imageUrl;
        if (imageFile) {
            const uploadRes = await cloudinary.uploader.upload(imageFile.path);
            imageUrl = uploadRes.secure_url;
        }

        const blogData = {
            ...req.body,
            imageUrl,
            slug,
            authorId: req.auth.adminId || req.auth.userId,
            author: req.auth.adminId ? (req.body.author || 'Admin') : (req.user?.name || req.body.author || 'Student'),
            status: req.auth.adminId ? 'approved' : 'pending',
            tags: typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : (req.body.tags || []),
            isDraft: req.body.isDraft === 'true' || req.body.isDraft === true
        };

        const blog = await Blog.create(blogData);
        res.status(201).json({ success: true, message: 'Blog submitted for approval!', blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        
        // Authorization check: if user (not admin), they must be the author
        if (req.auth.userId && String(blog.authorId) !== String(req.auth.userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized to edit this blog' });
        }

        const imageFile = req.file;
        let updateData = { ...req.body };
        
        if (imageFile) {
            const uploadRes = await cloudinary.uploader.upload(imageFile.path);
            updateData.imageUrl = uploadRes.secure_url;
        }

        if (req.body.title) {
            updateData.slug = slugify(req.body.title, { lower: true, strict: true });
        }

        if (req.body.tags) {
            updateData.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
        }

        if (req.body.isDraft !== undefined) {
            updateData.isDraft = req.body.isDraft === 'true' || req.body.isDraft === true;
        }

        if (req.auth.adminId && req.body.status) {
            updateData.status = req.body.status;
        }
        
        await blog.update(updateData);
        res.status(200).json({ success: true, message: 'Blog updated!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            where: { authorId: req.auth.userId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approveBlog = async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        
        await blog.update({ status: 'approved' });
        res.status(200).json({ success: true, message: 'Blog approved!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

        // Authorization check: if user (not admin), they must be the author
        if (req.auth.userId && String(blog.authorId) !== String(req.auth.userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this blog' });
        }

        await blog.destroy();
        res.status(200).json({ success: true, message: 'Blog deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Toggle blog in user's reading list (Save / Unsave)
export const toggleReadingList = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const blogId = parseInt(req.params.blogId);

        const existing = await BlogReadingList.findOne({ where: { userId, blogId } });
        if (existing) {
            await existing.destroy();
            return res.json({ success: true, saved: false, message: 'Removed from reading list' });
        }
        await BlogReadingList.create({ userId, blogId });
        res.json({ success: true, saved: true, message: 'Added to reading list' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check if a specific blog is saved
export const checkReadingListStatus = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const blogId = parseInt(req.params.blogId);
        const existing = await BlogReadingList.findOne({ where: { userId, blogId } });
        res.json({ success: true, saved: !!existing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's full reading list with blog details
export const getReadingList = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const entries = await BlogReadingList.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        const blogIds = entries.map(e => e.blogId);
        if (blogIds.length === 0) return res.json({ success: true, blogs: [] });

        const blogs = await Blog.findAll({
            where: { id: blogIds }
        });
        res.json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
