var current_user_account = ""
var token_contract = ""
var operations_contract = ""
const address_token_contract = "YodCoin"
const address_operations = ""

const web = new Web3("https://rinkeby.infura.io/v3/")


$.ajax({
    url: "https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=YodCoin&apikey=",
    dataType: "json",
    success: function (data) {
        token_contract = new web.eth.Contract(JSON.parse(data.result), address_token_contract)
        localStorage.setItem('token_contract', JSON.stringify([JSON.parse(data.result), address_token_contract]))
    }
});

$.ajax({
    url: "https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=&apikey=",
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


function display_data(){
    console.log("Here")
    var data = new FormData($('#password_form').get(0));
	$.ajax({
        type: $('#password_form').attr('method'),
        url: $('#password_form').attr('action'),
        data: data,
		processData: false,
        contentType: false,
        success: function (data) {
            $("#patient_name").html(data.name)
            $("#patient_age").html(data.age)
            $("#patient_gender").html(data.gender)
            ipfs_hashes = data.ipfs_hashes
            for (let index = 0; index < ipfs_hashes.length; index++) {
                curr_hash = ipfs_hashes[index]
                $("#proof_document").append(`
                    <a href="/getfileipfs/${curr_hash}/${data.patient_id}" target="_blank" type="button">See Document</a>
                `)
            }
        }
    });
}

async function accept_donation(){
    transaction1 = operations_contract.methods.patientDonation($("#donation_id").html(), address_token_contract)

    tx = await send(transaction1)
}