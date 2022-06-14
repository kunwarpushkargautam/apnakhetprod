var productsInCart = localStorage.getItem("productInCarts");
productsInCart = JSON.parse(productsInCart);

if(productsInCart){
  var productsInCartList = Object.keys(productsInCart).map((key) => {
  return productsInCart[key];
});
}else{
  productsInCartList = []
}




let populateCartItem = (productsInCartList) => {
  let inCartCounter = localStorage.getItem("cartNumbers");
  let inCartTotal = localStorage.getItem("totalCost");

  document.getElementById(
    "inCartCounter"
  ).innerText = `Total Items : ${inCartCounter}`;

  document.getElementById("product_total_amt").innerText = `${inCartTotal}`;
  let cartnumcount = document.getElementsByClassName("cartnumcount");
  for (let j = 0; j < cartnumcount.length; j++) {
    cartnumcount[j].innerText = inCartCounter;
  }
  let productCardList = document.getElementById("main_cart_container");
  var productCardHtml = productsInCartList.map((product, i) => {
    return `<div class="card shadow p-4 my-2">
    <div class="row">
        <!-- cart images div -->
        <div
            class="col-md-5 col-11 mx-auto bg-light d-flex justify-content-center align-items-center product_img">
            <img src="${product.image}" class="img-fluid" alt="cart img">
        </div>
        <!-- cart product details -->
        <div class="col-md-7 col-11 mx-auto px-4 mt-2 mt-md-3">
            <div class="row text-center ">
                <!-- product name  -->
                <div class="col-md-6 col-12  card-title">
                    <h1 class="mb-2 product_name">${product.name}</h1>
                    
                </div>
                <!-- quantity inc dec -->
                <div class="col-md-6 col-12  ">
                    <ul class="pagination justify-content-center justify-content-md-end set_quantity py-2">
                        <li class="page-item">
                            <button class="page-link "
                                onclick="decreaseNumber('${i}a${
      product.price
    }')">
                                <i class="fas fa-minus"></i> </button>
                        </li>
                        <li class="page-item"><input type="text" name="" class="page-link"
                               value="${product.incart}" id="textbox${i}">
                        </li> 
                        <li class="page-item">
                            <button class="page-link"
                                onclick="increaseNumber('${i}a${
      product.price
    }')"> <i
                                    class="fas fa-plus"></i></button>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- //remover move and price -->
            <div class="row mt-md-5">
                <div class="col-8 d-flex justify-content-between remove_wish">
                    <p class="btn p-0" onclick="removeItem(${i})"><i class="fas fa-trash-alt"></i> REMOVE ITEM</p class="btn">

                </div>
                <div class="col-4 d-flex justify-content-end price_money">
                    <h3>₹<span id="itemval${i}">${
      product.price * product.incart
    } </span></h3>
                </div>
            </div>
        </div>
    </div>
</div>`;
  });

  if (productsInCartList.length > 0) {
    productCardList.innerHTML += productCardHtml.toString().replaceAll(",", "");
    console.log(productCardList);
    let carts = document.querySelectorAll(".add-cart");
    console.log(carts);
    for (let i = 0; i < carts.length; i++) {
      carts[i].addEventListener("click", () => {
        console.log("clicked", i);
        cartNumbers(shopProducts[i]);
      });
    }
  } else {
    total_cart_amt.innerText = parseInt(shipping_charge.innerHTML);
    document.getElementById("main_cart_container").classList.remove("shadow");
    document.getElementById(
      "main_cart_container"
    ).innerHTML = `<p class="h3 text-center text-secondary py-3"> OOps!! Cart Seems Empty..</p>
    <img src="/images/empty-box-min.png" class="container-fluid py-3 ">`;
  }
};

const removeItem = (index) => {
  var tcartAmount = document.getElementById("total_cart_amt").innerText;
  var shipping_charge = parseInt(document.getElementById("shipping_charge").innerText);
  var listObject = {};
  let totalCost = 0;
  let cartNumbers = 0;
  productsInCartList.splice(index, 1);
  for (let k = 0; k < productsInCartList.length; k++) {
    cartNumbers += productsInCartList[k].incart;
    totalCost += productsInCartList[k].incart * productsInCartList[k].price;
  }
  document.getElementById("total_cart_amt").innerText = totalCost + shipping_charge ;
  
  console.log("cart Amount", tcartAmount);
  console.log("cart Number", cartNumbers);
  console.log("total cost", totalCost);
  
  localStorage.setItem("cartNumbers", cartNumbers);
  localStorage.setItem("totalCost", totalCost);
  
  for (let i = 0; i < productsInCartList.length; i++) {
    Object.assign(listObject, {
      [productsInCartList[i].productid]: productsInCartList[i],
    });
  }
  console.log("hi i am new object", listObject);
  localStorage.setItem("productInCarts", JSON.stringify(listObject));
  console.log("hi i am list ", productsInCartList);

  document.getElementById("main_cart_container").innerHTML = " ";
  let recoverTotalAmount = totalCost;
  ////console.log("rem",recoverTotalAmount);
  removeDiscountApply();
  populateCartItem(productsInCartList);
};

populateCartItem(productsInCartList);
