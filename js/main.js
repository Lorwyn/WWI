// Day prototype extension
Date.prototype.addDays = function(days) {
	let date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};

// Find get parameter
function findGetParameter(parameterName) {
    let result = null,
        tmp = [];
    location.search.substr(1).split("&").forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

// Check required inputs
function checkRequiredInputs() {
	let isValid = true;
	$("input").filter("[required]").each(function() {
		if ($(this).prop("type") == "checkbox") {
			if ($(this).prop("checked") === false) {
				isValid = false;
				$(this).addClass("error");
				return false;
			}
		}

		if ($(this).val() === "") {
			isValid = false;
			$(this).addClass("error");
			return false;
		}
		
		$(this).removeClass("error");
	});
	return isValid;
}

// Search for product
function searchProduct() {
	let searchValue = $("#search").val().trim();
	let categoryValue = $("#category").val().trim();

	let searchResultBox = $("#searchResultsBox");
	searchResultBox.removeClass("d-none");

	if (!searchValue.trim()) {
		searchResultBox.addClass("d-none");
		searchResultBox.html("");
	} else {
		$.ajax({
			type: "POST",
			url: "inc/Search.php",
			data: {
				search: searchValue,
				category: categoryValue
			},
			success: function (html) {
				searchResultBox.html(html).show();
			}
		});
	}
}

// Get shopping cart products
function getShoppingCartProducts() {
	let shoppingCartBox = $("#shoppingCartBox");
	shoppingCartBox.removeClass("d-none");

	$.ajax({
		type: "POST",
		url: "inc/Cart.php",
		success: function (html) {
			shoppingCartBox.html(html).show();
		}
	});
}

function confirmPurchase() {
	$(".nav-tabs .active").parent().next("li").find("a").trigger("click");
}

$(document).ready(function () {
	// Enable tooltip
	$('[data-toggle="tooltip"]').tooltip();

	// Enable data table
	$("#invoiceTable").DataTable();

	// Calculate product total price
	$(".quantity-input").change("change", function () {
		let totalCost = $("#productPrice").html() * $(this).val();
		$("#totalPrice").html(totalCost.toFixed(2));
	});

	// Search when typing or category is changed
	$("#search").keyup(function () {
		searchProduct();
	});

	$("#search").focusin(function () {
		let searchResultBox = $("#searchResultsBox");
		searchResultBox.removeClass("d-none");
	});

	// $("#search").focusout(function () {
	// 	let searchResultBox = $("#searchResultsBox");
	// 	searchResultBox.addClass("d-none");
	// });

	$("#category").change(function () {
		searchProduct();
	});

    $("#category").focusin(function () {
	    let searchResultBox = $("#searchResultsBox");
	    searchResultBox.removeClass("d-none");
    });

    $("#category").focusout(function () {
	    let searchResultBox = $("#searchResultsBox");
	    searchResultBox.addClass("d-none");
    });

    $("#buyNowButton").click(function () {
	    let id = findGetParameter("id");
	    let productName = $("#productName").html().trim();
	    let productImage = $("#productImage0").attr("src").trim();
	    let quantityInput = $(".quantity-input").val();
	    let newTotalPrice = $("#totalPrice").html().trim();

	    $.ajax({
		    type: "POST",
		    url: "inc/AddToCart.php",
		    data: {
			    id: id,
			    name: productName,
			    image: productImage,
			    quantity: quantityInput,
			    price: newTotalPrice,
		    },
		    success: function () {
			    window.location.href = "PaymentProcess.php"
		    }
	    });
    });

    // Add to cart
	$("a.add-to-cart").click(function(event) {
		let id = findGetParameter("id");
		let productName = $("#productName").html().trim();
		let productImage = $("#productImage0").attr("src").trim();

		let quantityInput = $(".quantity-input").val();
		let cartCounter = $(".cart-counter").html().trim();
		let count = Number(cartCounter) + Number(quantityInput);

		let oldTotalPrice = $("#shoppingCartTotalPrice").html().trim();
		let newTotalPrice = $("#totalPrice").html().trim();
		let totalPrice = Number(oldTotalPrice) + Number(newTotalPrice);

		if (id === null) {
			id = $(this).parents(".card-product").find(".id-input").val();
			productName = $(this).parents(".card-product").find("#productName").html().trim();
			productImage = $(this).parents(".card-product").find("#productImage0").attr("src").trim();
			quantityInput = $(this).parents(".card-product").find(".quantity-input").val();
			newTotalPrice = $(this).parents(".card-product").find("#totalPrice").html().trim();
		}

		$.ajax({
			type: "POST",
			url: "inc/AddToCart.php",
			data: {
				id: id,
				name: productName,
				image: productImage,
				quantity: quantityInput,
				price: newTotalPrice,
			}
		});

		let button = $(this);
		button.addClass("size");
		setTimeout(function() {
			button.addClass("hover");
		}, 200);
		setTimeout(function() {
			$(".cart-counter").text(count);
			$("#shoppingCartTotalPrice").text(totalPrice.toFixed(2));
		}, 600);
		setTimeout(function() {
			button.removeClass("hover");
			button.removeClass("size");
		}, 650);
		event.preventDefault();
	});

	// Shopping cart button
	$("#shoppingCartButton").on("click", function() {
		getShoppingCartProducts();
	});

	// Pay button
	$(".btn-next").click(function(){
		if (checkRequiredInputs()) {
			$(".nav-tabs .active").parent().next("li").find("a").trigger("click");
		}
	});

	// Payment and invoice
	$("#product-klaar-tab").click(function () {
		// Get current date
		let invoiceDate = new Date();
		let dd = invoiceDate.getDate();
		let mm = invoiceDate.getMonth()+1; //January is 0!
		let yyyy = invoiceDate.getFullYear();

		if(dd<10) {
			dd = '0'+dd
		}

		if(mm<10) {
			mm = '0'+mm
		}

		// Get current date plus 14 day shipping
		let deliveryTime = new Date().addDays(14);
		let deliveryTimeDD = deliveryTime.getDate();
		let deliveryTimeMM = deliveryTime.getMonth()+1;
		let deliverTimeYYYY = deliveryTime.getFullYear();
		let deliverTimeHH = deliveryTime.getHours();
		let deliverTimemm = deliveryTime.getMinutes();
		let deliverTimeSS = deliveryTime.getSeconds();

		let userId = $("#userId").val();
		invoiceDate = yyyy + '-' + mm + '-' + dd;
		let totalItems = $("#totalItems").val();
		deliveryTime = deliverTimeYYYY + '-' + deliveryTimeMM + '-' + deliveryTimeDD + ' ' + deliverTimeHH + '-' + deliverTimemm + '-' + deliverTimeSS;

		console.log(userId);
		console.log(invoiceDate);
		console.log(totalItems);
		console.log(deliveryTime);

		setTimeout(function() {
			$(".payment-description").html("Betaling verwerken...");
		}, 100);

		$.ajax({
			type: "POST",
			url: "inc/CreateInvoice.php",
			data: {
				userId: userId,
				invoiceDate: invoiceDate,
				totalItems: totalItems,
				deliveryTime: deliveryTime
			},
			success: function() {
				$(".cart-counter").text(0);
				$("#shoppingCartTotalCount").text(0);
				$(".payment-description").html("Betaling ontvangen!<br><a href='Invoices.php' class='btn btn-link text-primary'>Naar bestellingen overzicht</a>");
				$(".circle-loader").toggleClass("load-complete");
				$(".checkmark").toggle();
			}
		});
	});

	// Pagination products per page
	$(".dropdownProducts").change(function(){
		$("#paginationForm").submit();
	});

	// Shopping cart quantity input
	$(".product-quantity").change(function(){
		let id = $(this).parents("#listItem").find("#productId").val();
		let productName = $(this).parents("#listItem").find("#productName").html().trim();
		let productImage = $(this).parents("#listItem").find("#productImage").attr("src").trim();
		let quantityInput = $(this).parents("#listItem").find("#quantityInput").val();
		let price = $(this).parents("#listItem").find("#productPrice").html().trim();
		let subTotalPrice = $(this).parents("#listItem").find("#subtotalPrice");

		// Update subtotal of product
		let subPrice = Number(price) * Number(quantityInput);
		subPrice = subPrice.toFixed(2);
		subTotalPrice.text(subPrice);

		// Update counters
		let totalQuantityInput = $("#cart #quantityInput");
		let count = 0;
		$.each(totalQuantityInput, function (i, val) {
			let inputValue = $(val).val();
			count += Number(inputValue);
		});
		$(".cart-counter").text(count);
		$("#shoppingCartTotalCount").text(count);

		// // Update shopping cart total price
		let subtotalPrice = $("#cart #subtotalPrice");
		count = 0;
		$.each(subtotalPrice, function (i, val) {
			let inputValue = $(val).html().trim();
			count += Number(inputValue);
		});
		$("#totalPrice").text(count.toFixed(2));
		$("#shoppingCartTotalPrice").text(count.toFixed(2));

		if (quantityInput != 0) {
			console.log(quantityInput);
			console.log("update cart");
			$.ajax({
				type: "POST",
				url: "inc/UpdateCart.php",
				data: {
					id: id,
					name: productName,
					image: productImage,
					quantity: quantityInput,
					price: subPrice,
				}
			});
		}
	});

	// Logout user
	$("#logOut").click(function(){
		$.ajax({
			type: "POST",
			url: "inc/Destroy.php",
			success: function() {
				location.reload();
			}
		});
	});
});
