var express = require('express');
var router = express.Router();
var Users = require('../models/users.js');
var Prompts = require('../models/prompts.js');
var PromptBranches = require('../models/prompt-branches.js');
var PromptViews = require('../models/prompt-views.js');
var FollowedPrompts = require('../models/followed-prompts.js');

router.get('/search\/?', async function(req, res, next) {

	var user = false;

	if (req.session.username) {
        user = await Users.findOne({
            username: req.session.username
        }).exec();
    }

    var get = req.query;

    var searchText = '';
    var searchTags = [];
    var page = 1;
    var sort = 1;

    if(get.hasOwnProperty('q')){
    	searchText = get.q;
    }

    if(get.hasOwnProperty('tags')){
    	searchTags = get.tags.split(',');
    }

    if(get.hasOwnProperty('page')){
    	page = parseInt(get.page);
    }

    var sortData = {
        date_created : 'desc'
    };

    if(get.hasOwnProperty('sort')){
        sort = parseInt(get.sort);
        if(sort == 2){
            sortData = {
                view_count : 'desc'
            };
        }else if(sort == 3){
            sortData = {
                follow_count : 'desc'
            }
        }
    }

    var response = {
        status: 0
    };

    var itemPerPage = 10; //limits the item per page to 10

    var skip = itemPerPage * (page-1);

    Prompts.find({
	    $or : [
    		{ title : { $regex : searchText, $options: 'i' } },
    		{ content : { $regex : searchText, $options: 'i' } },
    		{ tags : { $regex : searchText, $options: 'i' } }
    	]
    })
    .skip(skip)
    .limit(itemPerPage)
    .sort(sortData).lean().exec(
    	async function(err, thePrompts){

    		if(!thePrompts){
    			thePrompts = [];
    		}else{
                for(var i = 0; i < thePrompts.length; i++){
                    thePrompts[i].stats = await getPromptStats(thePrompts[i]._id);
                }
            }

            Prompts.find({
                $or : [
                    { title : { $regex : searchText, $options: 'i' } },
                    { content : { $regex : searchText, $options: 'i' } },
                    { tags : { $regex : searchText, $options: 'i' } }
                ]
            })
            .count().exec(function(err, count){

                response.total_pages = Math.ceil(count / itemPerPage);

                response.prompts = thePrompts;
                response.user = user;
                response.total = count;
                response.query = {
					q : searchText,
					tags : searchTags.join(','),
					page : page,
                    sort : sort
				}
                res.render('prompts/search', response);
            });
	    }
    );	
});

async function addPromptView(prompt, username){ //need to be async for await to work

    var viewRecord = await PromptViews.findOne({ //await because before response, need to wait for database
        prompt_id : prompt._id,
        username : username
    }).exec();

    if(!viewRecord){
        var newViewRecord = new PromptViews({
            prompt_id : prompt._id,
            username : username,
            date_viewed : new Date()
        });

        var prompt = await Prompts.findOne({
            _id : prompt._id
        }).exec();

        prompt.view_count += 1;

        await prompt.save();

        return newViewRecord.save()
    }

    return;
}

function getAddedBranches(prompt){
	return PromptBranches.find({
		prompt_id : prompt._id
	})
	.sort({
		'position' : 'asc'
	})
	.populate({ //for joining
		path : 'branch'
	})
	.exec();
}

router.post('/get-prompt-stats\/?', async function(req, res, next) {

    var post = req.body; 
    var response = {
        status: 0
    };

    var stats = await getPromptStats(post.prompt_id);

    response.stats = stats;

    res.send(response);

});

async function getPromptStats(prompt_id){

    var stats = {
        views : 0,
        follows : 0
    };

    stats.views = await PromptViews.count({
        prompt_id : prompt_id
    });

    stats.follows = await FollowedPrompts.count({
        prompt : prompt_id
    });

    return stats;
}

router.post('/get-more-prompts\/?', function(req, res, next) {
    var post = req.body; 
    var response = {
        status: 0
    };

    
    res.send(response);
});

router.get('/view/*', function(req, res, next) {
//todo: '/view/:id'
    var id = req.url.replace('/view/', '');
  //todo:  req.params.id

    Prompts.findOne({
        _id : id 
    }).lean().exec(async function(err, prompt){

        if(!prompt){
            res.status(404);
            res.render('404');
            return;
        }         

        var username = req.session.username;

        if (username) {
            prompt.added_branches = await PromptBranches.find({
                prompt_id : prompt._id,
                username : username
            })
            .sort({
                'position' : 'asc'
            })
            .populate({ //for joining
                path : 'branch'
            })
            .exec();
        }else{
            prompt.added_branches = [];
        }

        var user = false;
        var mine = false;
        var following = 0;

        if(req.session.username){

	        user = await Users.findOne({
	            username: req.session.username
	        }).exec();

	        if(user){
	        	await addPromptView(prompt, req.session.username);

	        	if(prompt.username == user.username){
	        		mine = true;
	        	}

                following = await FollowedPrompts.count({
                    username : user.username,
                    prompt : prompt._id
                });
	    	}
    	}

        res.render('prompts/prompt', {
            user : user,
            prompt : prompt,
            mine : mine,
            following : following
        });

    });

});

module.exports = router;