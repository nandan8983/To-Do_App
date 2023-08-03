const mongoose = require('mongoose');

module.exports.init = async () => {
    await mongoose.connect('mongodb+srv://app:app@ecommerce-web.jays7xs123.mongodb.net/ToDO_Data?retryWrites=true&w=majority');
    };