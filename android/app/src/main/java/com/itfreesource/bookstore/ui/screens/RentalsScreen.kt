package com.itfreesource.bookstore.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
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
import com.itfreesource.bookstore.model.BorrowStatus
import com.itfreesource.bookstore.ui.theme.*

@Composable
fun RentalsScreen() {
    val repo = BookStoreRepository
    var simulateOverdueDays by remember { mutableStateOf(3) }

    LaunchedEffect(Unit) {
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
                            text = "📖 Academic Book Borrowing",
                            color = TextPrimary,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("rentals_screen_title") }
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
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_sync_rentals") }
                    ) {
                        Text(text = if (repo.isSyncingBackend) "⏳" else "🔄 Sync Web", color = TextPrimary, fontSize = 12.sp)
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "10-day academic rental (${repo.formatPrice(2.00)} base fee). Overdue penalty: ${repo.formatPrice(0.10)}/day.",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        // Active Borrow Records List
        if (repo.borrowRecords.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("📚", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No active book rentals",
                        color = TextPrimary,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("empty_rentals_label") }
                    )
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .semantics { contentDescription = repo.getTestId("rentals_list_view") }
            ) {
                items(repo.borrowRecords, key = { it.id }) { record ->
                    Card(
                        backgroundColor = SlateSurface,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(0.5.dp, SlateBorder, RoundedCornerShape(12.dp))
                            .semantics { contentDescription = repo.getTestId("rental_card_${record.id}") }
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            // Header: Title and Status Badge
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = record.bookTitle,
                                    color = TextPrimary,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier
                                        .weight(1f)
                                        .semantics { contentDescription = repo.getTestId("rental_title_${record.id}") }
                                )

                                val (statusBg, statusColor) = when (record.status) {
                                    BorrowStatus.active -> Pair(IndigoPrimary.copy(alpha = 0.2f), IndigoPrimary)
                                    BorrowStatus.returned -> Pair(EmeraldAccent.copy(alpha = 0.2f), EmeraldAccent)
                                    BorrowStatus.overdue -> Pair(AmberWarning.copy(alpha = 0.2f), AmberWarning)
                                    BorrowStatus.lost -> Pair(RoseError.copy(alpha = 0.2f), RoseError)
                                }

                                Surface(
                                    color = statusBg,
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Text(
                                        text = record.status.name.uppercase(),
                                        color = statusColor,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier
                                            .padding(horizontal = 8.dp, vertical = 3.dp)
                                            .semantics { contentDescription = repo.getTestId("rental_status_${record.id}") }
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Dates
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text("Borrowed Date", color = TextSecondary, fontSize = 10.sp)
                                    Text(record.borrowDate, color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                }
                                Column {
                                    Text("Due Date (10 Days)", color = TextSecondary, fontSize = 10.sp)
                                    Text(record.dueDate, color = IndigoPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                Column {
                                    Text("Return Date", color = TextSecondary, fontSize = 10.sp)
                                    Text(record.returnDate ?: "Pending", color = TextPrimary, fontSize = 12.sp)
                                }
                            }

                            Divider(color = SlateBorder, modifier = Modifier.padding(vertical = 10.dp))

                            // Fees breakdown
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Base: ${repo.formatPrice(record.standardFee)}" +
                                                (if (record.lateFee > 0) " + Late: ${repo.formatPrice(record.lateFee)}" else "") +
                                                (if (record.lostFee > 0) " + Lost: ${repo.formatPrice(record.lostFee)}" else ""),
                                        color = TextSecondary,
                                        fontSize = 11.sp
                                    )
                                    Text(
                                        text = "Total Fee: ${repo.formatPrice(record.totalFee)}",
                                        color = EmeraldAccent,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        modifier = Modifier.semantics { contentDescription = repo.getTestId("rental_fee_${record.id}") }
                                    )
                                }

                                // Actions if active
                                if (record.status == BorrowStatus.active) {
                                    Row {
                                        Button(
                                            onClick = { repo.returnBook(record.id, 0) },
                                            colors = ButtonDefaults.buttonColors(backgroundColor = EmeraldAccent),
                                            shape = RoundedCornerShape(6.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            modifier = Modifier
                                                .height(32.dp)
                                                .semantics { contentDescription = repo.getTestId("btn_return_book_${record.id}") }
                                        ) {
                                            Text("Return Book", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }

                                        Spacer(modifier = Modifier.width(6.dp))

                                        OutlinedButton(
                                            onClick = { repo.markBookLost(record.id) },
                                            shape = RoundedCornerShape(6.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            modifier = Modifier
                                                .height(32.dp)
                                                .semantics { contentDescription = repo.getTestId("btn_mark_lost_${record.id}") }
                                        ) {
                                            Text("Mark Lost", color = RoseError, fontSize = 11.sp)
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
}
