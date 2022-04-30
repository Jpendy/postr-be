const Post = require('../models/Post');
const cloudinary = require('../utils/cloudinary')

module.exports = class CloudinaryService {

    static createPost(reqBody) {
        const fileStr = reqBody.imageData;

        return cloudinary.uploader.upload(fileStr, {
            upload_preset: process.env.CLOUDINARY_UPLOAD_SETTINGS
        })
            .then(({ secure_url, public_id }) => {
                return Post.insert({
                    ...reqBody,
                    imageData: secure_url,
                    cloudinaryImagePublicId: public_id
                })
            })
    }

    static deleteFromCloud(publicId) {
        if (!publicId) return;
        return cloudinary.api.delete_all_resources(publicId)
    }
}