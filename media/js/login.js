document.getElementById("age").hidden = true
document.getElementById("gender").hidden = true
document.getElementById("patient_proof").hidden = true
document.getElementById("location").hidden = true

function hospital_details(){
	document.getElementById("age").hidden = true
	document.getElementById("gender").hidden = true
	document.getElementById("patient_proof").hidden = true
	document.getElementById("location").hidden = false
	check_button = document.getElementById("is_hospital")
	if (check_button.checked == true){
		document.getElementById("signupForm").action = "/signuphospital/"
	}
	else{
		document.getElementById("signupForm").action = "/signupdonor/"
	}
}

function patient_details(){
    document.getElementById("age").hidden = false
	document.getElementById("gender").hidden = false
	document.getElementById("patient_proof").hidden = false
    document.getElementById("location").hidden = true
	check_button = document.getElementById("is_patient")
	if (check_button.checked == true){
		document.getElementById("signupForm").action = "/signuppatient/"
	}
	else{
		document.getElementById("signupForm").action = "/signupdonor/"
	}
}