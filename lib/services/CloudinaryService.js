const Post = require('../models/Post');
const cloudinary = require('../utils/cloudinary')

module.exports = class CloudinaryService {

    static createPost(reqBody) {
        const fileStr = reqBody.imageData;

        return cloudinary.uploader.upload(fileStr, {
            upload_preset: 'dev_setups'
        })
            .then(upload => Post.insert({ ...reqBody, imageData: upload.secure_url }))
    }

}