package com.itfreesource.bookstore.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.model.UserRole
import com.itfreesource.bookstore.ui.theme.*

enum class AppScreen(val title: String, val icon: ImageVector, val testId: String) {
    CATALOG("Catalog", Icons.Default.MenuBook, "nav_catalog"),
    CART("Cart", Icons.Default.ShoppingCart, "nav_cart"),
    ORDERS("Orders", Icons.Default.Receipt, "nav_orders"),
    RENTALS("Rentals", Icons.Default.Bookmark, "nav_rentals"),
    SANDBOX("QA Lab", Icons.Default.Build, "nav_sandbox"),
    MANAGEMENT("Admin", Icons.Default.AdminPanelSettings, "nav_management")
}

@Composable
fun BottomNavigationBar(
    currentScreen: AppScreen,
    onScreenSelected: (AppScreen) -> Unit,
    cartItemCount: Int
) {
    val repo = BookStoreRepository
    val role = repo.currentUser?.role
    val isDark = ThemeState.isDark
    val navBg = if (isDark) SlateSurface else LightSurface
    val unselectedColor = if (isDark) TextSecondary else LightTextSecondary

    // Enterprise navigation: consumer navigation is clean and uncluttered.
    // Management tab is only visible to store managers / admins.
    val screens = if (role in listOf(UserRole.admin, UserRole.store_manager, UserRole.inventory_clerk, UserRole.book_reviewer, UserRole.auditor)) {
        listOf(AppScreen.CATALOG, AppScreen.CART, AppScreen.ORDERS, AppScreen.RENTALS, AppScreen.MANAGEMENT)
    } else {
        listOf(AppScreen.CATALOG, AppScreen.CART, AppScreen.ORDERS, AppScreen.RENTALS)
    }

    BottomNavigation(
        backgroundColor = navBg,
        elevation = if (isDark) 8.dp else 4.dp,
        modifier = Modifier.semantics { contentDescription = repo.getTestId("bottom_navigation_bar") }
    ) {
        screens.forEach { screen ->
            val isSelected = currentScreen == screen

            BottomNavigationItem(
                icon = {
                    Box {
                        Icon(
                            imageVector = screen.icon,
                            contentDescription = null,
                            tint = if (isSelected) IndigoPrimary else unselectedColor,
                            modifier = Modifier.size(22.dp)
                        )
                        if (screen == AppScreen.CART && cartItemCount > 0) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .offset(x = 6.dp, y = (-4).dp)
                                    .size(16.dp)
                                    .clip(CircleShape)
                                    .background(RoseError)
                                    .semantics { contentDescription = repo.getTestId("cart_badge_count") },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = cartItemCount.toString(),
                                    color = Color.White,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                },
                label = {
                    Text(
                        text = screen.title,
                        fontSize = 9.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) IndigoPrimary else unselectedColor,
                        maxLines = 1,
                        softWrap = false
                    )
                },
                selected = isSelected,
                onClick = { onScreenSelected(screen) },
                modifier = Modifier.semantics { contentDescription = repo.getTestId(screen.testId) }
            )
        }
    }
}
