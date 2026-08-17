const prisma = require('./prisma.js');

const getCategories =async (user_id,type) => {
    const category= await prisma.category.findMany({
       where:{
            OR: [
                { user_id: null }, // System categories
                { user_id: user_id } // User's custom categories
            ],
            type: type
        },
        select: {
            category_id: true,
            name: true,
            type: true,
            icon: true
        }
    });

    return category;
}

const customizeCategory = async (user_id, type,name) => {
    const newCategory = await prisma.category.create({
        data: {
            user_id,
            type,
            name
        }
    });
    return newCategory;
}

module.exports = { customizeCategory,getCategories };