var signUpForm = $('#sign-up-form');
var signUpBtn = $('#sign-up-btn');


signUpBtn.click(function(){
	var formData = signUpForm.getFormData();
	//formData.birth_date = new Date(formData.birth_date);

	var hasEmpty = false;

	signUpForm.find('input').each(function(){
		if(!$(this).val()){
			console.log(1);
			$(this).focus();
			hasEmpty = true;
			return false;
		}
	})

	if(hasEmpty) return;

	if(formData.password !== formData.r_password){
		error('Error', 'Password Mismatch.');
		return;
	}

	xhrj(
		'/user/sign-up',
		formData,
		function(response){
			if(response.status === 0){
				success('Sign up successful!', 'You have successfully created an account!', function(){
					window.location.href = "/user/dashboard/";
				});
			}else{
				error('Error', 'Sign up failed :(');
			}
		}
	)
});

var skips = 0;

$('#show-more-prompts-btn').click(function(){
	skips += 1;
	$('#show-more-prompts-btn').attr('disabled', 'disabled');
	xhrj(
		'/get-more-prompts',
		{skips : skips},
		function(response){
			var prompts = response.prompts;

			if(prompts.length == 0){
				skips -= 1;
			}else{
				$.each(prompts, function(i, prompt){

					var tags = prompt.tags.split(',');

                    var tagsString = '';

                    $.each(tags, function(i, tag) {
                        tagsString += '<span class="badge badge-primary mr-1">' + tag + '</span>';
                    });

					var html = [
						'<div id="post-'+prompt._id+'" class="col-12" style="display: none;">',
	                        '<div class="card col-6 p-0 mx-auto mb-2">',
	                            '<div class="card-header" id="">',
	                                '<h6 class="mb-0">',
	                                    '<a href="/prompts/view/'+prompt._id+'" class="btn btn-link" aria-expanded="true" aria-controls="">',
	                                        prompt.title,
	                                    '</a>',
	                                    '<a class="btn btn-success float-right mt-1" style="font-size: .600rem;" href="/prompts/view/'+prompt._id+'">VIEW MORE</a>',
	                                    '<div class="mt-2 ml-2" style="float: right;">',
	                                        '<span class="mr-3">',
	                                            '<span class="fa fa-eye"></span> '+prompt.view_count,
	                                        '</span>',
	                                        '<span class="mr-3">',
	                                            '<span class="fa fa-heart"></span> '+prompt.follow_count,
	                                        '</span>',
	                                    '</div>',
	                                '</h6>',
	                            '</div>',
	                            '<div aria-labelledby="" style="">',
	                                '<div class="card-body">',
	                                    '<div class="mb-3">',
	                                        '<i style="color: gray;">',
	                                            '<b>',
	                                            prompt.username,
	                                            '</b> posted ',
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
	                        '</div>',
	                    '</div>'
                    ].join('');

                    $('#prompts-div').append(html);

                    $('#post-'+prompt._id).fadeIn();
				});
			}

			$('#show-more-prompts-btn').removeAttr('disabled');
		}
	)
});

//xhrj('/login', {data}, callback, callback_failed);