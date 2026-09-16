package com.itfreesource.bookstore.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.itfreesource.bookstore.data.ApiClient
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun ServerConnectionDialog(
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val repo = BookStoreRepository
    val coroutineScope = rememberCoroutineScope()

    var inputUrl by remember { mutableStateOf(ApiClient.baseUrl) }
    var testResult by remember { mutableStateOf<Pair<Boolean, String>?>(null) }
    var isTesting by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            backgroundColor = SlateSurface,
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxWidth()
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "🌐 Web API Connection",
                            color = Color.White,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("dialog_server_connection_title") }
                        )
                        Text(
                            text = "Sync orders & catalog with Web Store",
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                    }
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Current Status Badge
                Surface(
                    color = if (repo.isBackendConnected) EmeraldAccent.copy(alpha = 0.15f) else RoseError.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp),
                    border = ButtonDefaults.outlinedBorder,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (repo.isBackendConnected) "🟢 Status: Live Connected" else "🔴 Status: Offline / Local Store",
                            color = if (repo.isBackendConnected) EmeraldAccent else RoseError,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 12.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "API Base URL:",
                    color = TextPrimary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(6.dp))

                OutlinedTextField(
                    value = inputUrl,
                    onValueChange = {
                        inputUrl = it
                        testResult = null
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .semantics { contentDescription = repo.getTestId("input_dialog_server_url") },
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        textColor = TextPrimary,
                        cursorColor = IndigoPrimary,
                        focusedBorderColor = IndigoPrimary,
                        unfocusedBorderColor = SlateBorder
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Fast Preset Chips
                Text("Quick Presets:", color = TextSecondary, fontSize = 11.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    OutlinedButton(
                        onClick = { inputUrl = ApiClient.LIVE_CLOUDFLARE_URL; testResult = null },
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(backgroundColor = IndigoPrimary.copy(alpha = 0.2f)),
                        modifier = Modifier.weight(1.1f).height(34.dp)
                    ) {
                        Text("☁️ Live Cloud", color = TextPrimary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                    OutlinedButton(
                        onClick = { inputUrl = ApiClient.DEFAULT_WIFI_HOST_URL; testResult = null },
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(backgroundColor = SlateBackground),
                        modifier = Modifier.weight(1f).height(34.dp)
                    ) {
                        Text("🏠 Wi-Fi PC", color = TextPrimary, fontSize = 10.sp)
                    }
                    OutlinedButton(
                        onClick = { inputUrl = ApiClient.DEFAULT_EMULATOR_URL; testResult = null },
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(backgroundColor = SlateBackground),
                        modifier = Modifier.weight(1f).height(34.dp)
                    ) {
                        Text("📱 Emulator", color = TextPrimary, fontSize = 10.sp)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Test Connection Feedback
                testResult?.let { (ok, msg) ->
                    Surface(
                        color = if (ok) EmeraldAccent.copy(alpha = 0.15f) else RoseError.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                    ) {
                        Text(
                            text = msg,
                            color = if (ok) EmeraldAccent else RoseError,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(8.dp)
                        )
                    }
                }

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            isTesting = true
                            testResult = null
                            coroutineScope.launch {
                                ApiClient.setCustomBaseUrl(context, inputUrl)
                                val res = ApiClient.testConnection()
                                testResult = res
                                isTesting = false
                                if (res.first) {
                                    repo.syncWithBackend()
                                }
                            }
                        },
                        enabled = !isTesting,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f).height(42.dp)
                    ) {
                        if (isTesting) {
                            CircularProgressIndicator(modifier = Modifier.size(16.dp), color = IndigoPrimary, strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Default.Refresh, contentDescription = null, tint = IndigoPrimary, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Test", color = IndigoPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Button(
                        onClick = {
                            ApiClient.setCustomBaseUrl(context, inputUrl)
                            repo.syncWithBackend()
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1.5f).height(42.dp)
                    ) {
                        Text("Save & Sync", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
