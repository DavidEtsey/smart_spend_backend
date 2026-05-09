const prisma = require('./prisma.js');

const customizeCategory = async (customData, user_id) => {

    const {name,icon}=customData;

    const categoryData= await prisma.categories.create({
        data: {
            name,
            icon,
            users: {
                connect: {user_id},
            },
        },
    })
    
    return categoryData;

}

module.exports = { customizeCategory };