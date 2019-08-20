var express = require('express');
var router = express.Router();
var Users = require('../models/users.js');
var Prompts = require('../models/prompts.js');

router.get('/', function(req, res, next) {
	var user = false;

	Users.findOne({
		username : req.session.username
	},
	async function(err, user){
		var prompts = await Prompts.find().limit(5).sort({
			follow_count : 'desc'
		});
		res.render('index', { 
			user : user,
			prompts : prompts
		});
	});    
});

router.post('/get-more-prompts\/?', async function(req, res, next) {

	var post = req.body;
    var response = {
        status: 0
    };

    var skip = 0;

    skip = parseInt(post.skips) * 5;

	var prompts = await Prompts.find().skip(skip).limit(5).sort({
		follow_count : 'desc'
	});

	response.prompts = prompts;

	res.send(response);
});

router.get('/sign-up\/?', function(req, res, next) {
	if(req.session.username){
		res.redirect('/');
	}
	res.render('sign-up');
});

router.get('/not-found\/?', function(req, res, next) {
	res.render('404');
});



module.exports = router;