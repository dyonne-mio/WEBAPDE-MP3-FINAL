const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var followedPromptsSchema = new Schema({
    username: {
        type: String,
        index: true
    },
    prompt: {
        type : Schema.Types.ObjectId,
        ref: 'prompts',
        index: true
    },
    date_followed: { type: Date }
});

followedPromptsSchema.index({username: 1, prompt: 1}, {unique: true});

module.exports = mongoose.model("followed_prompts", followedPromptsSchema);