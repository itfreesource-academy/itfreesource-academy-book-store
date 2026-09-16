package com.itfreesource.bookstore

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Scaffold
import androidx.compose.material.rememberScaffoldState
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.model.Book
import com.itfreesource.bookstore.ui.components.AppScreen
import com.itfreesource.bookstore.ui.components.BottomNavigationBar
import com.itfreesource.bookstore.ui.components.ProfileDialog
import com.itfreesource.bookstore.ui.components.TopAppBarWithRoleSwitcher
import com.itfreesource.bookstore.ui.screens.*
import com.itfreesource.bookstore.ui.theme.BookStoreTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BookStoreTheme {
                val repo = BookStoreRepository
                var currentScreen by remember { mutableStateOf(AppScreen.CATALOG) }
                var selectedBookForDetail by remember { mutableStateOf<Book?>(null) }
                var showProfileDialog by remember { mutableStateOf(false) }

                val scaffoldState = rememberScaffoldState()

                Scaffold(
                    scaffoldState = scaffoldState,
                    topBar = {
                        TopAppBarWithRoleSwitcher(
                            onOpenLoginDialog = { showProfileDialog = true },
                            onOpenProfileDialog = { showProfileDialog = true }
                        )
                    },
                    bottomBar = {
                        BottomNavigationBar(
                            currentScreen = currentScreen,
                            onScreenSelected = { currentScreen = it },
                            cartItemCount = repo.cartItems.sumOf { it.quantity }
                        )
                    },
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("app_main_scaffold") }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        when (currentScreen) {
                            AppScreen.CATALOG -> {
                                CatalogScreen(
                                    onBookClick = { selectedBookForDetail = it },
                                    onAddToCart = { book ->
                                        repo.addToCart(book, 1)
                                        Toast.makeText(this@MainActivity, "Added '${book.title}' to cart", Toast.LENGTH_SHORT).show()
                                    },
                                    onBorrow = { book ->
                                        val rec = repo.borrowBook(book)
                                        Toast.makeText(this@MainActivity, "Borrowed '${book.title}' for 10 days!", Toast.LENGTH_SHORT).show()
                                    }
                                )
                            }
                            AppScreen.CART -> {
                                CartCheckoutScreen(
                                    onContinueShopping = { currentScreen = AppScreen.CATALOG }
                                )
                            }
                            AppScreen.ORDERS -> {
                                OrdersScreen()
                            }
                            AppScreen.RENTALS -> {
                                RentalsScreen()
                            }
                            AppScreen.SANDBOX -> {
                                PlaygroundScreen()
                            }
                            AppScreen.MANAGEMENT -> {
                                ManagementScreen()
                            }
                        }

                        // Book Detail Modal Dialog
                        selectedBookForDetail?.let { book ->
                            BookDetailDialog(
                                book = book,
                                onDismiss = { selectedBookForDetail = null },
                                onAddToCart = { b, qty ->
                                    repo.addToCart(b, qty)
                                    Toast.makeText(this@MainActivity, "Added $qty copies of '${b.title}' to cart", Toast.LENGTH_SHORT).show()
                                },
                                onBorrow = { b ->
                                    repo.borrowBook(b)
                                    Toast.makeText(this@MainActivity, "Borrowed '${b.title}' for 10 days!", Toast.LENGTH_SHORT).show()
                                }
                            )
                        }

                        // Profile & Auth Modal Dialog
                        if (showProfileDialog) {
                            ProfileDialog(
                                onDismiss = { showProfileDialog = false }
                            )
                        }
                    }
                }
            }
        }
    }
}
