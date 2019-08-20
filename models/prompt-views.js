const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var promptViewsSchema = new Schema({
    username: {
        type: String
    },
    prompt_id : {
        type : Schema.Types.ObjectId
    },
    date_viewed: { type: Date }
});

promptViewsSchema.index({username: 1, prompt_id: 1}, {unique: true});

module.exports = mongoose.model("prompt_views", promptViewsSchema);