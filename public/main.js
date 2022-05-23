let cartnum = document.querySelectorAll(".cartnum sup");
let shopProducts = [
  {
    productid: "m1",
    name: "MALDHA MANGO",
    hindiName: "मालदह आम",
    price: 1200,
    image: "/images/img3.jpg",
    incart: 0,
  },
  {
    productid: "m2",
    name: "bambai MANGO",
    hindiName: "मालदह आम",
    price: 500,
    image: "/images/img3.jpg",
    incart: 0,
  }
];

let populateShopCard = () => {
  let productCardList = document.getElementById("productCardList");
  const productCardHtml = shopProducts.map((product, i) => {
    return `<div class="nodecoration col-lg-3  col-md-4 col-sm-6 col-11  p-2">
            <div class="card border-0 shadow py-3 text-center">
                    <div class="card-img pt-2 mx-auto  zoomonhover">
                        <img src="${product.image}" class="img-width  container-fluid " alt="">
                    </div>
                    <div class="card-body mx-auto text-center py-0">
                        <h5 class=" my-1 text-secondary">${product.name}</h5>
                        <p class=" my-1 text-secondary">( ${product.hindiName} )</p>
                        <a href="/info" class="infotag"><i class="fa-solid fa-circle-info  "></i><span
                                class="px-1">About Mangoes</span></a>
                        <p class=" my-2 text-success ">Fresh and Natural fruits direct from gardens. No Chemicals Used in Farm
                            Production.One Box contains 12 pieces premium quality green (ready to ripen) mango </p>
                        <p class="text-secondary"><i class="fa-solid fa-indian-rupee-sign"></i><span
                                class="px-1 h4">${product.price}/</span><small>12 pcs.</small></p>
                     </div>
                    <div className="d-flex align-items-center">                    
                    <button href="#" class="add-cart py-2  btncustom1 col-7">Add To Cart</button>
                    <button href="" class="buy-now py-2   btncustom3 col-3" onclick="redirectToCart()" >Buy</button>
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
   
    for(let i =0;i<productsInCartList.length;i++){
      console.log("one product=>",productsInCartList[i])
      totreload = totreload + productsInCartList[i].incart*productsInCartList[i].price;
    }
    localStorage.setItem("totalCost",totreload);
    // document.getElementById("product_total_amt").innerText=
    console.log("sum Reloaded", typeof(totreload));
  }

  if (productNumbers) {
    for (let k = 0; k < cartnum.length; k++) {
      cartnum[k].textContent = productNumbers;
    }
  }
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
