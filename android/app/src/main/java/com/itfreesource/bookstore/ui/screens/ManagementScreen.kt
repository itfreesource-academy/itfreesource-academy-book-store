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
import com.itfreesource.bookstore.model.*
import com.itfreesource.bookstore.ui.theme.*

enum class ManagementTab(val label: String, val testId: String) {
    INVENTORY("Inventory", "tab_mgmt_inventory"),
    USERS("Users", "tab_mgmt_users"),
    REVIEWS("Reviews Queue", "tab_mgmt_reviews"),
    AUDIT("Audit Logs", "tab_mgmt_audit")
}

@Composable
fun ManagementScreen() {
    val repo = BookStoreRepository
    var selectedTab by remember { mutableStateOf(ManagementTab.INVENTORY) }
    var userEditDialogTarget by remember { mutableStateOf<User?>(null) }
    var inventorySavedToast by remember { mutableStateOf(false) }
    LaunchedEffect(selectedTab) {
        repo.syncWithBackend()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
    ) {
        // Management Tab Bar
        Surface(
            color = SlateSurface,
            elevation = 4.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                ManagementTab.values().forEach { tab ->
                    val isSel = selectedTab == tab
                    Surface(
                        color = if (isSel) IndigoPrimary else SlateBackground,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .padding(end = 8.dp)
                            .clickable { selectedTab = tab }
                            .semantics { contentDescription = repo.getTestId(tab.testId) }
                    ) {
                        Text(
                            text = tab.label,
                            color = if (isSel) Color.White else TextSecondary,
                            fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }
                }

                Surface(
                    color = SlateCard,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .clickable { repo.syncWithBackend() }
                        .semantics { contentDescription = repo.getTestId("btn_sync_management") }
                ) {
                    Text(
                        text = if (repo.isSyncingBackend) "⏳ Refreshing..." else "🔄 Refresh",
                        color = IndigoPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)
                    )
                }
            }
        }

        // Tab Body
        when (selectedTab) {
            ManagementTab.INVENTORY -> {
                // INVENTORY TAB
                var lowStockOnly by remember { mutableStateOf(false) }
                val displayBooks = if (lowStockOnly) repo.books.filter { it.stock < 5 } else repo.books

                Column(modifier = Modifier.fillMaxSize()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = lowStockOnly,
                                onCheckedChange = { lowStockOnly = it },
                                colors = CheckboxDefaults.colors(checkedColor = AmberWarning),
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("chk_low_stock_only") }
                            )
                            Text("Low Stock Only (< 5)", color = TextPrimary, fontSize = 12.sp)
                        }

                        Button(
                            onClick = {
                                repo.logAudit("BATCH_STOCK_SAVED", "inventory", "all", "Saved batch stock adjustments")
                                inventorySavedToast = true
                            },
                            colors = ButtonDefaults.buttonColors(backgroundColor = EmeraldAccent),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_save_inventory_batch") }
                        ) {
                            Text("Save All", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    if (inventorySavedToast) {
                        Text(
                            text = "✓ Inventory changes saved successfully!",
                            color = EmeraldAccent,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                        )
                    }

                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(displayBooks, key = { it.id }) { book ->
                            Card(
                                backgroundColor = SlateSurface,
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(0.5.dp, SlateBorder, RoundedCornerShape(10.dp))
                                    .semantics { contentDescription = repo.getTestId("inv_item_${book.id}") }
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(36.dp)
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(SlateBackground)
                                                .border(0.5.dp, SlateBorder, RoundedCornerShape(4.dp)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            if (book.coverImage.isNotBlank()) {
                                                AsyncImage(
                                                    model = ImageRequest.Builder(LocalContext.current)
                                                        .data(book.coverImage)
                                                        .crossfade(true)
                                                        .build(),
                                                    contentDescription = book.title,
                                                    contentScale = ContentScale.Crop,
                                                    modifier = Modifier.fillMaxSize()
                                                )
                                            } else {
                                                Text("📖", fontSize = 16.sp)
                                            }
                                        }

                                        Spacer(modifier = Modifier.width(10.dp))

                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = book.title,
                                                color = TextPrimary,
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.Bold,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            Text(
                                                text = repo.formatPrice(book.price),
                                                color = IndigoPrimary,
                                                fontSize = 12.sp,
                                                maxLines = 1
                                            )
                                        }

                                        Spacer(modifier = Modifier.width(8.dp))

                                        Text(
                                            text = "Stock: ${book.stock}",
                                            color = if (book.stock < 5) RoseError else EmeraldAccent,
                                            fontWeight = FontWeight.ExtraBold,
                                            fontSize = 14.sp,
                                            maxLines = 1,
                                            modifier = Modifier.semantics { contentDescription = repo.getTestId("inv_stock_label_${book.id}") }
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))

                                    // Realtime Slider + Stepper
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        IconButton(
                                            onClick = { repo.updateStock(book.id, book.stock - 1) },
                                            modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_stock_minus_${book.id}") }
                                        ) {
                                            Text("-", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                                        }

                                        Slider(
                                            value = book.stock.toFloat(),
                                            onValueChange = { repo.updateStock(book.id, it.toInt()) },
                                            valueRange = 0f..100f,
                                            colors = SliderDefaults.colors(thumbColor = IndigoPrimary, activeTrackColor = IndigoPrimary),
                                            modifier = Modifier
                                                .weight(1f)
                                                .semantics { contentDescription = repo.getTestId("inv_slider_${book.id}") }
                                        )

                                        IconButton(
                                            onClick = { repo.updateStock(book.id, book.stock + 1) },
                                            modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_stock_plus_${book.id}") }
                                        ) {
                                            Text("+", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            ManagementTab.USERS -> {
                // USERS TAB
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(repo.users, key = { it.id }) { u ->
                        Card(
                            backgroundColor = SlateSurface,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(0.5.dp, SlateBorder, RoundedCornerShape(10.dp))
                                .semantics { contentDescription = repo.getTestId("user_row_${u.username}") }
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(androidx.compose.foundation.shape.CircleShape)
                                        .background(IndigoPrimary),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (u.avatar.isNotBlank()) {
                                        AsyncImage(
                                            model = ImageRequest.Builder(LocalContext.current)
                                                .data(u.avatar)
                                                .crossfade(true)
                                                .build(),
                                            contentDescription = u.username,
                                            contentScale = ContentScale.Crop,
                                            modifier = Modifier.fillMaxSize()
                                        )
                                    } else {
                                        Text(
                                            text = (u.username.take(1)).uppercase(),
                                            color = Color.White,
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.width(10.dp))

                                Column(modifier = Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = u.fullName,
                                            color = TextPrimary,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Surface(
                                            color = IndigoPrimary.copy(alpha = 0.2f),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                text = u.role.label,
                                                color = IndigoPrimary,
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                maxLines = 1,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                    Text(
                                        text = "@${u.username} • ${u.email}",
                                        color = TextSecondary,
                                        fontSize = 11.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = "FX: ${u.currency.code} | TZ: ${u.timezone.takeLast(10)}",
                                        color = TextSecondary,
                                        fontSize = 10.sp,
                                        maxLines = 1
                                    )
                                }

                                Spacer(modifier = Modifier.width(6.dp))

                                Button(
                                    onClick = { userEditDialogTarget = u },
                                    colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                                    shape = RoundedCornerShape(6.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                    modifier = Modifier
                                        .height(30.dp)
                                        .semantics { contentDescription = repo.getTestId("btn_edit_user_${u.username}") }
                                ) {
                                    Text("Edit", color = Color.White, fontSize = 11.sp, maxLines = 1)
                                }
                            }
                        }
                    }
                }
            }

            ManagementTab.REVIEWS -> {
                // REVIEWS MODERATION QUEUE
                val pendingReviews = repo.reviews.filter { it.status == ReviewStatus.pending }
                if (pendingReviews.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("All reviews moderated! Queue empty.", color = TextSecondary, fontSize = 14.sp)
                    }
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(pendingReviews, key = { it.id }) { rev ->
                            Card(
                                backgroundColor = SlateSurface,
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(0.5.dp, SlateBorder, RoundedCornerShape(10.dp))
                                    .semantics { contentDescription = repo.getTestId("pending_review_${rev.id}") }
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text("By @${rev.username}", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        Text("${rev.rating.toInt()} Stars", color = AmberWarning, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    }
                                    Text(rev.title, color = IndigoPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 2.dp))
                                    Text(rev.comment, color = TextSecondary, fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))

                                    Spacer(modifier = Modifier.height(10.dp))

                                    Row(horizontalArrangement = Arrangement.End, modifier = Modifier.fillMaxWidth()) {
                                        Button(
                                            onClick = { repo.moderateReview(rev.id, true) },
                                            colors = ButtonDefaults.buttonColors(backgroundColor = EmeraldAccent),
                                            shape = RoundedCornerShape(6.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            modifier = Modifier
                                                .height(30.dp)
                                                .semantics { contentDescription = repo.getTestId("btn_approve_review_${rev.id}") }
                                        ) {
                                            Text("Approve", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }

                                        Spacer(modifier = Modifier.width(8.dp))

                                        OutlinedButton(
                                            onClick = { repo.moderateReview(rev.id, false) },
                                            shape = RoundedCornerShape(6.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            modifier = Modifier
                                                .height(30.dp)
                                                .semantics { contentDescription = repo.getTestId("btn_reject_review_${rev.id}") }
                                        ) {
                                            Text("Reject", color = RoseError, fontSize = 11.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            ManagementTab.AUDIT -> {
                // AUDIT LOGS TAB
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(repo.auditLogs, key = { it.id }) { log ->
                        Card(
                            backgroundColor = SlateSurface,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(0.5.dp, SlateBorder, RoundedCornerShape(8.dp))
                                .semantics { contentDescription = repo.getTestId("audit_log_${log.id}") }
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Surface(
                                        color = IndigoPrimary.copy(alpha = 0.2f),
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            text = log.action,
                                            color = IndigoPrimary,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                    Text(log.timestamp, color = TextSecondary, fontSize = 10.sp)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(log.details, color = TextPrimary, fontSize = 12.sp)
                                Text("By @${log.username} (${log.role}) from ${log.ipAddress}", color = TextSecondary, fontSize = 10.sp, modifier = Modifier.padding(top = 2.dp))
                            }
                        }
                    }
                }
            }
        }
    }

    // User Edit Dialog
    userEditDialogTarget?.let { u ->
        var editName by remember { mutableStateOf(u.fullName) }
        var editRole by remember { mutableStateOf(u.role) }
        var editCurrency by remember { mutableStateOf(u.currency) }

        AlertDialog(
            onDismissRequest = { userEditDialogTarget = null },
            backgroundColor = SlateSurface,
            title = { Text("Edit User: @${u.username}", color = TextPrimary, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    OutlinedTextField(
                        value = editName,
                        onValueChange = { editName = it },
                        label = { Text("Full Name", color = TextSecondary) },
                        colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateBackground),
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = repo.getTestId("input_edit_user_name") }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("Role: ${editRole.label}", color = TextSecondary, fontSize = 12.sp)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(vertical = 4.dp)
                    ) {
                        UserRole.values().forEach { r ->
                            Surface(
                                color = if (editRole == r) IndigoPrimary else SlateBackground,
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier
                                    .padding(end = 4.dp)
                                    .clickable { editRole = r }
                            ) {
                                Text(r.name, color = if (editRole == r) Color.White else TextSecondary, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp))
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        repo.updateUser(u.id, editName, editRole, u.status, editCurrency, u.timezone)
                        userEditDialogTarget = null
                    },
                    colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_save_user_edits") }
                ) {
                    Text("Save Changes", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { userEditDialogTarget = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }
}
