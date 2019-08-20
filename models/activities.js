const mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = mongoose.model("activities", {
    username: {
    	type: String,
    	index: true
    },
    activity: {
        type: String,
        index: true,
        text: true
    },
    date_created: { type : Date }
});