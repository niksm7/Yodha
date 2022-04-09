// ************************************************
// Shopping Cart API
// ************************************************

var shoppingCart = (function() {
    // =============================
    // Private methods and propeties
    // =============================
    cart = [];
    
    // Constructor
    function Item(name, price, count, good_id) {
      this.name = name;
      this.price = price;
      this.count = count;
      this.good_id = good_id;
    }
    
    // Save cart
    function saveCart() {
      localStorage.setItem('shoppingCart', JSON.stringify(cart))
      sessionStorage.setItem('shoppingCart', JSON.stringify(cart));
    }
    
      // Load cart
    function loadCart() {
      cart = JSON.parse(localStorage.getItem('shoppingCart'));
    }
    if (localStorage.getItem("shoppingCart") != null) {
      loadCart();
    }
    
  
    // =============================
    // Public methods and propeties
    // =============================
    var obj = {};
    
    // Add to cart
    obj.addItemToCart = function(name, price, count, good_id) {
      for(var item in cart) {
        if(cart[item].name === name) {
          cart[item].count ++;
          saveCart();
          return;
        }
      }
      var item = new Item(name, price, count, good_id);
      cart.push(item);
      saveCart();
    }
    // Set count from item
    obj.setCountForItem = function(name, count) {
      for(var i in cart) {
        if (cart[i].name === name) {
          cart[i].count = count;
          break;
        }
      }
    };
    // Remove item from cart
    obj.removeItemFromCart = function(name) {
        for(var item in cart) {
          if(cart[item].name === name) {
            cart[item].count --;
            if(cart[item].count === 0) {
              cart.splice(item, 1);
            }
            break;
          }
      }
      saveCart();
    }
  
    // Remove all items from cart
    obj.removeItemFromCartAll = function(name) {
      for(var item in cart) {
        if(cart[item].name === name) {
          cart.splice(item, 1);
          break;
        }
      }
      saveCart();
    }
  
    // Clear cart
    obj.clearCart = function() {
      cart = [];
      saveCart();
    }
  
    // Count cart 
    obj.totalCount = function() {
      var totalCount = 0;
      for(var item in cart) {
        totalCount += cart[item].count;
      }
      return totalCount;
    }
  
    // Total cart
    obj.totalCart = function() {
      var totalCart = 0;
      for(var item in cart) {
        totalCart += cart[item].price * cart[item].count;
      }
      return Number(totalCart.toFixed(2));
    }
  
    // List cart
    obj.listCart = function() {
      var cartCopy = [];
      for(i in cart) {
        item = cart[i];
        itemCopy = {};
        for(p in item) {
          itemCopy[p] = item[p];
  
        }
        itemCopy.total = Number(item.price * item.count).toFixed(2);
        cartCopy.push(itemCopy)
      }
      return cartCopy;
    }
  
    // cart : Array
    // Item : Object/Class
    // addItemToCart : Function
    // removeItemFromCart : Function
    // removeItemFromCartAll : Function
    // clearCart : Function
    // countCart : Function
    // totalCart : Function
    // listCart : Function
    // saveCart : Function
    // loadCart : Function
    return obj;
  })();
  
  
  // *****************************************
  // Triggers / Events
  // ***************************************** 
  // Add item
  $('.add-to-cart').click(function(event) {
    event.preventDefault();
    var name = $(this).data('name');
    var price = Number($(this).data('price'));
    var good_id = Number($(this).data('goodid'))
    shoppingCart.addItemToCart(name, price, 1, good_id);
    displayCart();
  });
  
  // Clear items
  $('.clear-cart').click(function() {
    shoppingCart.clearCart();
    displayCart();
  });
  
  
  function displayCart() {
    var cartArray = shoppingCart.listCart();
    var output = "";
    for(var i in cartArray) {
      output += "<tr>"
        + "<td>" + cartArray[i].name + "</td>" 
        + "<td>(" + cartArray[i].price / (10**18) + ")</td>"
        + "<td><div class='input-group'><button class='minus-item input-group-addon btn btn-primary' data-name=" + cartArray[i].name + ">-</button>"
        + "<input type='number' class='item-count form-control' data-name='" + cartArray[i].name + "' value='" + cartArray[i].count + "'>"
        + "<button class='plus-item btn btn-primary input-group-addon' data-name=" + cartArray[i].name + ">+</button></div></td>"
        + "<td><button class='delete-item btn btn-danger' data-name=" + cartArray[i].name + ">X</button></td>"
        + " = " 
        + "<td>" + cartArray[i].total / (10**18) + "</td>" 
        +  "</tr>";
    }
    $('.show-cart').html(output);
    $('.total-cart').html(shoppingCart.totalCart() / (10**18));
    $('.total-count').html(shoppingCart.totalCount());
  }
  
  // Delete item button
  
  $('.show-cart').on("click", ".delete-item", function(event) {
    var name = $(this).data('name')
    shoppingCart.removeItemFromCartAll(name);
    displayCart();
  })
  
  
  // -1
  $('.show-cart').on("click", ".minus-item", function(event) {
    var name = $(this).data('name')
    shoppingCart.removeItemFromCart(name);
    displayCart();
  })
  // +1
  $('.show-cart').on("click", ".plus-item", function(event) {
    var name = $(this).data('name')
    shoppingCart.addItemToCart(name);
    displayCart();
  })
  
  // Item count input
  $('.show-cart').on("change", ".item-count", function(event) {
     var name = $(this).data('name');
     var count = Number($(this).val());
    shoppingCart.setCountForItem(name, count);
    displayCart();
  });
  
  displayCart();


function requestGoods(){
  cart = JSON.parse(localStorage.getItem('shoppingCart'))
  var good_ids = []
  for(var item in cart){
    good_ids.push(cart[item]["good_id"])
  }
  document.getElementById("loader_container").hidden = false
  document.getElementById("main_container").hidden = true
  $("#loader_text").text("Requesting")
  $.ajax({
      url: "/placerequestgoods/",
      dataType: "json",
      data: {
        "good_ids": JSON.stringify(good_ids)
      },
      success: function (data) {
        document.getElementById("loader_container").hidden = true
      document.getElementById("main_container").hidden = false
      }
  });
}

const web = new Web3("https://rinkeby.infura.io/v3/384b2420ae804f5ca4b5d6aa630f3c7b")
var token_contract = ""
var operations_contract = ""
var current_user_account = ""
var good_ids = ""
const address_coin = "0xEc230C6A8F084eD90564Ea7176509279AF2c89BF"
const address_operations = "0xB757430741651aCDFb41B6112FE3419A90144d77"

$.ajax({
    url: "https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=0xEc230C6A8F084eD90564Ea7176509279AF2c89BF&apikey=39MRYT8W4D35AH26BJZVGQ1KK19SR5XWXG",
    dataType: "json",
    success: function (data) {
        token_contract = new web.eth.Contract(JSON.parse(data.result), address_coin)
        localStorage.setItem('token_contract', JSON.stringify([JSON.parse(data.result), address_coin]))
    }
});

$.ajax({
    url: "https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=0xB757430741651aCDFb41B6112FE3419A90144d77&apikey=39MRYT8W4D35AH26BJZVGQ1KK19SR5XWXG",
    dataType: "json",
    success: function (data) {
        operations_contract = new web.eth.Contract(JSON.parse(data.result), address_operations)
        localStorage.setItem('operations_contract', JSON.stringify([JSON.parse(data.result), address_operations]))
        display_goods()
    }
});

window.addEventListener('load', async () => {

    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            current_user_account = accounts[0]
        } catch (error) {
            if (error.code === 4001) {
                // User rejected request
            }

            setError(error);
        }
        window.ethereum.on('accountsChanged', (accounts) => {
            current_user_account = accounts[0]
        });

    } else {
        window.alert(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
    }
})


function donationBackend(hash, all_good_ids){
    $("#loader_text").text("Donating")
    web.eth.getTransactionReceipt(hash, async function (err, receipt) {
        if (err) {
            console.log(err)
        }

        if (receipt !== null) {
            try {
                good_ids = JSON.parse(all_good_ids)
                $.ajax({
                    url: "/donatedgoods/",
                    dataType: "json",
                    data:{
                        "good_ids": all_good_ids
                    },
                    success: function (data) {
                        document.getElementById("loader_container").hidden = true
                        document.getElementById("main_container").hidden = false
                    }
                });
            } catch (e) {
                console.log(e)
            }
        } else {
            // Try again in 1 second
            window.setTimeout(function () {
                donationBackend(hash, all_good_ids);
            }, 1000);
        }
    });
}


function payForOrder(hash, all_good_ids, all_good_qtys) {
    document.getElementById("loader_container").hidden = false
    document.getElementById("main_container").hidden = true
    $("#loader_text").text("Approving")
    web.eth.getTransactionReceipt(hash, async function (err, receipt) {
        if (err) {
            console.log(err)
        }

        if (receipt !== null) {
            try {
                good_ids = JSON.parse(all_good_ids)
                good_qtys = JSON.parse(all_good_qtys)
                transaction2 = operations_contract.methods.placeDonation(address_coin, current_user_account, good_ids, good_qtys, all_good_ids, all_good_qtys)
                tx2 = await send(transaction2)
                donationBackend(tx2,all_good_ids)
            } catch (e) {
                console.log(e)
            }
        } else {
            // Try again in 1 second
            window.setTimeout(function () {
                payForOrder(hash, all_good_ids, all_good_qtys);
            }, 1000);
        }
    });
}


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


async function place_donation(){
    // Calculate total amount of cart
    cart = JSON.parse(localStorage.getItem('shoppingCart'))
    var good_ids = []
    var good_qtys = []
    for(var item in cart){
        good_ids.push(cart[item]["good_id"])
        good_qtys.push(cart[item]["count"])
    }
    confirmed_total = 0
    let promises = [];
    for (let good_index = 0; good_index < good_ids.length; good_index++) {
        amount = operations_contract.methods.id_to_good(good_ids[good_index]).call()
        promises.push(amount)
        amount = JSON.parse(JSON.stringify(await amount))["token_amount"]
        confirmed_total = confirmed_total + (await amount * good_qtys[good_index])
    }
    const results = await Promise.all(promises);
    confirmed_total = await confirmed_total.toString()
    transaction1 = token_contract.methods.approve(address_operations, confirmed_total)
    tx = await send(transaction1)
    payForOrder(tx.toString(), JSON.stringify(good_ids), JSON.stringify(good_qtys))
}

async function display_goods() {
    var all_goods = await operations_contract.methods.getAllGoods().call();
    for(var good in all_goods){
        $("#goods_row").append(`
        <div class="col">
            <div class="card" style="width: 20rem;border-radius: 16px;">
                <img class="card-img-top" src="${all_goods[good]["image_uri"]}"
                    alt="Card image cap">
                <div class="card-block" style="text-align: center;">
                    <h4 class="card-title">${all_goods[good]["name"]}</h4>
                    <p class="card-text" style="font-size: 20px;font-weight: 800;">${all_goods[good]["token_amount"] / (10**18)} KC</p>
                    <a href="#" data-name="${all_goods[good]["name"]}" data-goodid="${all_goods[good]["id"]}" data-price="${all_goods[good]["token_amount"]}" style="background-color:#84A98C; color:white;width: 85%;" class="add-to-cart btn ">Add to
                        cart</a>
                </div>
            </div>
        </div>
        `)
    }
    $('.add-to-cart').click(function(event) {
        event.preventDefault();
        var name = $(this).data('name');
        var price = Number($(this).data('price'));
        var good_id = Number($(this).data('goodid'))
        shoppingCart.addItemToCart(name, price, 1, good_id);
        displayCart();
    });
}