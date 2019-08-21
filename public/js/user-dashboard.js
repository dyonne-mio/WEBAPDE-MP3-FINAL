var promptText = $('#prompt-text');
var promptTags = $('#prompt-tags');

var promptTitle = $('#prompt-title');

var submitPromptBtn = $('#submit-prompt-btn');

var searchUserPromptText = $('#search-user-prompt-text');

var noPromptsMessage = $('#no-prompts-message');
var userPromptsList = $('#user-prompts-list');

var promptsAccordion = $('#prompts-accordion');
var userPromptPagination = $('#user-prompt-pagination');

var userFollowedPromptsList = $('#user-followed-prompts-list');
var followedPromptsAccordion = $('#followed-prompts-accordion');
var userFollowedPromptPagination = $('#user-followed-prompt-pagination');
var noFollwedPromptsMessage = $('#no-follwed-prompts-message');

var searchUserFollowedPromptText = $('#search-user-followed-prompt-text');

var savePasswordBtn = $('#save-password-btn');

var activityTable = $('#activity-table');

activityTable.dataTable({
    "paging": true,
    "searching": true,
    order: [
        [1, "desc"]
    ],
    "columns": [
        { "name": "Activity", 'data': "activity" },
        {
            "name": "Date",
            'data': function(row) {
                return moment(row.date_created).startOf('minute').fromNow();
            }
        }
    ]
});

function getActivities() {
    xhrj(
        '/user/get-activities', {},
        function(response) {
            if (response.status === 1) {
                error('Error', 'Somethings has gone wrong :(');
            } else {
                activityTable.clearDataTable();
                activityTable.addRows(response.activities);
            }
        }
    );
}

getActivities();

promptText.summernote({
    height: 200
});

promptTags.tagsinput();

submitPromptBtn.click(function() {
    var title = promptTitle.val();
    var content = promptText.summernote('code');
    var tags = promptTags.tagsinput('items');

    if (!title) {
        promptTitle.focus();
        return;
    }

    var filteredContent = $(content).text().replace(/\s+/g, '');

    if (filteredContent.length == 0) {
        promptText.summernote('focus');
        return;
    }

    if (tags.length == 0) {
        promptTags.tagsinput('focus');
        return;
    }


    tags = tags.join(",");

    xhrj(
        '/user/submit-prompt', {
            title: title,
            content: content,
            tags: tags
        },
        function(response) {
            if (response.status === 1) {
                error('Error', 'Somethings has gone wrong :(');
            } else {
                success('Success', 'Prompt successfully added!');
                getActivities();
                promptTitle.val('');
                promptText.summernote('reset');
                promptTags.tagsinput('removeAll');
                searchUserPromptText.trigger('keyup');
            }
        }
    );
});

var t1 = null;
var searchPromptCurrentPage = 1;

addDocumentListener('click', 'user-prompt-page-item', function(element, event) {
    var page = element.data('page');
    console.log(page);
    searchPromptCurrentPage = page;

    searchUserPromptText.trigger('keyup');
});

searchUserPromptText.on('keydown', function() {
    searchPromptCurrentPage = 1;
});

addDocumentListener('click', 'del-prompt-btn', function(element, event) {
    var id = element.data('id');
    confirm('Delete', 'Are you sure you want to delete this prompt?', function(yes) {
        if (yes) {
            xhrj(
                '/user/delete-prompt', {
                    prompt_id: id
                },
                function(response) {
                    if (response.status == 0) {
                        success('Success', 'Successfully deleted.', function() {
                            searchUserPromptText.val('');
                            searchUserPromptText.trigger('keyup');
                            getActivities();
                        });
                    } else {
                        error('Error', 'Something is wrong :(');
                    }
                }
            );
        }
    });
});

searchUserPromptText.on('keyup', function() {

    if (t1) {
        clearTimeout(t1);
        t1 = null;
    }

    t1 = setTimeout(function() {

        xhrj(
            '/user/get-user-prompts', {
                search_query: searchUserPromptText.val(),
                page: searchPromptCurrentPage
            },
            function(response) {
                var prompts = response.prompts;

                if (prompts.length) {

                    var totalPages = response.total_pages;

                    userPromptPagination.html('');

                    for (var i = 1; i <= totalPages; i++) {
                        userPromptPagination.append(
                            '<li data-page=' + i + ' class="user-prompt-page-item page-item"><a class="page-link">' + i + '</a></li>'
                        );
                    }

                    userPromptPagination.find('li').removeClass('active');
                    userPromptPagination.find('li[data-page="' + searchPromptCurrentPage + '"]').addClass('active');

                    userPromptsList.show();
                    noPromptsMessage.hide();

                    promptsAccordion.html('');

                    $.each(prompts, function(i, prompt) {

                        var tags = prompt.tags.split(',');

                        var tagsString = '';

                        $.each(tags, function(i, tag) {
                            tagsString += '<span class="badge badge-primary mr-1">' + tag + '</span>';
                        });

                        var prompt = [
                            '<div class="card">',
                                '<div class="card-header" id="headingOne">',
                                    '<h6 class="mb-0">',
                                        '<button class="btn btn-link" data-toggle="collapse" data-target="#post-' + prompt._id + '" aria-expanded="true" aria-controls="collapseOne">',
                                            prompt.title,
                                        '</button>',
                                        '<a class="btn btn-success float-right mt-1" style="font-size: .600rem;" href="/prompts/view/' + prompt._id + '">VIEW MORE</a>',
                                        '<div class="mt-2 ml-2" style="float: right;">',
                                            '<span class="mr-3">',
                                                '<span class="fa fa-eye"></span> ',
                                                simplifyNumber(prompt.stats.views, 0),
                                            '</span>',
                                            '<span class="mr-3">',
                                                '<span class="fa fa-heart"></span> ',
                                                simplifyNumber(prompt.stats.follows, 0),
                                            '</span>',
                                        '</div>',
                                    '</h6>',
                                '</div>',
                                '<div id="post-' + prompt._id + '" class="collapse" aria-labelledby="headingOne" data-parent="#prompts-accordion">',
                                    '<div class="card-body">',
                                        '<div class="mb-3">',
                                            '<i style="color: gray;">',
                                                'posted ',
                                                moment(prompt.date_created).startOf('minute').fromNow(),
                                                '<span data-id="' + prompt._id + '"" class="del-prompt-btn fa fa-trash ml-2 cp"></span>',
                                            '</i>',
                                        '</div>',
                                        prompt.content,
                                        '<div class="mt-3">',
                                            '<span class="fa fa-tags mr-1 mt-4"></span>',
                                            tagsString,
                                        '</div>',                                        
                                    '</div>',
                                '</div>',
                            '</div>'
                        ].join('');

                        promptsAccordion.append(prompt);
                    });
                } else {
                    userPromptsList.hide();
                    noPromptsMessage.show();
                }


            }
        );

        clearTimeout(t1);
        t1 = null;
    }, 250);
});

searchUserPromptText.trigger('keyup');

searchUserPromptText.on('keydown', function() {
    searchPromptCurrentPage = 1;
});

var t2 = null;
var searchFollowedPromptCurrentPage = 1;

addDocumentListener('click', 'user-followed-prompt-page-item', function(element, event) {
    var page = element.data('page');
    searchFollowedPromptCurrentPage = page;
    searchUserPromptText.trigger('keyup');
});



searchUserFollowedPromptText.on('keyup', function() {

    if (t2) {
        clearTimeout(t2);
        t2 = null;
    }

    t2 = setTimeout(function() {

        xhrj(
            '/user/get-user-followed-prompts', {
                search_query: searchUserFollowedPromptText.val(),
                page: searchFollowedPromptCurrentPage
            },
            function(response) {
                var prompts = response.prompts;

                if (prompts.length) {

                    var totalPages = response.total_pages;

                    userFollowedPromptPagination.html('');

                    for (var i = 1; i <= totalPages; i++) {
                        userFollowedPromptPagination.append(
                            '<li data-page=' + i + ' class="user-followed-prompt-page-item page-item"><a class="page-link">' + i + '</a></li>'
                        );
                    }

                    userFollowedPromptPagination.find('li').removeClass('active');
                    userFollowedPromptPagination.find('li[data-page="' + searchFollowedPromptCurrentPage + '"]').addClass('active');

                    userFollowedPromptsList.show();
                    noFollwedPromptsMessage.hide();

                    followedPromptsAccordion.html('');

                    $.each(prompts, function(i, follow) {

                        var prompt = follow.prompt;

                        if (!prompt) return;

                        var tags = prompt.tags.split(',');

                        var tagsString = '';

                        $.each(tags, function(i, tag) {
                            tagsString += '<span class="badge badge-primary mr-1">' + tag + '</span>';
                        });

                        var promptString = [
                            '<div class="card">',
                                '<div class="card-header" id="headingOne">',
                                    '<h6 class="mb-0">',
                                        '<button class="btn btn-link" data-toggle="collapse" data-target="#post-' + prompt._id + '" aria-expanded="true" aria-controls="collapseOne">',
                                            prompt.title,
                                        '</button>',
                                        '<a class="btn btn-success float-right mt-1" style="font-size: .600rem;" href="/prompts/view/' + prompt._id + '">VIEW MORE</a>',                                        
                                        '<div class="mt-2 ml-2" style="float: right;">',
                                            '<span class="mr-3">',
                                                '<span class="fa fa-eye"></span> ',
                                                simplifyNumber(prompt.stats.views, 0),
                                            '</span>',
                                            '<span class="mr-3">',
                                                '<span class="fa fa-heart"></span> ',
                                            simplifyNumber(prompt.stats.follows, 0),
                                                '</span>',
                                        '</div>',
                                    '</h6>',
                                '</div>',
                                '<div id="post-' + prompt._id + '" class="collapse" aria-labelledby="headingOne" data-parent="#prompts-accordion">',
                                    '<div class="card-body">',
                                        '<div class="mb-3">',
                                            '<i style="color: gray;">',
                                                '<b>' + prompt.username + '</b> posted ',
                                                moment(prompt.date_created).startOf('minute').fromNow(),
                                            '</i>',
                                        '</div>',
                                        prompt.content,
                                        '<div class="mt-3">',
                                            '<span class="fa fa-tags mr-1 mt-4"></span>',
                                            tagsString,
                                        '</div>',
                                    '</div>',
                                '</div>',
                            '</div>'
                        ].join('');

                        followedPromptsAccordion.append(promptString);
                    });
                } else {
                    userFollowedPromptsList.hide();
                    noFollwedPromptsMessage.show();
                }


            }
        );

        clearTimeout(t2);
        t2 = null;
    }, 250);
});

searchUserFollowedPromptText.trigger('keyup');

searchUserFollowedPromptText.on('keydown', function() {
    searchFollowedPromptCurrentPage = 1;
});

var password = $('#password');
var rPassword = $('#r-password');
var passwordForm = $('#password-form');
var changePasswordModal = $('#change-password-modal');

savePasswordBtn.click(function() {


	if(!$('#old-password').val()){
		!$('#old-password').focus();
		return;
	}

	if(!password.val()){
		password.focus();
		return;
	}

	if(!rPassword.val()){
		rPassword.focus();
		return;
	}


    if (password.val() != rPassword.val()) {
        error("Error", "Passwords must be the same.");
        return;
    }

    showLoading();

    xhrj(
        '/user/save-password',
        passwordForm.serialize(),
        function(response) {
            if (response.status === 0) {
                success('Success', 'Password successfully changed.', function() {
                    changePasswordModal.modal('hide')
                    passwordForm[0].reset();
                });
            }else if(response.status === 2){
            	error('Error', 'Old password is wrong');
            } else {
                error('Error', 'Failed to save.');
            }
        }
    );
})