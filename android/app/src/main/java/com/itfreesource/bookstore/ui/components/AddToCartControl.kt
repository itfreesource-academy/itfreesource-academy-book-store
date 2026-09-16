package com.itfreesource.bookstore.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.model.Book
import com.itfreesource.bookstore.ui.theme.*

enum class CartControlSize {
    COMPACT, // For grid/list cards
    LARGE    // For book details / dialogs
}

@Composable
fun AddToCartControl(
    book: Book,
    modifier: Modifier = Modifier,
    size: CartControlSize = CartControlSize.COMPACT,
    showInCartLabel: Boolean = false,
    initialQuantity: Int = 1,
    onAddToCartCallback: ((Book) -> Unit)? = null
) {
    val repo = BookStoreRepository
    val cartQty = repo.getCartQuantity(book.id)
    val isOutOfStock = book.stock <= 0

    val height: Dp = if (size == CartControlSize.LARGE) 44.dp else 32.dp
    val fontSize = if (size == CartControlSize.LARGE) 13.sp else 11.sp
    val iconSize: Dp = if (size == CartControlSize.LARGE) 18.dp else 14.dp

    if (cartQty > 0) {
        // In-cart Stepper
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = modifier
                .height(height)
                .background(SlateSurface, RoundedCornerShape(8.dp))
                .border(1.dp, IndigoPrimary.copy(alpha = 0.8f), RoundedCornerShape(8.dp))
                .semantics { contentDescription = repo.getTestId("cart_qty_stepper_${book.id}") }
        ) {
            IconButton(
                onClick = { repo.updateCartQuantity(book.id, cartQty - 1) },
                modifier = Modifier
                    .size(height)
                    .semantics { contentDescription = repo.getTestId("cart_qty_minus_${book.id}") }
            ) {
                Text(
                    text = "-",
                    color = RoseError,
                    fontSize = if (size == CartControlSize.LARGE) 20.sp else 16.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }

            Text(
                text = if (showInCartLabel) "$cartQty in cart" else "$cartQty",
                color = IndigoPrimary,
                fontSize = fontSize,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .padding(horizontal = 4.dp)
                    .semantics { contentDescription = repo.getTestId("cart_qty_val_${book.id}") }
            )

            IconButton(
                onClick = { repo.updateCartQuantity(book.id, cartQty + 1) },
                enabled = cartQty < book.stock,
                modifier = Modifier
                    .size(height)
                    .semantics { contentDescription = repo.getTestId("cart_qty_plus_${book.id}") }
            ) {
                Text(
                    text = "+",
                    color = if (cartQty < book.stock) EmeraldAccent else TextSecondary.copy(alpha = 0.3f),
                    fontSize = if (size == CartControlSize.LARGE) 18.sp else 15.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }
    } else {
        // Standard Add To Cart Button
        Button(
            onClick = {
                repo.addToCart(book, initialQuantity)
                onAddToCartCallback?.invoke(book)
            },
            enabled = !isOutOfStock,
            colors = ButtonDefaults.buttonColors(
                backgroundColor = IndigoPrimary,
                disabledBackgroundColor = SlateBorder
            ),
            shape = RoundedCornerShape(8.dp),
            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
            modifier = modifier
                .height(height)
                .semantics { contentDescription = repo.getTestId("btn_add_to_cart_${book.id}") }
        ) {
            Icon(
                Icons.Default.ShoppingCart,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(iconSize)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = if (isOutOfStock) "Out of Stock" else "Add to Cart",
                fontSize = fontSize,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                maxLines = 1
            )
        }
    }
}
