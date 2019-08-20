var loginForm = $('#login-form');
var loginBtn = $('#login-btn');
var loginModal = $('#login-modal');

var showPasswordBtn = $('#show-password-btn');

var passwordInput = $('#password');

showPasswordBtn.click(function(){
	showPasswordBtn.find('i').toggleClass('fa-eye-slash');
	if(passwordInput.attr('type') == 'text'){
		passwordInput.attr('type', 'password');
	}else{
		passwordInput.attr('type', 'text');
	}
});

loginBtn.click(function(){
	var formData = loginForm.serialize();
	xhrj(
		'/user/login',
		formData,
		function(response){
			if(response.status === 0){
				if(window.location.pathname === '/'){
	    			window.location.href = "/user/dashboard/";
	    		}else{
	    			window.location.reload();
	    		}
	    	}else{
	    		error('Error', 'Invalid login credentials.');
	    	}
		}
	);
});