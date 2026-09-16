package com.itfreesource.bookstore.ui.screens

import android.app.DatePickerDialog
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.model.Order
import com.itfreesource.bookstore.model.ShippingAddress
import com.itfreesource.bookstore.model.UserRole
import com.itfreesource.bookstore.ui.theme.*
import java.util.Calendar
import java.util.Locale

@Composable
fun CartCheckoutScreen(
    onContinueShopping: () -> Unit
) {
    val repo = BookStoreRepository
    val context = LocalContext.current

    // Checkout step: 0 = Cart, 1 = Shipping, 2 = Payment, 3 = Confirmation
    var checkoutStep by remember { mutableStateOf(0) }
    var promoCodeInput by remember { mutableStateOf("") }
    var promoFeedback by remember { mutableStateOf<String?>(null) }
    var isPromoError by remember { mutableStateOf(false) }

    // Shipping Form State
    var shippingName by remember { mutableStateOf(repo.currentUser?.fullName ?: "John Doe") }
    var shippingStreet by remember { mutableStateOf("123 Quality Assurance Blvd") }
    var shippingCity by remember { mutableStateOf("Austin") }
    var shippingState by remember { mutableStateOf("TX") }
    var shippingZip by remember { mutableStateOf("78701") }
    var shippingCountry by remember { mutableStateOf("USA") }

    // Delivery Date
    var deliveryDate by remember { mutableStateOf("2026-03-25") }

    // Payment Form State
    var cardNumber by remember { mutableStateOf("4532 8921 7734 9012") }
    var cardExpiry by remember { mutableStateOf("12/28") }
    var cardCvv by remember { mutableStateOf("888") }
    var cardHolder by remember { mutableStateOf(shippingName) }
    var paymentMethod by remember { mutableStateOf("Credit Card") }

    // Completed Order state
    var completedOrder by remember { mutableStateOf<Order?>(null) }

    val calendar = Calendar.getInstance()
    val datePickerDialog = DatePickerDialog(
        context,
        { _, year, month, dayOfMonth ->
            deliveryDate = String.format(Locale.US, "%d-%02d-%02d", year, month + 1, dayOfMonth)
        },
        calendar.get(Calendar.YEAR),
        calendar.get(Calendar.MONTH),
        calendar.get(Calendar.DAY_OF_MONTH)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
    ) {
        // Top Header
        Surface(
            color = SlateSurface,
            elevation = 4.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = when (checkoutStep) {
                        0 -> "🛒 Shopping Cart (${repo.cartItems.sumOf { it.quantity }})"
                        1 -> "📦 Shipping Address (Step 1/2)"
                        2 -> "💳 Payment & Review (Step 2/2)"
                        else -> "🎉 Order Confirmed!"
                    },
                    color = TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("cart_screen_header") }
                )

                if (checkoutStep in 1..2) {
                    TextButton(
                        onClick = { checkoutStep-- },
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_checkout_back") }
                    ) {
                        Text("← Back", color = IndigoPrimary, fontSize = 12.sp)
                    }
                }
            }
        }

        if (checkoutStep == 3 && completedOrder != null) {
            // Confirmation Screen
            val ord = completedOrder!!
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                item {
                    Spacer(modifier = Modifier.height(24.dp))
                    Text("✅", fontSize = 64.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Thank You for Your Order!",
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("order_success_title") }
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Order #${ord.orderNumber}",
                        color = IndigoPrimary,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("order_number_label") }
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Tracking: ${ord.trackingNumber}",
                        color = TextSecondary,
                        fontSize = 13.sp,
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("tracking_number_label") }
                    )

                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        color = if (repo.isBackendConnected) EmeraldAccent.copy(alpha = 0.15f) else AmberWarning.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = repo.getTestId("order_sync_status_badge") }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = if (repo.isBackendConnected) "🟢 Synced to Web Store (Live Database)" else "🟡 Saved Locally (Server at ${com.itfreesource.bookstore.data.ApiClient.baseUrl} unreachable)",
                                color = if (repo.isBackendConnected) EmeraldAccent else AmberWarning,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Summary Card
                    Card(
                        backgroundColor = SlateSurface,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Order Summary", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            ord.items.forEach { itm ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("${itm.title} (x${itm.quantity})", color = TextSecondary, fontSize = 12.sp, modifier = Modifier.weight(1f))
                                    Text(repo.formatPrice(itm.price * itm.quantity), color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                }
                            }
                            Divider(color = SlateBorder, modifier = Modifier.padding(vertical = 8.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Total Paid:", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(repo.formatPrice(ord.total), color = EmeraldAccent, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("Estimated Delivery: ${ord.deliveryDate}", color = TextSecondary, fontSize = 12.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    Button(
                        onClick = {
                            checkoutStep = 0
                            completedOrder = null
                            onContinueShopping()
                        },
                        colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .semantics { contentDescription = repo.getTestId("btn_continue_shopping") }
                    ) {
                        Text("Continue Shopping", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else if (checkoutStep == 0) {
            // STEP 0: Cart View
            if (repo.cartItems.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🛒", fontSize = 56.sp)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Your Cart is Empty",
                            color = TextPrimary,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("empty_cart_message") }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Explore our bookstore catalog and add items to your cart",
                            color = TextSecondary,
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = onContinueShopping,
                            colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_browse_catalog_empty") }
                        ) {
                            Text("Browse Books", color = Color.White)
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 16.dp)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(12.dp))

                        // VIP Banner
                        if (repo.currentUser?.role == UserRole.vip_customer) {
                            Surface(
                                color = EmeraldAccent.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .semantics { contentDescription = repo.getTestId("vip_cart_banner") }
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("💎", fontSize = 20.sp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text("VIP Customer Perk Applied", color = EmeraldAccent, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                        Text("You are receiving an automatic 20% discount on all books!", color = TextSecondary, fontSize = 11.sp)
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }

                    // Cart Items List
                    items(repo.cartItems, key = { it.book.id }) { item ->
                        Card(
                            backgroundColor = SlateSurface,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp)
                                .border(0.5.dp, SlateBorder, RoundedCornerShape(10.dp))
                                .semantics { contentDescription = repo.getTestId("cart_item_${item.book.id}") }
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Thumbnail image
                                Box(
                                    modifier = Modifier
                                        .size(50.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(SlateBackground)
                                        .border(0.5.dp, SlateBorder, RoundedCornerShape(6.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (item.book.coverImage.isNotBlank()) {
                                        AsyncImage(
                                            model = ImageRequest.Builder(LocalContext.current)
                                                .data(item.book.coverImage)
                                                .crossfade(true)
                                                .build(),
                                            contentDescription = item.book.title,
                                            contentScale = ContentScale.Crop,
                                            modifier = Modifier.fillMaxSize()
                                        )
                                    } else {
                                        Text("📖", fontSize = 24.sp)
                                    }
                                }

                                Spacer(modifier = Modifier.width(12.dp))

                                // Title & Unit Price
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = item.book.title,
                                        color = TextPrimary,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis,
                                        modifier = Modifier.semantics { contentDescription = repo.getTestId("cart_item_title_${item.book.id}") }
                                    )
                                    Text(
                                        text = "${repo.formatPrice(item.book.price)} each",
                                        color = IndigoPrimary,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }

                                // Stepper (- / +)
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .background(SlateBackground, RoundedCornerShape(6.dp))
                                        .border(1.dp, SlateBorder, RoundedCornerShape(6.dp))
                                ) {
                                    IconButton(
                                        onClick = { repo.updateCartQuantity(item.book.id, item.quantity - 1) },
                                        modifier = Modifier
                                            .size(32.dp)
                                            .semantics { contentDescription = repo.getTestId("cart_qty_minus_${item.book.id}") }
                                    ) {
                                        Text("-", color = TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                    }
                                    Text(
                                        text = "${item.quantity}",
                                        color = TextPrimary,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier
                                            .padding(horizontal = 6.dp)
                                            .semantics { contentDescription = repo.getTestId("cart_qty_value_${item.book.id}") }
                                    )
                                    IconButton(
                                        onClick = { repo.updateCartQuantity(item.book.id, item.quantity + 1) },
                                        modifier = Modifier
                                            .size(32.dp)
                                            .semantics { contentDescription = repo.getTestId("cart_qty_plus_${item.book.id}") }
                                    ) {
                                        Text("+", color = TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                    }
                                }

                                Spacer(modifier = Modifier.width(6.dp))

                                // Delete Button
                                IconButton(
                                    onClick = { repo.removeFromCart(item.book.id) },
                                    modifier = Modifier
                                        .size(32.dp)
                                        .semantics { contentDescription = repo.getTestId("cart_item_remove_${item.book.id}") }
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = "Remove item", tint = RoseError, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }

                    // Promo Code Section
                    item {
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            OutlinedTextField(
                                value = promoCodeInput,
                                onValueChange = { promoCodeInput = it },
                                placeholder = { Text("Promo Code (e.g. SAVE10, FREESHIP)", color = TextSecondary, fontSize = 12.sp) },
                                singleLine = true,
                                colors = TextFieldDefaults.outlinedTextFieldColors(
                                    textColor = TextPrimary,
                                    backgroundColor = SlateSurface,
                                    focusedBorderColor = IndigoPrimary,
                                    unfocusedBorderColor = SlateBorder
                                ),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .height(50.dp)
                                    .semantics { contentDescription = repo.getTestId("promo_code_input") }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Button(
                                onClick = {
                                    val (ok, msg) = repo.applyPromoCode(promoCodeInput)
                                    promoFeedback = msg
                                    isPromoError = !ok
                                },
                                colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .height(50.dp)
                                    .semantics { contentDescription = repo.getTestId("btn_apply_promo") }
                            ) {
                                Text("Apply", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }

                        promoFeedback?.let { msg ->
                            Text(
                                text = msg,
                                color = if (isPromoError) RoseError else EmeraldAccent,
                                fontSize = 11.sp,
                                modifier = Modifier
                                    .padding(top = 4.dp)
                                    .semantics { contentDescription = repo.getTestId("promo_feedback_label") }
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }

                // Bottom Checkout Summary
                Surface(
                    color = SlateSurface,
                    elevation = 8.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        // Subtotal
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Subtotal", color = TextSecondary, fontSize = 12.sp)
                            Text(repo.formatPrice(repo.getCartSubtotalUsd()), color = TextPrimary, fontSize = 12.sp, modifier = Modifier.semantics { contentDescription = repo.getTestId("cart_subtotal_val") })
                        }
                        // Discount
                        if (repo.getCartDiscountUsd() > 0) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Discount", color = EmeraldAccent, fontSize = 12.sp)
                                Text("-${repo.formatPrice(repo.getCartDiscountUsd())}", color = EmeraldAccent, fontSize = 12.sp, modifier = Modifier.semantics { contentDescription = repo.getTestId("cart_discount_val") })
                            }
                        }
                        // Tax
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Estimated Tax (8%)", color = TextSecondary, fontSize = 12.sp)
                            Text(repo.formatPrice(repo.getCartTaxUsd()), color = TextPrimary, fontSize = 12.sp)
                        }
                        // Shipping
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Shipping", color = TextSecondary, fontSize = 12.sp)
                            Text(if (repo.getCartShippingUsd() == 0.0) "FREE" else repo.formatPrice(repo.getCartShippingUsd()), color = TextPrimary, fontSize = 12.sp)
                        }
                        Divider(color = SlateBorder, modifier = Modifier.padding(vertical = 8.dp))
                        // Total
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Total", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text(
                                text = repo.formatPrice(repo.getCartTotalUsd()),
                                color = Color.White,
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 18.sp,
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("cart_total_val") }
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Button(
                            onClick = { checkoutStep = 1 },
                            colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(46.dp)
                                .semantics { contentDescription = repo.getTestId("btn_proceed_to_shipping") }
                        ) {
                            Text("Proceed to Shipping →", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        } else if (checkoutStep == 1) {
            // STEP 1: Shipping Address & Delivery Date Form
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                item {
                    Text("Shipping Address Details", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = shippingName,
                        onValueChange = { shippingName = it },
                        label = { Text("Full Recipient Name", color = TextSecondary) },
                        colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = repo.getTestId("input_shipping_name") }
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = shippingStreet,
                        onValueChange = { shippingStreet = it },
                        label = { Text("Street Address", color = TextSecondary) },
                        colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = repo.getTestId("input_shipping_street") }
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = shippingCity,
                            onValueChange = { shippingCity = it },
                            label = { Text("City", color = TextSecondary) },
                            colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                            modifier = Modifier
                                .weight(1.2f)
                                .semantics { contentDescription = repo.getTestId("input_shipping_city") }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        OutlinedTextField(
                            value = shippingState,
                            onValueChange = { shippingState = it },
                            label = { Text("State", color = TextSecondary) },
                            colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                            modifier = Modifier
                                .weight(0.8f)
                                .semantics { contentDescription = repo.getTestId("input_shipping_state") }
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = shippingZip,
                            onValueChange = { shippingZip = it },
                            label = { Text("Zip / Postal Code", color = TextSecondary) },
                            colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                            modifier = Modifier
                                .weight(1f)
                                .semantics { contentDescription = repo.getTestId("input_shipping_zip") }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        OutlinedTextField(
                            value = shippingCountry,
                            onValueChange = { shippingCountry = it },
                            label = { Text("Country", color = TextSecondary) },
                            colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                            modifier = Modifier
                                .weight(1f)
                                .semantics { contentDescription = repo.getTestId("input_shipping_country") }
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Date Picker Trigger
                    Text("Expected Delivery Date", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    Surface(
                        color = SlateSurface,
                        shape = RoundedCornerShape(8.dp),
                        border = ButtonDefaults.outlinedBorder,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { datePickerDialog.show() }
                            .semantics { contentDescription = repo.getTestId("btn_pick_delivery_date") }
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Delivery on: $deliveryDate", color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                            Icon(Icons.Default.CalendarToday, contentDescription = "Pick Date", tint = IndigoPrimary)
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    Button(
                        onClick = { checkoutStep = 2 },
                        enabled = shippingName.isNotBlank() && shippingStreet.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .semantics { contentDescription = repo.getTestId("btn_proceed_to_payment") }
                    ) {
                        Text("Continue to Payment →", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else if (checkoutStep == 2) {
            // STEP 2: Payment & Final Review
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                item {
                    Text("Payment Method", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(modifier = Modifier.height(10.dp))

                    // Payment Method Radio Group
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        listOf("Credit Card", "Digital Wallet / UPI", "Cash on Delivery").forEach { method ->
                            val isSel = paymentMethod == method
                            Surface(
                                color = if (isSel) IndigoPrimary.copy(alpha = 0.2f) else SlateSurface,
                                border = if (isSel) ButtonDefaults.outlinedBorder else null,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .clickable { paymentMethod = method }
                                    .padding(vertical = 4.dp)
                                    .semantics { contentDescription = repo.getTestId("payment_method_${method.replace(" ", "_").lowercase()}") }
                            ) {
                                Text(
                                    text = method,
                                    color = if (isSel) IndigoPrimary else TextSecondary,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    if (paymentMethod == "Credit Card") {
                        OutlinedTextField(
                            value = cardNumber,
                            onValueChange = { cardNumber = it },
                            label = { Text("Card Number", color = TextSecondary) },
                            colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                            modifier = Modifier
                                .fillMaxWidth()
                                .semantics { contentDescription = repo.getTestId("input_card_number") }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth()) {
                            OutlinedTextField(
                                value = cardExpiry,
                                onValueChange = { cardExpiry = it },
                                label = { Text("Expiry (MM/YY)", color = TextSecondary) },
                                colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                                modifier = Modifier
                                    .weight(1f)
                                    .semantics { contentDescription = repo.getTestId("input_card_expiry") }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            OutlinedTextField(
                                value = cardCvv,
                                onValueChange = { cardCvv = it },
                                label = { Text("CVV", color = TextSecondary) },
                                colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                                modifier = Modifier
                                    .weight(1f)
                                    .semantics { contentDescription = repo.getTestId("input_card_cvv") }
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = cardHolder,
                            onValueChange = { cardHolder = it },
                            label = { Text("Cardholder Name", color = TextSecondary) },
                            colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                            modifier = Modifier
                                .fillMaxWidth()
                                .semantics { contentDescription = repo.getTestId("input_card_holder") }
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Final Price Confirmation Card
                    Card(
                        backgroundColor = SlateSurface,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, SlateBorder, RoundedCornerShape(10.dp))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Total to Authorize", color = TextSecondary, fontSize = 12.sp)
                            Text(
                                text = repo.formatPrice(repo.getCartTotalUsd()),
                                color = EmeraldAccent,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.ExtraBold,
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("checkout_final_total") }
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Deliver to: $shippingName, $shippingCity, $shippingState", color = TextSecondary, fontSize = 11.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            val address = ShippingAddress(shippingName, shippingStreet, shippingCity, shippingState, shippingZip, shippingCountry)
                            completedOrder = repo.placeOrder(address, deliveryDate, paymentMethod)
                            checkoutStep = 3
                        },
                        colors = ButtonDefaults.buttonColors(backgroundColor = EmeraldAccent),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .semantics { contentDescription = repo.getTestId("btn_place_order") }
                    ) {
                        Text("Authorize & Place Order", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }
        }
    }
}
