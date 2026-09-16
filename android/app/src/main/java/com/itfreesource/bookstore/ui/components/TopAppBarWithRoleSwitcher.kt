package com.itfreesource.bookstore.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.model.Currency
import com.itfreesource.bookstore.model.User
import com.itfreesource.bookstore.ui.theme.*

@Composable
fun TopAppBarWithRoleSwitcher(
    onOpenLoginDialog: () -> Unit,
    onOpenProfileDialog: () -> Unit
) {
    val currentUser = BookStoreRepository.currentUser
    val repo = BookStoreRepository
    var currencyMenuExpanded by remember { mutableStateOf(false) }
    var showServerDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(SlateSurface)
    ) {
        // Top row: Brand + Currency Selector + Profile
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Brand Title
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "📚 ITFreeSource",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    modifier = Modifier.semantics { contentDescription = repo.getTestId("app_brand_title") }
                )
                Spacer(modifier = Modifier.width(6.dp))
                Surface(
                    color = IndigoPrimary.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = "QA SDET",
                        color = IndigoPrimary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                    )
                }
                Surface(
                    color = if (repo.isBackendConnected) EmeraldAccent.copy(alpha = 0.2f) else RoseError.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(4.dp),
                    modifier = Modifier
                        .padding(start = 6.dp)
                        .clickable { showServerDialog = true }
                        .semantics { contentDescription = repo.getTestId("btn_server_connection_dialog") }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .background(
                                    if (repo.isBackendConnected) EmeraldAccent else RoseError,
                                    shape = CircleShape
                                )
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (repo.isBackendConnected) "ONLINE" else "LOCAL",
                            color = if (repo.isBackendConnected) EmeraldAccent else RoseError,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }
            }

            // Right side: Currency Selector & Active User Pill
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Currency dropdown button
                Box {
                    OutlinedButton(
                        onClick = { currencyMenuExpanded = true },
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        colors = ButtonDefaults.outlinedButtonColors(backgroundColor = SlateBackground),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .height(34.dp)
                            .semantics { contentDescription = repo.getTestId("currency_selector_button") }
                    ) {
                        Text(
                            text = "${repo.activeCurrency.flag} ${repo.activeCurrency.code}",
                            color = TextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Icon(
                            Icons.Default.ArrowDropDown,
                            contentDescription = null,
                            tint = TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    DropdownMenu(
                        expanded = currencyMenuExpanded,
                        onDismissRequest = { currencyMenuExpanded = false },
                        modifier = Modifier.background(SlateSurface)
                    ) {
                        Currency.values().forEach { curr ->
                            DropdownMenuItem(
                                onClick = {
                                    repo.activeCurrency = curr
                                    currencyMenuExpanded = false
                                },
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("currency_option_${curr.code}") }
                            ) {
                                Text("${curr.flag} ${curr.name} (${curr.symbol})", color = TextPrimary)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.width(8.dp))

                // Active User Pill
                Surface(
                    color = SlateBackground,
                    shape = RoundedCornerShape(20.dp),
                    border = ButtonDefaults.outlinedBorder,
                    modifier = Modifier
                        .clickable { onOpenProfileDialog() }
                        .semantics { contentDescription = repo.getTestId("user_profile_pill") }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(22.dp)
                                .clip(CircleShape)
                                .background(IndigoPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = (currentUser?.username?.take(1) ?: "U").uppercase(),
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = currentUser?.username ?: "Guest",
                            color = TextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

        Divider(color = SlateBorder, thickness = 0.5.dp)

        // Horizontal 1-Click Role Switcher Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "SWITCH ROLE:",
                color = TextSecondary,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(end = 6.dp)
            )

            repo.users.forEach { user ->
                val isSelected = currentUser?.id == user.id
                Surface(
                    color = if (isSelected) IndigoPrimary else SlateBackground,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .padding(horizontal = 3.dp)
                        .clickable { repo.switchUser(user) }
                        .semantics { contentDescription = repo.getTestId("role_chip_${user.username}") }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = when (user.role.name) {
                                "admin" -> "👑 "
                                "vip_customer" -> "💎 "
                                "book_reviewer" -> "⭐ "
                                "order_fulfillment" -> "📦 "
                                "inventory_clerk" -> "📊 "
                                "support_agent" -> "🎧 "
                                else -> "👤 "
                            } + user.role.label,
                            color = if (isSelected) Color.White else TextSecondary,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }
            }
        }
    }

    if (showServerDialog) {
        ServerConnectionDialog(onDismiss = { showServerDialog = false })
    }
}
