var express = require('express');
var router = express.Router();

var CryptoJS = require('crypto-js');

var Users = require('../models/users.js');
var Prompts = require('../models/prompts.js');
var Branches = require('../models/branches.js');
var PromptViews = require('../models/prompt-views.js');
var PromptBranches = require('../models/prompt-branches.js');
var FollowedPrompts = require('../models/followed-prompts.js');
var Activities = require('../models/activities.js');
var HiddenBranches = require('../models/hidden-branches.js');

/* GET users listing. */
router.get('/dashboard\/?', function(req, res, next) {
    if (!req.session.username) {
        res.redirect('/');
    } else {
        Users.findOne({
            username: req.session.username
        }, (err, user) => {
            if (!user) {
                req.session.username = false;
                res.redirect('/');
            } else {
                res.render('users/user-dashboard', { user: user });
            }
        })
    }
});

function addActivity(activity, username){
    var activity = new Activities({
        username : username,
        activity : activity,
        date_created : new Date()
    });
    return activity.save();
}

router.post('/get-activities\/?', async function(req, res, next){
    var post = req.body;
    var response = {
        status: 0
    };

    var username = req.session.username;

    if (!username) {
        response.status = -1;
        res.status(403);
        res.send(response);
        return;
    }

    var activities = await Activities.find({
        username : username
    }).sort({
        date_created : 'desc'
    }).exec();

    response.activities = activities;

    res.send(response);
});

router.get('/logout\/?', function(req, res, next) {
    req.session.username = false;
    res.redirect('/');
});

router.post('/save-branches\/?', async function(req, res, next){
    var post = req.body;

    var response = {
        status: 0
    };

    var username = req.session.username;

    if (!username) {
        response.status = -1;
        res.status(403);
        res.send(response);
        return;
    }

    await PromptBranches.find({
        prompt_id : post.prompt_id,
        username : username
    }).remove().exec();

    if( Object.prototype.toString.call( post['branches[]'] ) !== '[object Array]' ) {
        var arr = [];
        if(post['branches[]']){
            arr.push(post['branches[]']);
        }
        post['branches[]'] = arr;
    }

    for(var i = 0; i < post['branches[]'].length; i++){
        var newPromptBranches = new PromptBranches({
            branch : post['branches[]'][i],
            prompt_id : post.prompt_id,
            username : username,
            position : i,
            date_added : new Date()
        });

        await newPromptBranches.save();
    }

    res.send(response);
});

router.post('/delete-branch\/?', function(req, res, next) {
	var post = req.body;
    var response = {
        status: 0
    };

    var username = req.session.username;

    if (!username) {
        response.status = -1;
        res.status(403);
        res.send(response);
        return;
    }

    var newHiddenBranch = new HiddenBranches({
        branch : post.branch_id,
        username : username,
        date_added : new Date
    }).save().then(function(){
        res.send(response);
    },function(){
        response.status = -1;
        res.status(500);
        res.send(response);
    });

});

router.post('/submit-branch\/?', async function(req, res, next) {

    var post = req.body;
    var response = {
        status: 0
    };

    var username = req.session.username;

    if (!username) {
        response.status = -1;
        res.status(403);
        res.send(response);
        return;
    }

    var branchData = {
        username : username,
        date_created : new Date(),
        content : post.content
    };

    if(post.prompt_id != "false"){
        branchData.prompt_id = post.prompt_id;
    }

    if(post.sub_id != "false"){
        branchData.sub_id = post.sub_id;
    }

    var newBranch = new Branches(branchData).save().then(async function(branch){
        res.send(response);

        var prompt = await Prompts.findOne({
            _id : post.prompt_id
        }).exec();

        await addActivity('Submitted a branch to prompt '+prompt.title+'.', username);
    }, function(err){
        response.status = 1;
        response.error = err;
        res.send(response);
    });

});

router.post('/get-branches\/?', async function(req, res, next) {

    var post = req.body;
    var response = {
        status: 0
    };

    var filter = {
        prompt_id : post.prompt_id
    };

    var username = req.session.username;

    var excludedBranchesIds = [];

    if(username){
        filter = {
            $and : [
                {prompt_id : post.prompt_id},
                {username : username}
            ]
        };

        var promptsBranches = await PromptBranches.find(filter).exec();

        for(var i = 0; i < promptsBranches.length; i++){
            excludedBranchesIds.push(promptsBranches[i].branch);
        }

        var hiddenBranches = await HiddenBranches.find({
            username : username
        }).exec();

        for(var i = 0; i < hiddenBranches.length; i++){
            excludedBranchesIds.push(hiddenBranches[i].branch);
        }

    }else{
        excludedBranchesIds = [];
    }

    Branches.find({
        $and : [
            {
                prompt_id : post.prompt_id
            },
            {
                _id : {
                    $nin  : excludedBranchesIds            
                }
            }
        ]
    }).lean().exec(async function(err, branches){
        // for(var i = 0; i < branches.length; i++){
        // 	var branch = branches[i];
        // 	branches[i] = await findSubBranches(branch);
        // 	//console.log(branches[i]);
        // }
        response.branches = branches;
        res.send(response);
    });
});

async function findSubBranches(branch){
	var branches = [];
	branches = await findSubBranchesDB(branch);

	if(branches.length){
		for(var i = 0; i < branches.length; i++){
			var subBranch = branches[i];
			branches[i] = await findSubBranches(subBranch);
		}
	}

	branch.sub_branches = branches;

	return branch;
}

function findSubBranchesDB(branch){
	return Branches.find({
		sub_id : branch._id
	}).lean().exec()
}

router.post('/login\/?', function(req, res, next) {
    var post = req.body;
    var response = {
        status: 0
    };

    var username = post.username;
    var password = CryptoJS.MD5(post.password).toString();

    console.log(password);

    Users.findOne({
        username: username,
        password: password
    }, (err, doc) => {
        if (err) {
            //res.send(err)
        } else if (!doc) {
            response.status = 1;
        } else {
            req.session.username = doc.username;
        }
        res.send(response);
    })
});

router.post('/sign-up\/?', async function(req, res, next) {
    var post = req.body;

    var response = {
        status: 0
    };

    post.birth_date = new Date(post.birth_date);

    var newUser = new Users({
        username: post.username,
        password: CryptoJS.MD5(post.password).toString(),
        first_name: post.first_name,
        middle_name: post.middle_name,
        last_name: post.last_name,
        email: post.email,
        birth_date: post.birth_date
    });

    newUser.save().then(async (user) => {
        req.session.username = user.username;
        await addActivity('Joined Writer\'s Block', user.username);
        res.send(response);
    }, (error) => {
        response.status = 1;
        res.send(response);
    });
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
//'prompt/:id'
router.post('/follow-prompt\/?', async function(req, res, next) {
    var post = req.body;

    var response = {
        status: 0
    };

    var username = req.session.username;

    if (!username) {
        response.status = -1;
        res.send(response);
        return;
    }

    var prompt = await Prompts.findOne({
        _id : post.prompt_id
    }).exec();

    if(prompt){
        if(prompt.username == username){
            response.status = 1;
            res.send(response);
            return;
        }
    }

    var followedPrompt = await FollowedPrompts.findOne({
        username : username,
        prompt : post.prompt_id
    }).exec();

    if(followedPrompt){


        await FollowedPrompts.deleteOne({
            username : username,
            prompt : post.prompt_id
        });
        response.followed = 0;

        prompt.follow_count -= 1;

        await prompt.save();

        await addActivity('Unfollowed prompt '+prompt.title+'.', username);

    }else{

        var newFollow = new FollowedPrompts({
            username : username,
            prompt : post.prompt_id
        });

        await newFollow.save();

        await addActivity('Followed prompt '+prompt.title+'.', username);

        prompt.follow_count += 1;

        await prompt.save();

        response.followed = 1;
    }

    res.send(response);
});


router.post('/delete-prompt\/?', async function(req, res, next) {
    var post = req.body;

    var response = {
        status: 0
    };

    var username = req.session.username;

    if (!username) {
        response.status = -1;
        res.status(403);
        res.send(response);
    }

    var prompt = await Prompts.findOne({
        _id : post.prompt_id
    }).exec();

    if(prompt){
        Prompts.deleteOne({
            _id : post.prompt_id
        }).exec(async function(err){
            if(err){
                response.status = 1;
            }else{
                await addActivity('Deleted prompt '+prompt.title+'.', username);
            }
            res.send(response);
        });
    }
});

router.post('/submit-prompt\/?', function(req, res, next) {
    var post = req.body;

    var response = {
        status: 0
    };

    var username = req.session.username;

    if (!username) {
        response.status = -1;
        res.status(403);
        res.send(response);
    }

    var newPrompt = new Prompts({
        username: username,
        title: post.title,
        content: post.content,
        tags: post.tags,
        view_count: 0,
        date_created: new Date()
    });

    newPrompt.save().then(async (user) => {
        res.send(response);
        await addActivity('Created prompt '+post.title+'.', username);
    }, (error) => {
    	console.log(error);
        response.status = 1;
        res.send(response);
    });
});

router.post('/get-user-prompts\/?', function(req, res, next) {
    var post = req.body;

    var response = {
        status: 0
    };

    var itemPerPage = 10;

    var username = req.session.username;

    if (!username) {
        response.status = -1;
        res.status(403);
        res.send(response);
        return;
    }

    var skip = itemPerPage * (post.page-1);

    Prompts.find({
    	$and: [
    	    { username: username },
    	    { 
    	    	$or : [
    	    		{ title : { $regex : post.search_query, $options: 'i' } },
    	    		{ content : { $regex : post.search_query, $options: 'i' } },
    	    		{ tags : { $regex : post.search_query, $options: 'i' } }
    	    	]
    	    }
    	]
    })
    .skip(skip)
    .limit(itemPerPage)
    .sort({
    	date_created : 'desc'
    }).lean().exec(
    	function(err, thePrompts){
            Prompts.find({
                $and: [
                    { username: username },
                    { 
                        $or : [
                            { title : { $regex : post.search_query, $options: 'i' } },
                            { content : { $regex : post.search_query, $options: 'i' } },
                            { tags : { $regex : post.search_query, $options: 'i' } }
                        ]
                    }
                ]
            })
            .count().exec(async function(err, count){

                for(var i = 0; i < thePrompts.length; i++){
                    thePrompts[i].stats = await getPromptStats(thePrompts[i]._id);
                }

                response.prompts = thePrompts;
                response.total_pages = Math.ceil(count / itemPerPage);
                res.send(response);
            });
	    }
    );
});

router.post('/save-password\/?', async function(req, res, next) {
    var post = req.body;

    var response = {
        status: 0
    };

    var username = req.session.username;

    if (!username) {
        response.status = -1;
        res.status(403);
        res.send(response);
        return;
    }

    var user = await Users.findOne({
        username : username
    }).exec();

    var oldPassword = CryptoJS.MD5(post.old_password).toString(); //cryptojs

    if(oldPassword == user.password){
        user.password = CryptoJS.MD5(post.password).toString();
        await user.save();
    }else{
        response.status = 2;
    }

    res.send(response);
});

router.post('/get-user-followed-prompts\/?', function(req, res, next) {
    var post = req.body;

    var response = {
        status: 0
    };

    var itemPerPage = 10;

    var username = req.session.username;

    if (!username) {
        response.status = -1;
        res.status(403);
        res.send(response);
        return;
    }

    var skip = itemPerPage * (post.page-1);

    FollowedPrompts.find({
        username : username,
    }).populate({ //for joining 
        path : 'prompt',
        match : {
            $or : [ //where:
                { title : { $regex : post.search_query, $options: 'i' } },
                { content : { $regex : post.search_query, $options: 'i' } },
                { tags : { $regex : post.search_query, $options: 'i' } }
            ]
        }//if wala, return null
    }).skip(skip)
    .limit(itemPerPage)
    .sort({
        date_followed : 'desc'
    }).lean().exec(async function(err, thePrompts){ //lean = return object instead of documents (so we can add new attr)
//skipping items
        var count = 0;

        for(var i = 0; i < thePrompts.length; i++){ //looping prompts
            if(!thePrompts[i].prompt){
                thePrompts.splice(i, 1);
                i -= 1;
            }else{
                thePrompts[i].prompt.stats = await getPromptStats(thePrompts[i].prompt._id); //assigning value to stats
            }
        }

        response.prompts = thePrompts;
        response.total_pages = Math.ceil(thePrompts.length / itemPerPage);
        res.send(response);
    });
});

module.exports = router;