package com.itfreesource.bookstore.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.itfreesource.bookstore.ui.theme.IndigoPrimary
import com.itfreesource.bookstore.ui.theme.SlateSurface

private const val LINKEDIN_URL = "https://www.linkedin.com/in/vishalprajapati2k25/"

/**
 * Persistent attribution footer shown at the very bottom of the app,
 * matching the web footer's "Open Source Contribution by Vishal Prajapati" label.
 * Tapping "Vishal Prajapati" opens his LinkedIn profile in the browser.
 */
@Composable
fun AttributionFooter(modifier: Modifier = Modifier) {
    val context = LocalContext.current

    val text = buildAnnotatedString {
        withStyle(style = SpanStyle(color = Color(0xFF94A3B8), fontSize = 10.sp)) {
            append("Open Source Contribution by ")
        }
        withStyle(
            style = SpanStyle(
                color = IndigoPrimary,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )
        ) {
            append("Vishal Prajapati")
        }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateSurface)
            .padding(vertical = 6.dp, horizontal = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            textAlign = TextAlign.Center,
            modifier = Modifier.clickable {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(LINKEDIN_URL))
                context.startActivity(intent)
            }
        )
    }
}
