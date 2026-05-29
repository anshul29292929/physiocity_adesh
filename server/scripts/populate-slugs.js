import { sequelize } from '../configs/db.js';
import Blog from '../models/Blog.js';
import slugify from 'slugify';

const populateSlugs = async () => {
    try {
        console.log('--- Connecting to DB ---');
        await sequelize.authenticate();
        
        // Sync to ensure 'slug' column exists
        console.log('--- Syncing Models ---');
        await sequelize.sync();
        
        console.log('--- Fetching Blogs ---');
        const blogs = await Blog.findAll();
        
        if (blogs.length === 0) {
            console.log('No blogs found to update.');
            process.exit(0);
        }

        for (const blog of blogs) {
            if (!blog.slug) {
                const slug = slugify(blog.title, { lower: true, strict: true });
                await blog.update({ slug });
                console.log(`Updated slug for: ${blog.title} -> ${slug}`);
            } else {
                console.log(`Slug already exists for: ${blog.title}`);
            }
        }
        
        console.log('--- Slug population complete ---');
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
};

populateSlugs();
