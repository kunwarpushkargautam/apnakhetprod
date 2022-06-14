let cartnum = document.querySelectorAll(".cartnum sup");
let shopProducts,demandFruit,demandProduct;
window.onload = async(event)=>{
  const productResponse = await fetch('/', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
  },
  body: JSON.stringify({ category:"product" })
});
let resProduct = await productResponse.json();
shopProducts = resProduct.prods;
demandFruit = resProduct.fruit;
demandProduct = resProduct.demandproduct;
console.log(resProduct);
populateShopCard(shopProducts);
populateFruitDemandCard(demandFruit);
populateDemandCard(demandProduct);
}


let populateShopCard = (shopProducts) => {
  let productCardList = document.getElementById("productCardList");
  const productCardHtml = shopProducts.map((product, i) => {
    return `<div class="nodecoration col-lg-3   col-md-4 col-sm-6 col-11  p-2 wow animate__animated animate__zoomIn">
            <div class="card border-0 shadow py-3 text-center">
                    <div class="card-img pt-2 mx-auto  zoomonhover">
                        <img src="${product.image}" class="img-width  container-fluid " alt="">
                    </div>
                    <div class="card-body mx-auto text-center py-0">
                        <h5 class=" my-1 text-secondary">${product.name}</h5>
                        <p class=" my-1 text-secondary">( ${product.hindiName} )</p>
                        <a href="" class="infotag" data-bs-toggle="modal" data-bs-target="#exampleModal${i}"><i class="fa-solid fa-circle-info  "></i><span
                                class="px-1">About Mangoes</span></a>
                        <p class=" my-2 text-success ">Fresh and Natural fruits direct from gardens. We are not using any type of  chemical/gas, for ripening the mango.One Box contains 12 pieces premium quality green (ready to ripen) mango </p>
                        <p class="text-secondary"><i class="fa-solid fa-indian-rupee-sign"></i><span
                                class="px-1 h4">${product.price}/</span><small>12 pcs.</small></p>
                     </div>
                    <div className="d-flex align-items-center">                    
                    <button href="#" class="add-cart py-2  btncustom1 col-7">Add To Cart</button>
                    <button href="" class="buy-now py-2   btncustom3 col-3" onclick="redirectToCart()" >Buy</button>
                    </div>
                </div>
            
        </div>
        <div class="modal fade" id="exampleModal${i}" tabindex="-1" aria-labelledby="exampleModalLabel${i}" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-success" id="exampleModalLabel${i}">${product.name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>${product.info}
                    </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-warning" data-bs-dismiss="modal">ok</button>
                </div>
            </div>
        </div>
    </div>`;
  });

  if (productCardList) {
    productCardList.innerHTML += productCardHtml.toString().replaceAll(",", "");
    console.log(productCardList);
    let carts = document.querySelectorAll(".add-cart");

    for (let i = 0; i < carts.length; i++) {
      carts[i].addEventListener("click", () => {
        cartNumbers(shopProducts[i]);
      });
    }
    buynow();
  }
};

function buynow() {
  let buycarts = document.querySelectorAll(".buy-now");
  for (let i = 0; i < buycarts.length; i++) {
    buycarts[i].addEventListener("click", () => {
      cartNumbers(shopProducts[i]);
    });
  }
}

const removeDiscountApply = () => {
  let product_total_amt = document.getElementById("product_total_amt");
  let shipping_charge = document.getElementById("shipping_charge");
  let discountCode = document.getElementById("discount_code1");
  let code1 = document.getElementById("discountCode1");
  let error_trw = document.getElementById("error_trw");
  let total_cart_amt = document.getElementById("total_cart_amt");
  let recoverTotalAmount = parseInt(product_total_amt.innerText);
  console.log("1", recoverTotalAmount);
  document.getElementById("discountLabel").classList.add("d-none");
  let curr_prdct_tot_amount = parseInt(product_total_amt.innerText);
  if (curr_prdct_tot_amount >= 1000) {
    shipping_charge.innerText = "0";
  } else {
    shipping_charge.innerText = "100";
  }
  discountCode.value = code1.innerText;
  discountCode.value = "";
  error_trw.innerText = "check And Apply Code";
  code1.parentNode.classList.remove("valid");
  total_cart_amt.innerText =
    recoverTotalAmount + parseInt(shipping_charge.innerText);
  setCookie("amount", total_cart_amt.innerText, 1);
};

function redirectToCart() {
  window.location.assign("cart");
}

function onLoadCartNumber() {
  let totreload = 0;
  // let totalCost = document.getElementById("")
  let productNumbers = localStorage.getItem("cartNumbers");

  var productsInCart = localStorage.getItem("productInCarts");
  productsInCart = JSON.parse(productsInCart);

  if (productsInCart) {
    var productsInCartList = Object.keys(productsInCart).map((key) => {
      return productsInCart[key];
    });

    console.log("this is product cart list", productsInCartList);

    // let sumReload = productsInCartList.map((product, i) => {
    //   return (totreload = totreload + product.incart * product.price);
    // });

    for (let i = 0; i < productsInCartList.length; i++) {
      console.log("one product=>", productsInCartList[i]);
      totreload =
        totreload + productsInCartList[i].incart * productsInCartList[i].price;
    }
  }
  localStorage.setItem("totalCost", totreload);
  // document.getElementById("product_total_amt").innerText=
  console.log("sum Reloaded", typeof totreload);

  if (productNumbers) {
    for (let k = 0; k < cartnum.length; k++) {
      cartnum[k].textContent = productNumbers;
    }
  } else {
    localStorage.setItem("cartNumbers", 0);
  }
  removeDiscountApply();
}

function cartNumbers(product) {
  let productNumbers = localStorage.getItem("cartNumbers");
  productNumbers = parseInt(productNumbers);
  if (productNumbers) {
    localStorage.setItem("cartNumbers", productNumbers + 1);
  } else {
    localStorage.setItem("cartNumbers", 1);
  }
  setItemToStorage(product);
  writeCart();
}

function cartNumbersMinus(product) {
  let productNumbers = localStorage.getItem("cartNumbers");
  productNumbers = parseInt(productNumbers);
  if (productNumbers) {
    localStorage.setItem("cartNumbers", productNumbers - 1);
  }
  removeItemToStorage(product);
  writeCart();
}
function removeItemToStorage(product) {
  let cartItems = localStorage.getItem("productInCarts");
  cartItems = JSON.parse(cartItems);
  if (cartItems != null) {
    cartItems[product.productid].incart -= 1;
  }
  localStorage.setItem("productInCarts", JSON.stringify(cartItems));
  totalCostDecrease(product);
}
function writeCart() {
  let productNumbers = localStorage.getItem("cartNumbers");
  for (let k = 0; k < cartnum.length; k++) {
    cartnum[k].textContent = productNumbers;
  }
}

function setItemToStorage(product) {
  let cartItems = localStorage.getItem("productInCarts");
  cartItems = JSON.parse(cartItems);
  if (cartItems != null) {
    if (cartItems[product.productid] == undefined) {
      cartItems = {
        ...cartItems,
        [product.productid]: product,
      };
    }
    cartItems[product.productid].incart += 1;
  } else {
    product.incart = 1;
    cartItems = {
      [product.productid]: product,
    };
  }
  localStorage.setItem("productInCarts", JSON.stringify(cartItems));
  totalCost(product);
}

function totalCostDecrease(product) {
  let cartCost = localStorage.getItem("totalCost");
  if (cartCost != null) {
    cartCost = parseInt(cartCost);
    localStorage.setItem("totalCost", cartCost - product.price);
  }
}
function totalCost(product) {
  let cartCost = localStorage.getItem("totalCost");
  if (cartCost != null) {
    cartCost = parseInt(cartCost);
    localStorage.setItem("totalCost", cartCost + product.price);
  } else {
    localStorage.setItem("totalCost", product.price);
  }
}
populateShopCard();
onLoadCartNumber();
