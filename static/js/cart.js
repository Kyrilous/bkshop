//var updateBtns = document.getElementsByClassName("update-cart");
//
//for (i = 0; i < updateBtns.length; i++) {
//    updateBtns[i].addEventListener("click", function () {
//        var productId = this.dataset.product;
//        var action = this.dataset.action;
//        console.log("productId:", productId, "Action:", action);
//        console.log("USER:", user);
//
//        if (user == "AnonymousUser") {
//            addCookieItem(productId, action);
//        } else {
//            updateUserOrder(productId, action);
//        }
//    });
//}
//
//function updateUserOrder(productId, action) {
//    console.log("User is authenticated, sending data...");
//
//    var url = "/update_item/";
//
//    fetch(url, {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json",
//            "X-CSRFToken": csrftoken,
//        },
//        body: JSON.stringify({ productId: productId, action: action }),
//    })
//        .then((response) => {
//            return response.json();
//        })
//        .then((data) => {
//            console.log('data:', data)
//            location.reload();
//        });
//}
//
//function addCookieItem(productId, action) {
//    console.log("User is not authenticated");
//
//    if (action == "add") {
//        if (cart[productId] == undefined) {
//            cart[productId] = { quantity: 1 };
//        } else {
//            cart[productId]["quantity"] += 1;
//        }
//    }
//
//    if (action == "remove") {
//        cart[productId]["quantity"] -= 1;
//
//        if (cart[productId]["quantity"] <= 0) {
//            console.log("Item should be deleted");
//            delete cart[productId];
//        }
//    }
//    console.log("CART:", cart);
//    document.cookie = "cart=" + JSON.stringify(cart) + ";domain=;path=/";
//
//    location.reload();
//}

// static/js/cart.js
// Attach click handlers to all "update-cart" buttons and send fetch to Django.
// Works for both anonymous (cookie cart) and authenticated users.

console.log("cart.js loaded");

const updateBtns = document.getElementsByClassName("update-cart");

// Helper: get CSRF token from cookie (Django docs pattern)
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie("csrftoken");

// Cookie cart for anonymous users
function getCart() {
  let cart = {};
  try {
    cart = JSON.parse(getCookie("cart")) || {};
  } catch (e) {
    cart = {};
  }
  return cart;
}
function setCart(cart) {
  document.cookie = "cart=" + JSON.stringify(cart) + ";domain=;path=/";
}

function addCookieItem(productId, action) {
  const cart = getCart();
  if (action === "add") {
    if (!cart[productId]) cart[productId] = { quantity: 0 };
    cart[productId].quantity += 1;
  } else if (action === "remove") {
    if (cart[productId]) {
      cart[productId].quantity -= 1;
      if (cart[productId].quantity <= 0) delete cart[productId];
    }
  }
  setCart(cart);
  location.reload();
}

async function updateUserOrder(productId, action) {
  try {
    const res = await fetch("/update_item/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ productId, action }),
    });
    const data = await res.json();
    console.log("update_item response:", data);
    location.reload();
  } catch (err) {
    console.error("update_item failed:", err);
  }
}

// Wire up buttons
for (let i = 0; i < updateBtns.length; i++) {
  updateBtns[i].addEventListener("click", function (e) {
    e.preventDefault(); // avoid accidental navigation if it's an <a>
    const productId = this.dataset.product;
    const action = this.dataset.action;
    console.log("productId:", productId, "Action:", action, "USER:", user);

    if (user === "AnonymousUser") {
      addCookieItem(productId, action);
    } else {
      updateUserOrder(productId, action);
    }
  });
}
