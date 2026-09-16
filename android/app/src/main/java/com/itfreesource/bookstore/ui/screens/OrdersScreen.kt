package com.itfreesource.bookstore.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.model.OrderStatus
import com.itfreesource.bookstore.model.UserRole
import com.itfreesource.bookstore.ui.theme.*

@Composable
fun OrdersScreen() {
    val repo = BookStoreRepository
    var selectedStatusFilter by remember { mutableStateOf<String>("all") }
    var trackingDialogOrderId by remember { mutableStateOf<String?>(null) }
    var inputTrackingNumber by remember { mutableStateOf("TRK-9821471") }

    val user = repo.currentUser
    val canFulfill = user?.role in listOf(UserRole.order_fulfillment, UserRole.admin, UserRole.store_manager)
    val canRefund = user?.role in listOf(UserRole.support_agent, UserRole.admin)

    val displayedOrders = repo.orders.filter { order ->
        val matchesUser = if (user?.role in listOf(UserRole.standard_customer, UserRole.vip_customer)) {
            order.userId == user?.id
        } else {
            true
        }
        val matchesStatus = selectedStatusFilter == "all" || order.status.name.equals(selectedStatusFilter, ignoreCase = true)
        matchesUser && matchesStatus
    }

    LaunchedEffect(user?.id) {
        repo.syncWithBackend()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
    ) {
        // Header
        Surface(
            color = SlateSurface,
            elevation = 4.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "📦 Orders & Tracking",
                            color = TextPrimary,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("orders_screen_title") }
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .background(
                                        if (repo.isBackendConnected) SuccessGreen else Color.Gray,
                                        shape = androidx.compose.foundation.shape.CircleShape
                                    )
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (repo.isSyncingBackend) "Syncing with Web..." else if (repo.isBackendConnected) "Web Synced (${repo.lastSyncTime})" else "Local Store",
                                color = if (repo.isBackendConnected) SuccessGreen else TextSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                    Button(
                        onClick = { repo.syncWithBackend() },
                        enabled = !repo.isSyncingBackend,
                        colors = ButtonDefaults.buttonColors(backgroundColor = SlateCard),
                        elevation = ButtonDefaults.elevation(0.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_sync_orders") }
                    ) {
                        Text(text = if (repo.isSyncingBackend) "⏳" else "🔄 Sync Web", color = TextPrimary, fontSize = 12.sp)
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = if (canFulfill) "Fulfillment Mode: You can advance statuses & add tracking numbers" else "Track and review order statuses",
                    color = TextSecondary,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Status Filter Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    listOf("all", "processing", "shipped", "delivered", "refunded", "cancelled").forEach { st ->
                        val isSel = selectedStatusFilter == st
                        Surface(
                            color = if (isSel) IndigoPrimary else SlateBackground,
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .padding(end = 6.dp)
                                .clickable { selectedStatusFilter = st }
                                .semantics { contentDescription = repo.getTestId("order_filter_${st}") }
                        ) {
                            Text(
                                text = st.replaceFirstChar { it.uppercase() },
                                color = if (isSel) Color.White else TextSecondary,
                                fontSize = 11.sp,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
            }
        }

        // Orders List
        if (displayedOrders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("📦", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No orders found",
                        color = TextPrimary,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("empty_orders_label") }
                    )
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .semantics { contentDescription = repo.getTestId("orders_list_view") }
            ) {
                items(displayedOrders, key = { it.id }) { ord ->
                    Card(
                        backgroundColor = SlateSurface,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(0.5.dp, SlateBorder, RoundedCornerShape(12.dp))
                            .semantics { contentDescription = repo.getTestId("order_card_${ord.id}") }
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            // Top row: Order Number + Status Badge
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Order #${ord.orderNumber}",
                                        color = TextPrimary,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.semantics { contentDescription = repo.getTestId("order_num_${ord.id}") }
                                    )
                                    Text(
                                        text = "Placed by ${ord.username} on ${ord.createdAt}",
                                        color = TextSecondary,
                                        fontSize = 11.sp
                                    )
                                }

                                val (statusBadgeBg, statusBadgeColor) = when (ord.status) {
                                    OrderStatus.processing -> Pair(IndigoPrimary.copy(alpha = 0.2f), IndigoPrimary)
                                    OrderStatus.shipped -> Pair(AmberWarning.copy(alpha = 0.2f), AmberWarning)
                                    OrderStatus.delivered -> Pair(EmeraldAccent.copy(alpha = 0.2f), EmeraldAccent)
                                    OrderStatus.refunded -> Pair(Color.Magenta.copy(alpha = 0.2f), Color.Magenta)
                                    OrderStatus.cancelled -> Pair(RoseError.copy(alpha = 0.2f), RoseError)
                                    else -> Pair(SlateBorder, TextSecondary)
                                }

                                Surface(
                                    color = statusBadgeBg,
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Text(
                                        text = ord.status.name.uppercase(),
                                        color = statusBadgeColor,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        modifier = Modifier
                                            .padding(horizontal = 8.dp, vertical = 3.dp)
                                            .semantics { contentDescription = repo.getTestId("order_status_badge_${ord.id}") }
                                    )
                                }
                            }

                            Divider(color = SlateBorder, modifier = Modifier.padding(vertical = 10.dp))

                            // Order Items
                            ord.items.forEach { itm ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 3.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "${itm.title} (x${itm.quantity})",
                                        color = TextSecondary,
                                        fontSize = 12.sp,
                                        modifier = Modifier.weight(1f)
                                    )
                                    Text(
                                        text = repo.formatPrice(itm.price * itm.quantity),
                                        color = TextPrimary,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Tracking Number
                            if (!ord.trackingNumber.isNullOrBlank()) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .background(SlateBackground, RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Icon(Icons.Default.LocalShipping, contentDescription = null, tint = IndigoPrimary, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "Tracking: ${ord.trackingNumber}",
                                        color = TextPrimary,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium,
                                        modifier = Modifier.semantics { contentDescription = repo.getTestId("tracking_label_${ord.id}") }
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                            }

                            // Total and Transitions
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Total Amount", color = TextSecondary, fontSize = 10.sp)
                                    Text(
                                        text = repo.formatPrice(ord.total),
                                        color = EmeraldAccent,
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        modifier = Modifier.semantics { contentDescription = repo.getTestId("order_total_${ord.id}") }
                                    )
                                }

                                // Role-Based Transitions
                                Row {
                                    if (canFulfill && ord.status == OrderStatus.processing) {
                                        Button(
                                            onClick = {
                                                trackingDialogOrderId = ord.id
                                                inputTrackingNumber = "TRK-${(1000000..9999999).random()}"
                                            },
                                            colors = ButtonDefaults.buttonColors(backgroundColor = AmberWarning),
                                            shape = RoundedCornerShape(6.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            modifier = Modifier
                                                .height(32.dp)
                                                .semantics { contentDescription = repo.getTestId("btn_ship_order_${ord.id}") }
                                        ) {
                                            Text("Ship Order", color = SlateBackground, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    } else if (canFulfill && ord.status == OrderStatus.shipped) {
                                        Button(
                                            onClick = { repo.updateOrderStatus(ord.id, OrderStatus.delivered) },
                                            colors = ButtonDefaults.buttonColors(backgroundColor = EmeraldAccent),
                                            shape = RoundedCornerShape(6.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            modifier = Modifier
                                                .height(32.dp)
                                                .semantics { contentDescription = repo.getTestId("btn_deliver_order_${ord.id}") }
                                        ) {
                                            Text("Delivered", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }

                                    if (canRefund && ord.status in listOf(OrderStatus.processing, OrderStatus.shipped, OrderStatus.delivered)) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        OutlinedButton(
                                            onClick = { repo.updateOrderStatus(ord.id, OrderStatus.refunded) },
                                            shape = RoundedCornerShape(6.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            modifier = Modifier
                                                .height(32.dp)
                                                .semantics { contentDescription = repo.getTestId("btn_refund_order_${ord.id}") }
                                        ) {
                                            Text("Refund", color = RoseError, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Tracking Number Dialog
    if (trackingDialogOrderId != null) {
        AlertDialog(
            onDismissRequest = { trackingDialogOrderId = null },
            backgroundColor = SlateSurface,
            title = { Text("Enter Shipping Tracking Number", color = TextPrimary) },
            text = {
                OutlinedTextField(
                    value = inputTrackingNumber,
                    onValueChange = { inputTrackingNumber = it },
                    label = { Text("Carrier Tracking ID", color = TextSecondary) },
                    colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateBackground),
                    modifier = Modifier
                        .fillMaxWidth()
                        .semantics { contentDescription = repo.getTestId("input_tracking_number_dialog") }
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        trackingDialogOrderId?.let { id ->
                            repo.updateOrderStatus(id, OrderStatus.shipped, inputTrackingNumber)
                        }
                        trackingDialogOrderId = null
                    },
                    colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_confirm_shipment") }
                ) {
                    Text("Confirm Shipment", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { trackingDialogOrderId = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }
}
