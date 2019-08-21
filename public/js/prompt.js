var replyTa = $('#reply-ta');
var submitPromptBtn = $('#submit-prompt-btn');
var branchesDiv = $('#branches-div');

var replyBranchTa = $('#reply-branch-ta');
var replyBranchBtn = $('#reply-branch-btn');

var replyModal = $('#reply-modal');

var totalViewsText = $('#total-views-text');
var totalFollowedText = $('#total-followed-text');

var branchesList = $('#branches-list');
var addedBranchesList = $('#added-branches-list');

var addBranchBtn = $('#add-branch-btn');

var followPromptBtn = $('#follow-prompt-btn');

addBranchBtn.click(function(){
	if(!currentUser){
		loginModal.modal('show');
	}else{
		replyModal.modal('show');
	}
});

replyTa.summernote({
	height: 150
});

replyBranchTa.summernote({
	height: 150
});

var selectedReplyBranchId = null;

mine = mine == "true" ? true : false;

console.log(currentUser);

if(currentUser != ""){
	new Sortable($('#branches-list')[0], {
	    group: {
	        name: 'shared',
	        //pull: 'clone',
	        put: false 
	    },
	    onMove: function (/**Event*/evt, /**Event*/originalEvent) {

	    	if($('#added-branches-list li').length == 0){
	    		return true;
	    	}else{
	    		if($(evt.related).index() == $('#added-branches-list li').length-1 && evt.willInsertAfter){
	    			return true;
	    		}else{
	    			return false;
	    		}
	    	}
		},
	    animation: 150,
	    sort: false 
	});

	new Sortable($('#added-branches-list')[0], {
	    scroll: true,
	    filter: '.disabled',
	    onMove: function(event){
	         return !event.related.classList.contains('disabled');
	    },
	    onEnd: function(event){
	    	savePromptBranches();
	    },
	    onAdd: function(event) {
	        var element = $(event.item);

	        savePromptBranches();

	        element.addClass('disabled');

	        element.find('.delete-branch-btn').remove();

	        element.find('.branch-user-info').after(
	            [
	                '<div class="remove-branch-btn" style="float: right;">',
	                	'<span style="color: gray; font-size: .9rem;" class="cp fa fa-window-close"></span>',
	                '</div>'
	            ].join('')
	        );
	    },
	    group: 'shared',
	    animation: 150
	});
}

followPromptBtn.click(function(){
	xhrj(
		'/user/follow-prompt',
		{
			prompt_id : prompt_id
		},
		function(response){
			if(response.status == 0){
				setFollowStatus(response.followed);
				getPromptStats();
			}else if(response.status == -1){
				loginModal.modal('show');
			}else if(response.status == 1){
				error('Error', "Can't follow your own prompt.");
			}
		}
	);
});

function setFollowStatus(status){
	if(status == 1){
		followPromptBtn.css('color', 'red');
	}else{
		followPromptBtn.css('color', 'black');
	}
}

addDocumentListener('click', 'remove-branch-btn', function(element) {
    var li = element.parents('li');
    li.nextAll('li').remove();
    li.remove();   
    savePromptBranches(function(){
	    loadBranches();  	
    });
});

addDocumentListener('click', 'delete-branch-btn', function(element){
	var id = element.data('id');
	confirm('Delete branch', 'Are you sure you want to delete this branch?', function(yes){
		if(yes){
			xhrj(
				'/user/delete-branch',
				{
					branch_id : id
				},
				function(response){
					if(response.status === 0){
						success('Deleted', 'Branch deleted.', function(){
							//$('li[data-id='+id+']').remove();
							//savePromptBranches();
							loadBranches();
						});
					}else{
						error('Error', 'Failed to delete branch');
					}
				}
			)
		}
	});
});

var branchColors = ['#D7ECD9','#F6ECF5','#C7CEEA','#FFFAC9','#C7EEFF'];

function reconstructColors(){
	var i = 0;

	$.each(branchesList.find('blockquote'), function(index, element){

		$(element).attr('style', 'background-color: '+branchColors[i]+"!important;");

		i+=1;

		if(i == branchColors.length){
			i = 0;
		}
	});

	i = 0;

	$.each(addedBranchesList.find('blockquote'), function(index, element){

		$(element).attr('style', 'background-color: '+branchColors[i]+"!important;");

		i+=1;

		if(i == branchColors.length){
			i = 0;
		}
	});
}

reconstructColors();

function savePromptBranches(callback){
	var data = {};
	data.branches = [];

	$.each(addedBranchesList.find('li'), function(i, element){
		data.branches.push($(element).data('id'));
	});

	data.prompt_id = prompt_id;

	showLoading();

	xhrj(
		'/user/save-branches',
		data,
		function(response){
			if(callback){
				callback();
			}
			dismiss();
			reconstructColors();
		}
	);
}

function getPromptStats(){
	xhrj(
		'/prompts/get-prompt-stats',
		{
			prompt_id : prompt_id
		},
		function(response){
			var stats = response.stats;
			if(response.status === 0){
				totalViewsText.html(simplifyNumber(stats.views,0));
				totalFollowedText.html(simplifyNumber(stats.follows,0))
			}
		}
	);
}

getPromptStats();

replyBranchBtn.click(function(){
	if(prompt_id){
		xhrj(
			'/user/submit-branch',
			{
				sub_id : false,
				prompt_id : prompt_id,
				content : replyBranchTa.summernote('code')
			},
			function(response){
				if(response.status === 0){
					success('Success', 'Branch reply submitted.', function(){
						replyModal.modal('hide');
					});
					replyBranchTa.summernote('reset');
					loadBranches();
				}else{
					error('Error', response.error.message);
				}
			}
		);
	}
});

addDocumentListener('click', 'reply-branch-sub-btn', function(element){
	selectedReplyBranchId = element.data('id');
});

submitPromptBtn.click(function(){

	xhrj(
		'/user/submit-branch',
		{
			prompt_id : prompt_id,
			sub_id : false,
			content : replyTa.summernote('code')
		},
		function(response){
			if(response.status === 0){
				success('Success', 'Branch submitted.');
				replyTa.summernote('reset');
				loadBranches();
			}else{
				error('Error', response.error.message);
			}
		}
	);

});


function loadBranches(){
	xhrj(
		'/user/get-branches',
		{
			prompt_id : prompt_id
		},
		function(response){
			var branches = response.branches;
			branchesList.html('');

			$.each(branches, function(i, branch){

				var delButton = '';

				if(currentUser != ""){
					delButton = [
									'<div data-id="'+branch._id+'" class="delete-branch-btn" style="float: right;">',
				                		'<span style="color: gray; font-size: .9rem;" class="cp fa fa-window-close"></span>',
				                	'</div>'
				                ].join('');
				}

				branchesList.append([
					'<li data-id="'+branch._id+'" class="disabled">',
                        '<div class="branch-item" class="mb-3">',
                            '<blockquote class="blockquote blockquote-custom bg-white p-3 shadow rounded">',
                                '<div class="mb-3">',
                                    '<a href="#" class="text-info mr-2">'+branch.username+'</a>',
                                    '<i class="branch-user-info" style="color: gray; font-size: .9rem;">',
                                        'posted ',
                                        moment(branch.date_created).startOf('minute').fromNow(),
                                    '</i>',
					              	delButton,
                                '</div>',
                                '<div class="branch-content">',
                                    branch.content,
                                '</div>',
                            '</blockquote>',
                        '</div>',
                    '</li>'
				].join(''));
			});

			reconstructColors();

			// $.each(branches, function(i, branch){
			// 	generateBranch(branch);
			// });
		}
	)
}

function generateBranch(branch){

	var markUp = '';

	if(!branch.hasOwnProperty('sub_id')){
		
		var markUp = [
			'<div class="card mb-3">',
		        '<div class="card-body">',
		            '<div id="branch-'+branch._id+'" class="row mb-3">',
		                '<div class="col-md-12">',
		                    '<p>',
		                        '<a class="float-left" href="#"><strong>'+branch.username+'</strong></a>',
		                    '</p>',
		                    '<div class="clearfix"></div>',
		                    '<div>',
		                    	branch.content,
	                    	'</div>',
		                    '<p>',
		                        '<a data-id="'+branch._id+'" data-toggle="modal" data-target="#reply-modal" class="reply-branch-sub-btn float-right btn btn-outline-primary"> <i class="fa fa-reply"></i> Reply</a>',
		                        '<a class="float-right btn text-white btn-danger mx-2"> <i class="fa fa-heart"></i> Like</a>',
		                        '<a data-toggle="collapse" data-target=".branch-'+branch._id+'-sub" class="float-right btn text-white btn-success '+(branch.sub_branches.length == 0 ? 'hide' : '')+'"> <i class="fa fa-eye"></i></a>',
		                    '</p>',
		                '</div>',
		            '</div>',
		            '<div id="branch-'+branch._id+'-sub-branches">',

		            '</div>',
		        '</div>',
		    '</div>'
	    ].join('');

    	branchesDiv.append(markUp);

	}else if(branch.hasOwnProperty('sub_id')){

		var markUp = [
			'<div class="card mb-3 ml-5 collapse branch-'+branch.sub_id+'-sub">',
		        '<div class="card-body">',
		            '<div id="branch-'+branch._id+'" class="row mb-3">',
		                '<div class="col-md-12">',
		                    '<p>',
		                        '<a class="float-left" href="#"><strong>'+branch.username+'</strong></a>',
		                    '</p>',
		                    '<div class="clearfix"></div>',
		                    '<div>',
		                    	branch.content,
	                    	'</div>',
		                    '<p>',
		                        '<a data-id="'+branch._id+'" data-toggle="modal" data-target="#reply-modal" class="reply-branch-sub-btn float-right btn btn-outline-primary"> <i class="fa fa-reply"></i> Reply</a>',
		                        '<a class="float-right btn text-white btn-danger mx-2"> <i class="fa fa-heart"></i> Like</a>',
		                        '<a data-toggle="collapse" data-target=".branch-'+branch._id+'-sub" class="float-right btn text-white btn-success '+(branch.sub_branches.length == 0 ? 'hide' : '')+'"> <i class="fa fa-eye"></i></a>',
		                    '</p>',
		                '</div>',
		            '</div>',
		            '<div id="branch-'+branch._id+'-sub-branches">',

		            '</div>',
		        '</div>',
		    '</div>'
	    ].join('');
	    $('#branch-'+branch.sub_id+'-sub-branches').append(markUp);
	}

    if(branch.sub_branches.length > 0){
    	$.each(branch.sub_branches, function(i, subBranch){
    		generateBranch(subBranch)
    	});
    }
}

loadBranches();