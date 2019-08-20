const mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = mongoose.model("prompt_branches", {
    branch : {
        type: Schema.Types.ObjectId,
        ref: 'branches',
        index: true
    },
    prompt_id: {
        type: Schema.Types.ObjectId,
        index: true
    },
    username : {
        type: String,
        index : true
    },
    position: { type : Number },
    date_added: { type : Date }
});