package com.itfreesource.bookstore.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
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
import com.itfreesource.bookstore.model.BorrowStatus
import com.itfreesource.bookstore.ui.theme.*

@Composable
fun RentalsScreen() {
    val repo = BookStoreRepository
    var simulateOverdueDays by remember { mutableStateOf(3) }

    LaunchedEffect(Unit) {
        repo.syncWithBackend()
    }

    val isDark = ThemeState.isDark

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(if (isDark) SlateBackground else LightBackground)
    ) {
        // Header
        Surface(
            color = if (isDark) SlateSurface else LightSurface,
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
                    }
                    IconButton(
                        onClick = { repo.syncWithBackend() },
                        enabled = !repo.isSyncingBackend,
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_sync_rentals") }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh rentals",
                            tint = if (repo.isSyncingBackend) IndigoPrimary else TextSecondary
                        )
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
                        backgroundColor = if (isDark) SlateSurface else LightSurface,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(0.5.dp, SlateBorder, RoundedCornerShape(12.dp))
                            .semantics { contentDescription = repo.getTestId("rental_card_${record.id}") }
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            // Header: Cover + Title and Status Badge
                            val matchingBook = repo.books.find { it.id == record.bookId }
                            val coverUrl = record.bookCover.ifBlank { matchingBook?.coverImage ?: "" }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(42.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(SlateBackground)
                                        .border(0.5.dp, SlateBorder, RoundedCornerShape(6.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (coverUrl.isNotBlank()) {
                                        AsyncImage(
                                            model = ImageRequest.Builder(LocalContext.current)
                                                .data(coverUrl)
                                                .crossfade(true)
                                                .build(),
                                            contentDescription = record.bookTitle,
                                            contentScale = ContentScale.Crop,
                                            modifier = Modifier.fillMaxSize()
                                        )
                                    } else {
                                        Text("📖", fontSize = 20.sp)
                                    }
                                }

                                Spacer(modifier = Modifier.width(10.dp))

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = record.bookTitle,
                                        color = TextPrimary,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis,
                                        modifier = Modifier.semantics { contentDescription = repo.getTestId("rental_title_${record.id}") }
                                    )
                                    Text(
                                        text = "User: @${record.username}",
                                        color = TextSecondary,
                                        fontSize = 11.sp,
                                        maxLines = 1
                                    )
                                }

                                Spacer(modifier = Modifier.width(6.dp))

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
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 1,
                                        modifier = Modifier
                                            .padding(horizontal = 7.dp, vertical = 3.dp)
                                            .semantics { contentDescription = repo.getTestId("rental_status_${record.id}") }
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Dates (Weighted 1f columns to prevent single-character squishing!)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Borrowed", color = TextSecondary, fontSize = 10.sp, maxLines = 1)
                                    Text(record.borrowDate, color = TextPrimary, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Due (10 Days)", color = TextSecondary, fontSize = 10.sp, maxLines = 1)
                                    Text(record.dueDate, color = IndigoPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Returned", color = TextSecondary, fontSize = 10.sp, maxLines = 1)
                                    Text(record.returnDate ?: "Pending", color = TextPrimary, fontSize = 11.sp, maxLines = 1)
                                }
                            }

                            Divider(color = if (isDark) SlateBorder else LightBorder, modifier = Modifier.padding(vertical = 10.dp))

                            // Fees breakdown & Actions
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f, fill = false)) {
                                    Text(
                                        text = "Base: ${repo.formatPrice(record.standardFee)}" +
                                                (if (record.lateFee > 0) " + Late: ${repo.formatPrice(record.lateFee)}" else "") +
                                                (if (record.lostFee > 0) " + Lost: ${repo.formatPrice(record.lostFee)}" else ""),
                                        color = TextSecondary,
                                        fontSize = 10.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = "Total Fee: ${repo.formatPrice(record.totalFee)}",
                                        color = EmeraldAccent,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        maxLines = 1,
                                        modifier = Modifier.semantics { contentDescription = repo.getTestId("rental_fee_${record.id}") }
                                    )
                                }

                                // Actions if active
                                if (record.status == BorrowStatus.active) {
                                    Row(horizontalArrangement = Arrangement.End) {
                                        Button(
                                            onClick = { repo.returnBook(record.id, 0) },
                                            colors = ButtonDefaults.buttonColors(backgroundColor = EmeraldAccent),
                                            shape = RoundedCornerShape(6.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            modifier = Modifier
                                                .height(30.dp)
                                                .semantics { contentDescription = repo.getTestId("btn_return_book_${record.id}") }
                                        ) {
                                            Text("Return", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                                        }

                                        Spacer(modifier = Modifier.width(6.dp))

                                        OutlinedButton(
                                            onClick = { repo.markBookLost(record.id) },
                                            shape = RoundedCornerShape(6.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            modifier = Modifier
                                                .height(30.dp)
                                                .semantics { contentDescription = repo.getTestId("btn_mark_lost_${record.id}") }
                                        ) {
                                            Text("Lost", color = RoseError, fontSize = 11.sp, maxLines = 1)
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
