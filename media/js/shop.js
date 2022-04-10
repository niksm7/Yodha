// ************************************************
// Shopping Cart API
// ************************************************

var shoppingCart = (function() {
    // =============================
    // Private methods and propeties
    // =============================
    cart = [];
    
    // Constructor
    function Item(name, price, count, good_id, itemtype) {
      this.name = name;
      this.price = price;
      this.count = count;
      this.good_id = good_id;
      this.itemtype = itemtype;
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
    obj.addItemToCart = function(name, price, count, good_id, itemtype) {
      for(var item in cart) {
        if(cart[item].name === name) {
          cart[item].count ++;
          saveCart();
          return;
        }
      }
      var item = new Item(name, price, count, good_id, itemtype);
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
    var good_id = Number($(this).data('goodid'));
    var itemtype = $(this).data('itemtype');
    shoppingCart.addItemToCart(name, price, 1, good_id, itemtype);
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


  async function request_donation(){
    curr_cart = JSON.parse(localStorage.getItem("shoppingCart"))
    medicine_list = []
    service_list = []
    for (let index = 0; index < curr_cart.length; index++) {
      curr_item = curr_cart[index]
      if(curr_item["itemtype"] == "Medicine"){
        medicine_list.push(curr_item["good_id"])
      }
      else{
        service_list.push(curr_item["good_id"])
      }
    }

    transaction1 = operations_contract.methods.requestDonation(patient_id, hosp_id, medicine_list, service_list, 0)
    tx = await send(transaction1)
    $.ajax({
      url: "/patientshareidentity/",
      dataType: "json",
      data: {"hosp_id":hosp_id},
      success: function (data) {
        console.log(data)
        }
    });
    
  }