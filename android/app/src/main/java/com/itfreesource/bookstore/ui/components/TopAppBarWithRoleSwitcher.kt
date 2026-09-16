package com.itfreesource.bookstore.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
    val isDark = ThemeState.isDark

    val headerBg     = if (isDark) SlateSurface   else LightSurface
    val headerBorder = if (isDark) SlateBorder     else LightBorder
    val brandColor   = if (isDark) Color.White     else LightTextPrimary
    val pillBg       = if (isDark) SlateBackground else LightBackground

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(headerBg)
    ) {
        // Top row: Brand + Currency Selector + Theme Toggle + Profile
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Brand Title
            Text(
                text = "📚 BookStore",
                color = brandColor,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                maxLines = 1,
                modifier = Modifier.semantics { contentDescription = repo.getTestId("app_brand_title") }
            )

            Spacer(modifier = Modifier.width(6.dp))

            // Right side: Currency Selector + Theme Toggle + Active User Pill
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.End
            ) {
                // Currency dropdown button
                Box {
                    OutlinedButton(
                        onClick = { currencyMenuExpanded = true },
                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            backgroundColor = if (isDark) SlateBackground else LightBackground
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .height(30.dp)
                            .semantics { contentDescription = repo.getTestId("currency_selector_button") }
                    ) {
                        Text(
                            text = "${repo.activeCurrency.flag} ${repo.activeCurrency.code}",
                            color = if (isDark) TextPrimary else LightTextPrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 1
                        )
                        Icon(
                            Icons.Default.ArrowDropDown,
                            contentDescription = null,
                            tint = if (isDark) TextSecondary else LightTextSecondary,
                            modifier = Modifier.size(14.dp)
                        )
                    }

                    DropdownMenu(
                        expanded = currencyMenuExpanded,
                        onDismissRequest = { currencyMenuExpanded = false },
                        modifier = Modifier.background(if (isDark) SlateSurface else LightSurface)
                    ) {
                        Currency.values().forEach { curr ->
                            DropdownMenuItem(
                                onClick = {
                                    repo.activeCurrency = curr
                                    currencyMenuExpanded = false
                                },
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("currency_option_${curr.code}") }
                            ) {
                                Text(
                                    "${curr.flag} ${curr.name} (${curr.symbol})",
                                    color = if (isDark) TextPrimary else LightTextPrimary
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.width(4.dp))

                // ── Theme Toggle Button (Sun / Moon) ──────────────────────
                IconButton(
                    onClick = { ThemeState.toggle() },
                    modifier = Modifier
                        .size(32.dp)
                        .semantics { contentDescription = repo.getTestId("theme_toggle_button") }
                ) {
                    Icon(
                        imageVector = if (isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                        contentDescription = if (isDark) "Switch to Light Mode" else "Switch to Dark Mode",
                        tint = if (isDark) AmberWarning else IndigoPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(4.dp))

                // Active User Pill with Avatar Thumbnail
                Surface(
                    color = if (isDark) SlateBackground else LightBackground,
                    shape = RoundedCornerShape(16.dp),
                    border = ButtonDefaults.outlinedBorder,
                    modifier = Modifier
                        .clickable { onOpenProfileDialog() }
                        .semantics { contentDescription = repo.getTestId("user_profile_pill") }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(22.dp)
                                .clip(CircleShape)
                                .background(IndigoPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            if (!currentUser?.avatar.isNullOrBlank()) {
                                AsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data(currentUser!!.avatar)
                                        .crossfade(true)
                                        .build(),
                                    contentDescription = currentUser.username,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Text(
                                    text = (currentUser?.username?.take(1) ?: "U").uppercase(),
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = currentUser?.username ?: "Guest",
                            color = if (isDark) TextPrimary else LightTextPrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }

        Divider(color = if (isDark) SlateBorder else LightBorder, thickness = 0.5.dp)
    }
}
