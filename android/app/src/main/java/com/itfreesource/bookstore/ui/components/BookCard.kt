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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
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
        Column(modifier = Modifier.padding(10.dp)) {
            // Book Cover Image Container with Stock Overlay Badge
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(SlateBackground)
                    .border(1.dp, SlateBorder, RoundedCornerShape(8.dp)),
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
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "📖", fontSize = 32.sp)
                    }
                }

                // Stock Overlay Badge at Top-Right of Cover
                val (stockText, stockColor) = when {
                    book.stock <= 0 -> Pair("Out of Stock", RoseError)
                    book.stock <= 5 -> Pair("Low (${book.stock})", AmberWarning)
                    else -> Pair("In Stock (${book.stock})", EmeraldAccent)
                }
                Surface(
                    color = SlateSurface.copy(alpha = 0.92f),
                    shape = RoundedCornerShape(4.dp),
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(4.dp)
                ) {
                    Text(
                        text = stockText,
                        color = stockColor,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        modifier = Modifier
                            .padding(horizontal = 5.dp, vertical = 2.dp)
                            .semantics { contentDescription = repo.getTestId("book_stock_${book.id}") }
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Category Pill (Responsive, 1-line truncation)
            Surface(
                color = IndigoPrimary.copy(alpha = 0.18f),
                shape = RoundedCornerShape(4.dp),
                modifier = Modifier.fillMaxWidth(0.9f)
            ) {
                Text(
                    text = book.categoryName,
                    color = IndigoPrimary,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                        .semantics { contentDescription = repo.getTestId("book_category_${book.id}") }
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Title (Fixed 2 lines for grid uniformity, never wrapped to single letters)
            Text(
                text = book.title,
                color = TextPrimary,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                minLines = 2,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.semantics { contentDescription = repo.getTestId("book_title_${book.id}") }
            )

            // Author
            Text(
                text = "by ${book.authorName}",
                color = TextSecondary,
                fontSize = 11.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier
                    .padding(top = 1.dp)
                    .semantics { contentDescription = repo.getTestId("book_author_${book.id}") }
            )

            // Rating Stars
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 3.dp)
            ) {
                Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    tint = AmberWarning,
                    modifier = Modifier.size(13.dp)
                )
                Spacer(modifier = Modifier.width(3.dp))
                Text(
                    text = "${book.rating} (${book.reviewCount})",
                    color = TextSecondary,
                    fontSize = 11.sp,
                    maxLines = 1,
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("book_rating_${book.id}") }
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Pricing Row
            Row(
                verticalAlignment = Alignment.Bottom,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = repo.formatPrice(book.price),
                    color = Color.White,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 15.sp,
                    maxLines = 1,
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("book_price_${book.id}") }
                )
                if (book.originalPrice > book.price) {
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = repo.formatPrice(book.originalPrice),
                        color = TextSecondary,
                        fontSize = 11.sp,
                        textDecoration = TextDecoration.LineThrough,
                        maxLines = 1
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Action Buttons: Stacked vertically with full width to guarantee text NEVER squeezes into 1 character!
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Button(
                    onClick = { onAddToCart(book) },
                    enabled = book.stock > 0,
                    colors = ButtonDefaults.buttonColors(
                        backgroundColor = IndigoPrimary,
                        disabledBackgroundColor = SlateBorder
                    ),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp, vertical = 4.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(32.dp)
                        .semantics { contentDescription = repo.getTestId("btn_add_to_cart_${book.id}") }
                ) {
                    Text(
                        text = if (book.stock > 0) "Add to Cart" else "Out of Stock",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        maxLines = 1
                    )
                }

                OutlinedButton(
                    onClick = { onBorrow(book) },
                    enabled = book.stock > 0,
                    colors = ButtonDefaults.outlinedButtonColors(backgroundColor = SlateBackground),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp, vertical = 4.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(28.dp)
                        .semantics { contentDescription = repo.getTestId("btn_borrow_${book.id}") }
                ) {
                    Text(
                        text = "Borrow • ${repo.formatPrice(book.rentalPrice)}",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextPrimary,
                        maxLines = 1
                    )
                }
            }
        }
    }
}

