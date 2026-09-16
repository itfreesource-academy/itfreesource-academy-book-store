package com.itfreesource.bookstore.ui.theme

import androidx.compose.material.MaterialTheme
import androidx.compose.material.darkColors
import androidx.compose.material.lightColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val IndigoPrimary = Color(0xFF4F46E5)
val IndigoDark = Color(0xFF3730A3)
val EmeraldAccent = Color(0xFF10B981)
val SlateBackground = Color(0xFF0F172A)
val SlateSurface = Color(0xFF1E293B)
val SlateBorder = Color(0xFF334155)
val TextPrimary = Color(0xFFF8FAFC)
val TextSecondary = Color(0xFF94A3B8)
val AmberWarning = Color(0xFFF59E0B)
val RoseError = Color(0xFFEF4444)
val SuccessGreen = EmeraldAccent
val SlateCard = Color(0xFF1E293B)
val TextMuted = Color(0xFF64748B)

private val DarkColorPalette = darkColors(
    primary = IndigoPrimary,
    primaryVariant = IndigoDark,
    secondary = EmeraldAccent,
    background = SlateBackground,
    surface = SlateSurface,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    error = RoseError
)

@Composable
fun BookStoreTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = DarkColorPalette,
        content = content
    )
}
