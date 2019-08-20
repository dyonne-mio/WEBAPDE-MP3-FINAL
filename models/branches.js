const mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = mongoose.model("branches", {
    username: {
    	type: String,
    	index: true
    },

    content: {
        type: String,
        index: true,
        text: true
    },
    
    prompt_id : {
        type: Schema.Types.ObjectId,
        index: true
    },
    date_created: { type : Date }
});