function xhrj(url, data, callback, callback_failed){
    return $.ajax({
        url: url,
        type: "POST",
        data: data,
        dataType: 'json',
        async: true,
        success: function(data){
            callback(data);
        },
        error: function(data){
            if(callback_failed != null) {
                callback_failed(data);
            }
        }
    });
}

function idToJqueryObject(id) {
    var vars = [];
    var str = "";
    var place = $('body');
    if(id){
        place = $(id);
    }
    place.find('[id]').each(function (i,v) {
        var name = v.id.camelize();
        if (vars.indexOf(name) < 0){
            vars.push(name);
            //eval("var "+name + " = $('#" + v.id + "');");
            //console.log();
            str += "var "+name + " = $('#" + v.id + "');\n";
        }else{
            console.error("Duplicate jquery object : "+name + " = $('#" + v.id + "');");
        }
    });
    console.log(str);
}

String.prototype.camelize = function () {
    return String(this).replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '').replace(/[\-+\_+]/g, '');
};


$.fn.getFormData = function () {
    var data = $(this).serializeArray();
    var newData = {};
    $.each(data, function (i, v) {
        newData[v.name] = v.value;
    });
    return newData;
};

function confirm(title, message, callback){
    if(!title) {
        title = 'Confirm';
    }
    if(!message){
        message = "Are you sure?"
    }
    Swal.fire({
        title: title,
        text: message,
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if(callback){
            callback(result.value);
        }
    });
}

function success(title, message, callback){
    if(!title) {
        title = 'Successful';
    }
    if(!message){
        message = "OK."
    }
    Swal.fire({
        title: title,
        text: message,
        type: 'success',
    }).then(function (result) {
        if(callback) callback();
    });
}

function error(title, message, callback){
    if(!title) {
        title = 'Error';
    }
    if(!message){
        message = "Something went wrong."
    }
    Swal.fire({
        title: title,
        text: message,
        type: 'error',
    }).then(function (result) {
        if(callback) callback();
    });
}

function warning(title, message, callback){
    if(!title) {
        title = 'Warning';
    }
    if(!message){
        message = "You have been warned."
    }
    Swal.fire({
        title: title,
        text: message,
        type: 'warning',
    }).then(function (result) {
        if(callback) callback();
    });
}

function showLoading(title, message, callback) {
    if(!title) {
        title = 'Loading';
    }
    if(!message){
        message = "Please wait..."
    }
    Swal.fire({
        title: title,
        html: message,
        allowOutsideClick: false,
        onBeforeOpen: () => {
            Swal.showLoading();
        },
        onClose: () => {
            if(callback) callback();
        }
    });
}

function dismiss() {
    swal.close();
}


function hideLoading() {
    swal.hideLoading();
}

function addDocumentListener(type, class_name, callback) {
    $(document).off(type+'.'+class_name).on(type+'.'+class_name, '.'+class_name, function (e) {
        callback($(this), e);
    });
}

function simplifyNumber(n,d){x=(''+n).length,p=Math.pow,d=p(10,d)
x-=x%3
return Math.round(n*d/p(10,x))/d+" kMGTPE"[x/3]
}

$.fn.addRows = function(data) {
    $(this).DataTable().rows.add(data).draw(false);
    return $(this);
};

$.fn.clearDataTable = function() {
    $(this).DataTable().clear().draw();
    return $(this);
};
