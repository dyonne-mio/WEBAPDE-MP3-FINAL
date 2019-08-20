var searchText = $('#search-text');

searchText.focus();
var tmpStr = searchText.val();
searchText.val('');
searchText.val(tmpStr);

var sortBy = $('#sort-by');

searchText.on('keypress',function(e) {
    if(e.which == 13) {
    	query.page = 0;
    	reloadPage();
    }
});


sortBy.on('change', function(){
	query.sort = $(this).val();
	reloadPage();
});

function reloadPage(){
	var url = location.protocol + '//' + location.host + location.pathname;

	if(query.page == 0){
		delete query.page;    	
	}

	if(query.tags == ''){
		delete query.tags;
	}

	query.q = searchText.val();

	if(query.q == ''){
		delete query.q;
	}

	if(query.sort == 1){
		delete query.sort;
	}
	
	window.location.href = url+"?"+$.param(query);
}

addDocumentListener('click', 'search-prompt-page-item', function(element){
	var page = element.data('page');
	query.page = page;
	reloadPage();
});