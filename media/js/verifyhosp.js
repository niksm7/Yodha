function verify_request(){
    var data = new FormData($('#verification_form').get(0));
	$.ajax({
        type: $('#verification_form').attr('method'),
        url: $('#verification_form').attr('action'),
        data: data,
		processData: false,
        contentType: false,
        success: function (data) {
            $("#keyHash").val(data.check_string)
        }
    })
}