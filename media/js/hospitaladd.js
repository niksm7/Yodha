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




function add_service_medicine(){
    var data = new FormData($('#add_form').get(0));
	$.ajax({
        type: $('#add_form').attr('method'),
        url: $('#add_form').attr('action'),
        data: data,
		processData: false,
        contentType: false,
        success: function (data) {
            img_hash = data.image_hash
            hosp_id = $("#hospital_id").val()

            if($("#options").val() == "Service"){
                var name1 = $("#service_name").val()
                var desc1 = $("#service_desc").val()
                var cost1 = $("#service_cost").val()
                transaction1 = operations_contract.methods.addServices(hosp_id, name1, desc1, cost1, img_hash)
                txn1 = send(transaction1)
            }
            else{
                var name2 = $("#medicine_name").val()
                var desc2 = $("#medicine_desc").val()
                var cost2 = $("#medicine_cost").val()
                transaction2 = operations_contract.methods.addMedicines(hosp_id, name2, desc2, cost2, img_hash)
                tx2 = send(transaction2)
            }
        }
    });
}