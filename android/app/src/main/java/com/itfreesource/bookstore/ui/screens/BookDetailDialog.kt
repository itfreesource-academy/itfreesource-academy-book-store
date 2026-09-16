package com.itfreesource.bookstore.ui.screens

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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.model.Book
import com.itfreesource.bookstore.model.Review
import com.itfreesource.bookstore.model.ReviewStatus
import com.itfreesource.bookstore.ui.theme.*

@Composable
fun BookDetailDialog(
    book: Book,
    onDismiss: () -> Unit,
    onAddToCart: (Book, Int) -> Unit,
    onBorrow: (Book) -> Unit
) {
    val repo = BookStoreRepository
    var quantity by remember { mutableStateOf(1) }
    var showReviewModal by remember { mutableStateOf(false) }

    val bookReviews = repo.reviews.filter { it.bookId == book.id && it.status == ReviewStatus.approved }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            color = SlateSurface,
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.90f)
                .semantics { contentDescription = repo.getTestId("book_detail_modal") }
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Modal Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Book Details",
                        color = TextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_close_detail_modal") }
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                    }
                }

                Divider(color = SlateBorder, thickness = 0.5.dp)

                // Scrollable Content
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 16.dp)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(12.dp))

                        // Large Cover Image Box
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(SlateBackground)
                                .border(1.dp, SlateBorder, RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            if (book.coverImage.isNotBlank()) {
                                AsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data(book.coverImage)
                                        .crossfade(true)
                                        .build(),
                                    contentDescription = book.title,
                                    contentScale = ContentScale.Fit,
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(8.dp)
                                )
                            } else {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("📚", fontSize = 48.sp)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = book.title,
                                        color = TextPrimary,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 16.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Category & Stock Status Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                color = IndigoPrimary.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = book.categoryName,
                                    color = IndigoPrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }

                            val (stockLabel, stockColor) = when {
                                book.stock <= 0 -> Pair("Out of Stock", RoseError)
                                book.stock <= 5 -> Pair("Low Stock: ${book.stock} left", AmberWarning)
                                else -> Pair("In Stock (${book.stock})", EmeraldAccent)
                            }
                            Surface(
                                color = stockColor.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = stockLabel,
                                    color = stockColor,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                        .semantics { contentDescription = repo.getTestId("detail_stock_badge") }
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Title
                        Text(
                            text = book.title,
                            color = TextPrimary,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("detail_book_title") }
                        )

                        // Author
                        Text(
                            text = "by ${book.authorName}",
                            color = IndigoPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier
                                .padding(top = 2.dp)
                                .semantics { contentDescription = repo.getTestId("detail_book_author") }
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Meta details: ISBN, Pages, Rating
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(SlateBackground, RoundedCornerShape(8.dp))
                                .padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Rating", color = TextSecondary, fontSize = 10.sp)
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Star, contentDescription = null, tint = AmberWarning, modifier = Modifier.size(14.dp))
                                    Text("${book.rating}", color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Pages", color = TextSecondary, fontSize = 10.sp)
                                Text("${book.pages}", color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("ISBN", color = TextSecondary, fontSize = 10.sp)
                                Text(book.isbn.takeLast(10), color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Description
                        Text("Overview", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = book.description.ifBlank { "Seminal engineering book on craftsmanship, scalable software architecture, and resilient computing patterns." },
                            color = TextSecondary,
                            fontSize = 13.sp,
                            lineHeight = 18.sp,
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("detail_book_description") }
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // VIP customer discount banner
                        if (repo.currentUser?.role?.name == "vip_customer") {
                            Surface(
                                color = EmeraldAccent.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("💎", fontSize = 16.sp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "VIP Benefit: 20% discount applied automatically at checkout!",
                                        color = EmeraldAccent,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.semantics { contentDescription = repo.getTestId("vip_discount_banner") }
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                        }

                        // Reviews Section Header
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Reviews (${bookReviews.size})",
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            TextButton(
                                onClick = { showReviewModal = true },
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_open_add_review") }
                            ) {
                                Icon(Icons.Default.RateReview, contentDescription = null, tint = IndigoPrimary, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Write Review", color = IndigoPrimary, fontSize = 12.sp)
                            }
                        }
                    }

                    // Reviews List
                    if (bookReviews.isEmpty()) {
                        item {
                            Text(
                                text = "No reviews yet. Be the first to share your thoughts!",
                                color = TextSecondary,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                    } else {
                        items(bookReviews) { rev ->
                            Surface(
                                color = SlateBackground,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .semantics { contentDescription = repo.getTestId("review_item_${rev.id}") }
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(rev.username, color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            repeat(rev.rating.toInt()) {
                                                Icon(Icons.Default.Star, contentDescription = null, tint = AmberWarning, modifier = Modifier.size(12.dp))
                                            }
                                        }
                                    }
                                    Text(rev.title, color = IndigoPrimary, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 2.dp))
                                    Text(rev.comment, color = TextSecondary, fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))
                                }
                            }
                        }
                    }

                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }

                Divider(color = SlateBorder, thickness = 0.5.dp)

                // Sticky Bottom Action Bar
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SlateSurface)
                        .padding(16.dp)
                ) {
                    // Price and Quantity Stepper
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Total Price", color = TextSecondary, fontSize = 10.sp)
                            Text(
                                text = repo.formatPrice(book.price * quantity),
                                color = Color.White,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("detail_total_price") }
                            )
                        }

                        // Stepper (- / +)
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .background(SlateBackground, RoundedCornerShape(8.dp))
                                .border(1.dp, SlateBorder, RoundedCornerShape(8.dp))
                        ) {
                            IconButton(
                                onClick = { if (quantity > 1) quantity-- },
                                modifier = Modifier
                                    .size(36.dp)
                                    .semantics { contentDescription = repo.getTestId("detail_qty_minus") }
                            ) {
                                Text("-", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            }
                            Text(
                                text = "$quantity",
                                color = TextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier
                                    .padding(horizontal = 8.dp)
                                    .semantics { contentDescription = repo.getTestId("detail_qty_label") }
                            )
                            IconButton(
                                onClick = { if (quantity < book.stock) quantity++ },
                                modifier = Modifier
                                    .size(36.dp)
                                    .semantics { contentDescription = repo.getTestId("detail_qty_plus") }
                            ) {
                                Text("+", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Action Buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                onAddToCart(book, quantity)
                                onDismiss()
                            },
                            enabled = book.stock > 0,
                            colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                            modifier = Modifier
                                .weight(1.1f)
                                .height(44.dp)
                                .semantics { contentDescription = repo.getTestId("detail_btn_add_to_cart") }
                        ) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Add to Cart", color = Color.White, fontWeight = FontWeight.Bold, maxLines = 1)
                        }

                        OutlinedButton(
                            onClick = {
                                onBorrow(book)
                                onDismiss()
                            },
                            enabled = book.stock > 0,
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(backgroundColor = SlateBackground),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(44.dp)
                                .semantics { contentDescription = repo.getTestId("detail_btn_borrow") }
                        ) {
                            Icon(Icons.Default.Bookmark, contentDescription = null, tint = TextPrimary, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Borrow (${repo.formatPrice(book.rentalPrice)})", color = TextPrimary, fontSize = 11.sp, maxLines = 1)
                        }
                    }
                }
            }
        }
    }

    // Write Review Modal Dialog
    if (showReviewModal) {
        var revTitle by remember { mutableStateOf("") }
        var revComment by remember { mutableStateOf("") }
        var revRating by remember { mutableStateOf(5.0) }

        AlertDialog(
            onDismissRequest = { showReviewModal = false },
            backgroundColor = SlateSurface,
            title = {
                Text("Write a Review", color = TextPrimary, fontWeight = FontWeight.Bold)
            },
            text = {
                Column {
                    Text("Rating: ${revRating.toInt()} Stars", color = AmberWarning, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Row(modifier = Modifier.padding(vertical = 4.dp)) {
                        (1..5).forEach { star ->
                            Icon(
                                Icons.Default.Star,
                                contentDescription = "Star $star",
                                tint = if (star <= revRating) AmberWarning else SlateBorder,
                                modifier = Modifier
                                    .size(28.dp)
                                    .clickable { revRating = star.toDouble() }
                                    .semantics { contentDescription = repo.getTestId("star_rating_$star") }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = revTitle,
                        onValueChange = { revTitle = it },
                        label = { Text("Headline / Summary", color = TextSecondary) },
                        colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateBackground),
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = repo.getTestId("input_review_title") }
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = revComment,
                        onValueChange = { revComment = it },
                        label = { Text("Your detailed review", color = TextSecondary) },
                        maxLines = 4,
                        colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateBackground),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp)
                            .semantics { contentDescription = repo.getTestId("input_review_comment") }
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (revTitle.isNotBlank()) {
                            repo.addReview(book.id, revRating, revTitle, revComment)
                            showReviewModal = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_submit_review") }
                ) {
                    Text("Submit Review", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showReviewModal = false },
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_cancel_review") }
                ) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }
}
