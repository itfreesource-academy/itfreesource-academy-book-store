package com.itfreesource.bookstore.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
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
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.model.Currency
import com.itfreesource.bookstore.ui.theme.*

@Composable
fun ProfileDialog(
    onDismiss: () -> Unit
) {
    val repo = BookStoreRepository
    val user = repo.currentUser

    // Manual login state
    var showLoginForm by remember { mutableStateOf(false) }
    var loginUsername by remember { mutableStateOf("admin") }
    var loginPassword by remember { mutableStateOf("Admin@Pass123") }
    var loginPasswordVisible by remember { mutableStateOf(false) }
    var loginErrorMessage by remember { mutableStateOf<String?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            color = if (ThemeState.isDark) SlateSurface else LightSurface,
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .semantics { contentDescription = repo.getTestId("user_profile_dialog") }
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (showLoginForm) "🔑 Manual Sign In" else "👤 User Profile",
                        color = if (ThemeState.isDark) TextPrimary else LightTextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_close_profile_dialog") }
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = if (ThemeState.isDark) TextSecondary else LightTextSecondary)
                    }
                }

                Divider(color = if (ThemeState.isDark) SlateBorder else LightBorder, modifier = Modifier.padding(vertical = 10.dp))

                if (showLoginForm) {
                    // Manual Login Form
                    OutlinedTextField(
                        value = loginUsername,
                        onValueChange = { loginUsername = it },
                        label = { Text("Username", color = if (ThemeState.isDark) TextSecondary else LightTextSecondary) },
                        colors = TextFieldDefaults.outlinedTextFieldColors(textColor = if (ThemeState.isDark) TextPrimary else LightTextPrimary, backgroundColor = if (ThemeState.isDark) SlateBackground else LightBackground),
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = repo.getTestId("login_input_username") }
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = loginPassword,
                        onValueChange = { loginPassword = it },
                        label = { Text("Password", color = if (ThemeState.isDark) TextSecondary else LightTextSecondary) },
                        trailingIcon = {
                            IconButton(
                                onClick = { loginPasswordVisible = !loginPasswordVisible },
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("login_btn_toggle_password") }
                            ) {
                                Icon(if (loginPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff, contentDescription = null, tint = if (ThemeState.isDark) TextSecondary else LightTextSecondary)
                            }
                        },
                        colors = TextFieldDefaults.outlinedTextFieldColors(textColor = if (ThemeState.isDark) TextPrimary else LightTextPrimary, backgroundColor = if (ThemeState.isDark) SlateBackground else LightBackground),
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = repo.getTestId("login_input_password") }
                    )

                    loginErrorMessage?.let { err ->
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = err,
                            color = RoseError,
                            fontSize = 12.sp,
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("login_error_message") }
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(modifier = Modifier.fillMaxWidth()) {
                        Button(
                            onClick = {
                                val success = repo.login(loginUsername, loginPassword)
                                if (success) {
                                    showLoginForm = false
                                    onDismiss()
                                } else {
                                    loginErrorMessage = "Invalid credentials. Try admin / Admin@Pass123"
                                }
                            },
                            colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(44.dp)
                                .semantics { contentDescription = repo.getTestId("login_btn_submit") }
                        ) {
                            Text("Sign In", color = Color.White, fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        TextButton(
                            onClick = { showLoginForm = false },
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("login_btn_cancel") }
                        ) {
                            Text("Cancel", color = if (ThemeState.isDark) TextSecondary else LightTextSecondary)
                        }
                    }
                } else {
                    // Profile Overview
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .clip(CircleShape)
                                .background(IndigoPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            if (!user?.avatar.isNullOrBlank()) {
                                AsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data(user!!.avatar)
                                        .crossfade(true)
                                        .build(),
                                    contentDescription = user.username,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Text(
                                    text = (user?.username?.take(1) ?: "U").uppercase(),
                                    color = Color.White,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = user?.fullName ?: "Guest Explorer",
                                    color = if (ThemeState.isDark) TextPrimary else LightTextPrimary,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    color = IndigoPrimary.copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = user?.role?.label ?: "Visitor",
                                        color = IndigoPrimary,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                            .semantics { contentDescription = repo.getTestId("profile_role_badge") }
                                    )
                                }
                            }
                            Text(
                                text = "@${user?.username} • ${user?.email}",
                                color = if (ThemeState.isDark) TextSecondary else LightTextSecondary,
                                fontSize = 12.sp,
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("profile_username_label") }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Currency Selection
                    Text("Selected Currency", color = if (ThemeState.isDark) TextSecondary else LightTextSecondary, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(vertical = 6.dp)
                    ) {
                        Currency.values().forEach { curr ->
                            val isSel = repo.activeCurrency == curr
                            Surface(
                                color = if (isSel) IndigoPrimary else if (ThemeState.isDark) SlateBackground else LightBackground,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .padding(end = 6.dp)
                                    .clickable { repo.activeCurrency = curr }
                                    .semantics { contentDescription = repo.getTestId("profile_currency_${curr.code}") }
                            ) {
                                Text(
                                    text = "${curr.flag} ${curr.code} (${curr.symbol})",
                                    color = if (isSel) Color.White else if (ThemeState.isDark) TextSecondary else LightTextSecondary,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Timezone Selection
                    Text("Active Regional Timezone", color = if (ThemeState.isDark) TextSecondary else LightTextSecondary, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    Surface(
                        color = if (ThemeState.isDark) SlateBackground else LightBackground,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                    ) {
                        Text(
                            text = repo.activeTimezone,
                            color = if (ThemeState.isDark) TextPrimary else LightTextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier
                                .padding(10.dp)
                                .semantics { contentDescription = repo.getTestId("profile_timezone_label") }
                        )
                    }

                    
                    val context = LocalContext.current
                    // Official Practical Quality Engineering Course card
                    Surface(
                        color = if (ThemeState.isDark) Color(0xFF1E1B4B) else Color(0xFFF3E8FF),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://academy.itfreesource.com"))
                                context.startActivity(intent)
                            }
                            .padding(vertical = 4.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("🎓", fontSize = 18.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Practical Quality Engineering Course",
                                    color = if (ThemeState.isDark) Color(0xFFC7D2FE) else Color(0xFF6B21A8),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Explore 11 RBAC test personas, credentials & labs on academy.itfreesource.com",
                                    color = if (ThemeState.isDark) Color(0xFFA5B4FC) else Color(0xFF7E22CE),
                                    fontSize = 10.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    // Actions Row (Switch via Manual Sign In OR Logout)
                    Row(modifier = Modifier.fillMaxWidth()) {
                        Button(
                            onClick = { showLoginForm = true },
                            colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .semantics { contentDescription = repo.getTestId("btn_open_login_form") }
                        ) {
                            Text("Sign In as Another User", color = Color.White, fontSize = 11.sp)
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        OutlinedButton(
                            onClick = {
                                repo.logout()
                                onDismiss()
                            },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_profile_logout") }
                        ) {
                            Text("Sign Out", color = RoseError, fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }
}
