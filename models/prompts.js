const mongoose = require("mongoose");

module.exports = mongoose.model("prompts", {
    username: {
    	type: String,
    	index: true
    },
    title: {
    	type: String,
    	index: true
    },
    content: {
        type: String,
        index: true,
        text: true
    },
    tags: {
        type: String,
        index: true
    },
    view_count: {
        type : Number,
        default : 0
    },
    follow_count: {
        type : Number,
        default : 0
    },
    date_created: { type : Date }
});