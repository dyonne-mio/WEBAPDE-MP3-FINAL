const mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = mongoose.model("hidden_branches", {
    branch : {
        type: Schema.Types.ObjectId,
        ref: 'branches',
        index: true
    },
    username: {
        type: String,
        index: true
    },
    date_added: { type : Date }
});