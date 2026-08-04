const prisma = require('./prisma.js');

const customizeCategory = async (customData, user_id) => {

    const { name, icon, type, user_id: categoryUser_id } = customData;

    const categoryData = await prisma.category.create({
        data: {
            name,
            icon,
            type,
            user_id: categoryUser_id,
            users: categoryUser_id ? {
                connect: { user_id: categoryUser_id }
            } : undefined
        }
    });
    
    return categoryData;

}

module.exports = { customizeCategory };