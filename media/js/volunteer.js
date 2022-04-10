var current_user_account = ""
var token_contract = ""
var operations_contract = ""
const address_token_contract = "0x29f54D028a811c00bF25cabe3b10BcF774525807"
const address_operations = "0xd9612684Ba1C26aB59a5A7052B180844CdAf48FA"

const web = new Web3("https://rinkeby.infura.io/v3/384b2420ae804f5ca4b5d6aa630f3c7b")


$.ajax({
    url: "https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=0x29f54D028a811c00bF25cabe3b10BcF774525807&apikey=39MRYT8W4D35AH26BJZVGQ1KK19SR5XWXG",
    dataType: "json",
    success: function (data) {
        token_contract = new web.eth.Contract(JSON.parse(data.result), address_token_contract)
        localStorage.setItem('token_contract', JSON.stringify([JSON.parse(data.result), address_token_contract]))
    }
});

$.ajax({
    url: "https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=0xd9612684Ba1C26aB59a5A7052B180844CdAf48FA&apikey=39MRYT8W4D35AH26BJZVGQ1KK19SR5XWXG",
    dataType: "json",
    success: function (data) {
        operations_contract = new web.eth.Contract(JSON.parse(data.result), address_operations)
        localStorage.setItem('operations_contract', JSON.stringify([JSON.parse(data.result), address_operations]))
    }
});


window.addEventListener('load', async () => {

    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            current_user_account = accounts[0]
            $("#farmer_address").val(current_user_account)
        } catch (error) {
            if (error.code === 4001) {
                // User rejected request
            }

            setError(error);
        }
        window.ethereum.on('accountsChanged', (accounts) => {
            current_user_account = accounts[0]
            $("#farmer_address").val(current_user_account)
        });

    } else {
        window.alert(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
    }
})


async function send(transaction, value = 0) {
    const params = [{
        from: current_user_account,
        to: transaction._parent._address,
        data: transaction.encodeABI(),
        gas: web.utils.toHex(1000000),
        gasPrice: web.utils.toHex(10e10),
        value: web.utils.toHex(value)
    },]

    sending_tx = window.ethereum.request({
        method: 'eth_sendTransaction',
        params,
    })

    await sending_tx;
    return await sending_tx
}





$(document).ready(function(){
	$(".btn-group .btn").click(function(){
		var inputValue = $(this).find("input").val();
		if(inputValue != 'all'){
			var target = $('table tr[data-status="' + inputValue + '"]');
			$("table tbody tr").not(target).hide();
			target.fadeIn();
		} else {
			$("table tbody tr").fadeIn();
		}
	});
	// Changing the class of status label to support Bootstrap 4
    var bs = $.fn.tooltip.Constructor.VERSION;
    var str = bs.split(".");
    if(str[0] == 4){
        $(".label").each(function(){
        	var classStr = $(this).attr("class");
            var newClassStr = classStr.replace(/label/g, "badge");
            $(this).removeAttr("class").addClass(newClassStr);
        });
    }
});

$(document).ready(function() {

	$('.open-form').click(function() {
		$('.form-popup').show();
	});
	$('.close-form').click(function() {
		$('.form-popup').hide();
	});
  
	$('.reset-form').click(function() {
		$('.success-message').show();
    $('#my-form').trigger( 'reset' );

    setTimeout(function() {
	    $('.success-message').hide()
    }, 1500);
	});

	$(document).mouseup(function(e) {
		var container = $(".form-wrapper");
		var form = $(".form-popup");

		if (!container.is(e.target) && container.has(e.target).length === 0) {
			form.hide();
		}
	});


});


async function payDonation(hash){
	web.eth.getTransactionReceipt(hash, async function (err, receipt) {
        if (err) {
            console.log(err)
        }

        if (receipt !== null) {
            try {
				total_amount = parseInt($("#donation_amount").val())*(10**18)
                transaction2 = operations_contract.methods.donateAmount($("#donor_id").val(), $("#receiver_id").val(), $("#receiver_acc").val(), address_token_contract, total_amount.toString())
                tx2 = await send(transaction2)
            } catch (e) {
                console.log(e)
            }
        } else {
            // Try again in 1 second
            window.setTimeout(function () {
                payDonation(hash);
            }, 1000);
        }
    });
}


async function approve_donation(){
	total_amount = parseInt($("#donation_amount").val())*(10**18)
	transaction1 = token_contract.methods.approve(address_operations, total_amount.toString())
    tx = await send(transaction1)
    payDonation(tx.toString())
}