package com.itfreesource.bookstore.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.model.Book
import com.itfreesource.bookstore.ui.theme.*

@Composable
fun BookCard(
    book: Book,
    onBookClick: (Book) -> Unit,
    onAddToCart: (Book) -> Unit,
    onBorrow: (Book) -> Unit,
    modifier: Modifier = Modifier
) {
    val repo = BookStoreRepository

    Card(
        backgroundColor = SlateSurface,
        shape = RoundedCornerShape(12.dp),
        elevation = 2.dp,
        modifier = modifier
            .fillMaxWidth()
            .border(0.5.dp, SlateBorder, RoundedCornerShape(12.dp))
            .clickable { onBookClick(book) }
            .semantics { contentDescription = repo.getTestId("book_card_${book.id}") }
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Header: Category Pill & Stock Status
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
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                            .semantics { contentDescription = repo.getTestId("book_category_${book.id}") }
                    )
                }

                // Stock Badge
                val (stockText, stockColor) = when {
                    book.stock <= 0 -> Pair("Out of Stock", RoseError)
                    book.stock <= 5 -> Pair("Low Stock (${book.stock})", AmberWarning)
                    else -> Pair("In Stock (${book.stock})", EmeraldAccent)
                }
                Surface(
                    color = stockColor.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = stockText,
                        color = stockColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                            .semantics { contentDescription = repo.getTestId("book_stock_${book.id}") }
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Book Mock Cover Placeholder
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(SlateBackground)
                    .border(1.dp, SlateBorder, RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(8.dp)
                ) {
                    Text(
                        text = "📖",
                        fontSize = 32.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = book.title,
                        color = TextPrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Title
            Text(
                text = book.title,
                color = TextPrimary,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.semantics { contentDescription = repo.getTestId("book_title_${book.id}") }
            )

            // Author
            Text(
                text = "by ${book.authorName}",
                color = TextSecondary,
                fontSize = 12.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier
                    .padding(top = 2.dp)
                    .semantics { contentDescription = repo.getTestId("book_author_${book.id}") }
            )

            // Rating Stars
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 4.dp)
            ) {
                Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    tint = AmberWarning,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(3.dp))
                Text(
                    text = "${book.rating} (${book.reviewCount})",
                    color = TextSecondary,
                    fontSize = 11.sp,
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("book_rating_${book.id}") }
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Pricing Row
            Row(
                verticalAlignment = Alignment.Bottom,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = repo.formatPrice(book.price),
                    color = Color.White,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 16.sp,
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("book_price_${book.id}") }
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = repo.formatPrice(book.originalPrice),
                    color = TextSecondary,
                    fontSize = 12.sp,
                    textDecoration = TextDecoration.LineThrough
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons (Add to Cart + Borrow)
            Row(modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = { onAddToCart(book) },
                    enabled = book.stock > 0,
                    colors = ButtonDefaults.buttonColors(
                        backgroundColor = IndigoPrimary,
                        disabledBackgroundColor = SlateBorder
                    ),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(34.dp)
                        .semantics { contentDescription = repo.getTestId("btn_add_to_cart_${book.id}") }
                ) {
                    Text(
                        text = if (book.stock > 0) "Add Cart" else "Out of Stock",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.width(6.dp))

                OutlinedButton(
                    onClick = { onBorrow(book) },
                    enabled = book.stock > 0,
                    colors = ButtonDefaults.outlinedButtonColors(backgroundColor = SlateBackground),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp, vertical = 6.dp),
                    modifier = Modifier
                        .weight(0.9f)
                        .height(34.dp)
                        .semantics { contentDescription = repo.getTestId("btn_borrow_${book.id}") }
                ) {
                    Text(
                        text = "Borrow (${repo.formatPrice(book.rentalPrice)})",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextPrimary
                    )
                }
            }
        }
    }
}
