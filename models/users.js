const mongoose = require("mongoose");

module.exports = mongoose.model("users", { //modeLName, datatype
    username: {
    	type: String,
    	index: true,
    	unique: true 
    },
    password: {
    	type: String,
    	index: true
    },
    first_name: String,
    middle_name: String,
    last_name: String,
    email: {
    	type: String,
    	index: true,
    	unique: true 
    },
    birth_date: { type: Date }
});