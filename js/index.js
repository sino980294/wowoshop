let product = [];
let cart = {};
let productList = document.querySelector(".product-list");
let cartTable = document.querySelector(".mycart-table");
let productSelect = document.querySelector(".product-select");
let orderInput = document.querySelectorAll(".order-input");
let sendOrder = document.querySelector(".order-send-btn");
//初始化
axios.get("https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/sino/products")
    .then(function (response) {
        if (response.data.status) {
            product = response.data.products;
            productInit();
            cartInit();
            productFilterInit();
        } else {
            console.log("無法取得資料");
        }

    })

//產品初始化
function productInit() {
    let productListString = "";
    product.forEach(function (item) {
        productListString += `<li class="product-card">
                                <img src=${item.images}>
                                <a data-id=${item.id}>加入購物車</a>
                                <div class="product-info">
                                    <p>${item.title}</p>
                                    <p>NT$${item.origin_price}</p>
                                    <p>NT$${item.price}</p>
                                </div>    
                            </li>`;
    });
    productList.innerHTML = productListString;
}

//產品篩選
function productFilterInit() {
    let filter = [];
    let filterString = `<option value="全部" selected>全部</option>`;
    product.forEach(function (item) {
        if (filter.indexOf(item.category) === -1) {
            filter.push(item.category);
            filterString += `<option value=${item.category}>${item.category}</option>`;
        }
    });
    productSelect.innerHTML = filterString;
}

//購物車初始化(axios)
function cartInit() {
    axios
        .get(
            "https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/sino/carts"
        )
        .then(function (response) {
            cart = response.data;
            cartCombind();
        });
}

//購物車內容組字串
function cartCombind() {
    let cartList = `<tr>
                        <th>品項</th>
                        <th>單價</th>
                        <th>數量</th>
                        <th>金額</th>
                        <th></th>
                    </tr>`;
    cart.carts.forEach(function (item, index) {
        cartList += `<tr>
                        <td>
                        <div class="cart-item">
                            <img src=${item.images} alt="">
                            <p>${item.product.title}</p>
                        </div>
                        </td>
                        <td>NT$${item.product.price}</td>
                        <td>${item.quantity}</td>
                        <td>NT$${item.product.price * item.quantity}</td>
                        <td class="cart-delete-Btn">
                            <a href="#" class="material-icons" data-id=${item.id}>
                                clear
                            </a>
                        </td>
                    </tr>`;
    });
    cartList += `<tr>
                    <td>
                        <a href="#" class="cart-deleteAll-Btn">刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>NT$${cart.finalTotal}</td>
                </tr>`;
    cartTable.innerHTML = cartList;
}

//監聽產品購買
productList.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.nodeName === "A") {
        let addCartObj = {};
        addCartObj.data = {
            productId: e.target.getAttribute("data-id"),
            quantity: 1
        };
        axios
            .post(
                "https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/sino/carts",
                addCartObj
            )
            .then(function (response) {
                cartInit();
            })
            .catch(function (response) {
                alert("傳送失敗");
            });
    } else {
        return;
    }
});

//監聽購物車刪除
cartTable.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.nodeName === "A") {
        if (e.target.parentNode.getAttribute("class") === "cart-delete-Btn") {
            axios
                .delete(
                    `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/sino/carts/${e.target.getAttribute("data-id")}`
                )
                .then(function () {
                    cartInit();
                });
        } else if (e.target.getAttribute("class") === "cart-deleteAll-Btn") {
            axios
                .delete(
                    "https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/sino/carts"
                )
                .then(function (response) {
                    cartInit();
                })
                .catch(function () {
                    alert("刪除失敗");
                });
        }
    } else {
        return;
    }
});

//監聽下拉式選單
productSelect.addEventListener("change", function (e) {
    let productList = "";
    if (e.target.value === "全部") {
        productInit();
    } else {
        product.forEach(function (item, index) {
            if (item.category === e.target.value)
                productList += `<li class="product-card">
                                    <img src=${item.images}>
                                    <a data-id=${item.id}>加入購物車</a>
                                    <div class="product-info">
                                        <p>${item.title}</p>
                                        <p>NT$${item.origin_price}</p>
                                        <p>NT$${item.price}</p>
                                    </div>    
                                </li>`;;
        });
        productList.innerHTML = productList;
    }
});

sendOrder.addEventListener("click", function (e) {
    e.preventDefault();
    let infoObj = {
        data: {
            user: {
                name: orderInput[0].value,
                tel: orderInput[1].value,
                email: orderInput[2].value,
                address: orderInput[3].value,
                payment: orderInput[4].value
            }
        }
    };
    axios
        .post(
            "https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/sino/orders",
            infoObj
        )
        .then(function (response) {
            cartInit();
            alert("已傳送訂單");
            orderInput.forEach(function (item) {
                item.value = "";
            });
        })
        .catch(function (response) {
            alert("錯誤");
        });
});
