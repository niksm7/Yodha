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
        getAllHosps()
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


async function getAllHosps(){
    all_hosps = await operations_contract.methods.getAllHospitals().call()
    for (let index = 0; index < all_hosps.length; index++) {
        fund_raised = await operations_contract.methods.hosp_to_total_donations(all_hosps[index]["hospital_id"]).call()
        $("#all_hosps").append(`
        <div class="card">
            <div class="card-text">
                <div class="portada"  style="background-image: url('/media/images/leads/bed.jpg');">
                </div>
                <div class="title-total">
                    <div class="title">
                    </div>
                    <br>
                    <div class="service-type"><button class="btn warning">Hospital</button></div>
                    <div class="service"><button onclick="window.open('/patient/shop/${all_hosps[index]["hospital_id"]}');" class="btn info">Request Now</button>
                    </div>
                    <div class="verified"><button class="btn success">Verified</button></div>
                    <div class="contact"><button><i class="fas fa-phone"></i></button>123456789
                    </div>
                    <div class="location"><button><i
                                class="fas fa-dollar-sign"></i></button>Funds Raised : ${parseInt(fund_raised)/ (10**18)} YCoin</div>
                    <h2>${all_hosps[index]["name"]}</h2>
                    <div class="desc">Hospital urgently needs Medicines, Oxygen Cylinders, Medical Equipment, Funds, Ration Kits</div>
                </div>
            </div>
        </div>
        `)
    }
}

function request_donation(hosp_id){
    $.ajax({
        url: "/sendverification/",
        dataType: "json",
        data:{"hosp_id":hosp_id},
        success: function (data) {
            console.log("Success")
        }
    });
}