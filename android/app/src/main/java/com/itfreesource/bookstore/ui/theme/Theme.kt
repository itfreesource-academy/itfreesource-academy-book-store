package com.itfreesource.bookstore.ui.theme

import androidx.compose.material.MaterialTheme
import androidx.compose.material.darkColors
import androidx.compose.material.lightColors
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color

// ─── Brand colours (shared) ────────────────────────────────────────────────
val IndigoPrimary   = Color(0xFF4F46E5)
val IndigoDark      = Color(0xFF3730A3)
val EmeraldAccent   = Color(0xFF10B981)
val AmberWarning    = Color(0xFFF59E0B)
val RoseError       = Color(0xFFEF4444)
val SuccessGreen    = EmeraldAccent

// ─── Dark palette tokens ────────────────────────────────────────────────────
val SlateBackground = Color(0xFF0F172A)
val SlateSurface    = Color(0xFF1E293B)
val SlateBorder     = Color(0xFF334155)
val SlateCard       = Color(0xFF1E293B)
val TextPrimary     = Color(0xFFF8FAFC)
val TextSecondary   = Color(0xFF94A3B8)
val TextMuted       = Color(0xFF64748B)

// ─── Light palette tokens ───────────────────────────────────────────────────
val LightBackground = Color(0xFFF8FAFC)
val LightSurface    = Color(0xFFFFFFFF)
val LightBorder     = Color(0xFFE2E8F0)
val LightCard       = Color(0xFFFFFFFF)
val LightTextPrimary   = Color(0xFF0F172A)
val LightTextSecondary = Color(0xFF475569)
val LightTextMuted     = Color(0xFF94A3B8)

// ─── Global theme state (survives recomposition, toggled from TopAppBar) ────
object ThemeState {
    var isDark by mutableStateOf(true)

    fun toggle() { isDark = !isDark }
}

// ─── Convenience accessors (use these in composables) ───────────────────────
val currentBackground: Color
    @Composable get() = if (ThemeState.isDark) SlateBackground else LightBackground

val currentSurface: Color
    @Composable get() = if (ThemeState.isDark) SlateSurface else LightSurface

val currentBorder: Color
    @Composable get() = if (ThemeState.isDark) SlateBorder else LightBorder

val currentTextPrimary: Color
    @Composable get() = if (ThemeState.isDark) TextPrimary else LightTextPrimary

val currentTextSecondary: Color
    @Composable get() = if (ThemeState.isDark) TextSecondary else LightTextSecondary

val currentTextMuted: Color
    @Composable get() = if (ThemeState.isDark) TextMuted else LightTextMuted

val currentCard: Color
    @Composable get() = if (ThemeState.isDark) SlateCard else LightCard

// ─── Material colour palettes ────────────────────────────────────────────────
private val DarkColorPalette = darkColors(
    primary         = IndigoPrimary,
    primaryVariant  = IndigoDark,
    secondary       = EmeraldAccent,
    background      = SlateBackground,
    surface         = SlateSurface,
    onPrimary       = Color.White,
    onSecondary     = Color.White,
    onBackground    = TextPrimary,
    onSurface       = TextPrimary,
    error           = RoseError
)

private val LightColorPalette = lightColors(
    primary         = IndigoPrimary,
    primaryVariant  = IndigoDark,
    secondary       = EmeraldAccent,
    background      = LightBackground,
    surface         = LightSurface,
    onPrimary       = Color.White,
    onSecondary     = Color.White,
    onBackground    = LightTextPrimary,
    onSurface       = LightTextPrimary,
    error           = RoseError
)

// ─── Theme composable ────────────────────────────────────────────────────────
@Composable
fun BookStoreTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = if (ThemeState.isDark) DarkColorPalette else LightColorPalette,
        content = content
    )
}
