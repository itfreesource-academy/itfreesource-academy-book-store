package com.itfreesource.bookstore.ui.screens

import android.app.AlertDialog
import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.Toast
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.Calendar
import java.util.Locale

enum class PlaygroundTab(val title: String, val testId: String) {
    LOCATORS("Locators & IDs", "tab_pg_locators"),
    GESTURES("Gestures", "tab_pg_gestures"),
    DIALOGS("Native Dialogs", "tab_pg_dialogs"),
    FORMS("Form Controls", "tab_pg_forms"),
    CHAOS("Latency & Errors", "tab_pg_chaos"),
    WEBVIEW("Hybrid WebView", "tab_pg_webview"),
    API_SYNC("Web Sync & API", "tab_pg_apisync")
}

@Composable
fun PlaygroundScreen() {
    val repo = BookStoreRepository
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val scaffoldState = rememberScaffoldState()

    var activeTab by remember { mutableStateOf(PlaygroundTab.LOCATORS) }

    // Dialog result feedback
    var dialogResultText by remember { mutableStateOf("No dialog action taken yet.") }

    // Gesture counters
    var longPressCount by remember { mutableStateOf(0) }
    var doubleTapCount by remember { mutableStateOf(0) }
    var singleTapCount by remember { mutableStateOf(0) }

    // Reorderable list for drag & drop test
    var priorityItems by remember {
        mutableStateOf(mutableListOf("1. Dune (Herbert)", "2. Clean Code (Martin)", "3. Atomic Habits (Clear)", "4. Sapiens (Harari)"))
    }

    // Form inputs state
    var textInputVal by remember { mutableStateOf("") }
    var textInputError by remember { mutableStateOf<String?>(null) }
    var passwordVal by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var textAreaVal by remember { mutableStateOf("Testing multi-line comments for Appium text input typing.") }
    var checkboxA by remember { mutableStateOf(true) }
    var checkboxB by remember { mutableStateOf(false) }
    var selectedRadio by remember { mutableStateOf("Option 1") }
    var switchVal by remember { mutableStateOf(true) }
    var spinnerVal by remember { mutableStateOf("Item Alpha") }
    var spinnerExpanded by remember { mutableStateOf(false) }
    var continuousSliderVal by remember { mutableStateOf(50f) }
    var discreteSliderVal by remember { mutableStateOf(3f) }

    // Chaos & error injection state
    var injectedErrorStatus by remember { mutableStateOf<Int?>(null) }
    var injectedErrorMessage by remember { mutableStateOf<String?>(null) }
    var isSimulatingCall by remember { mutableStateOf(false) }
    var customBaseUrl by remember { mutableStateOf(com.itfreesource.bookstore.data.ApiClient.baseUrl) }

    Scaffold(
        scaffoldState = scaffoldState,
        backgroundColor = SlateBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Header
            Surface(
                color = SlateSurface,
                elevation = 4.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "🧪 QA Automation Sandbox",
                                color = TextPrimary,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("playground_title") }
                            )
                            Text(
                                text = "Built specifically for Appium mobile test engineering",
                                color = TextSecondary,
                                fontSize = 11.sp
                            )
                        }

                        // Reset Database Button
                        Button(
                            onClick = {
                                repo.resetToInitialSeed()
                                Toast.makeText(context, "Database restored to seed state!", Toast.LENGTH_SHORT).show()
                            },
                            colors = ButtonDefaults.buttonColors(backgroundColor = RoseError),
                            shape = RoundedCornerShape(6.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier
                                .height(32.dp)
                                .semantics { contentDescription = repo.getTestId("btn_reset_database_seed") }
                        ) {
                            Text("Reset DB", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Tab Selector
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        PlaygroundTab.values().forEach { tab ->
                            val isSel = activeTab == tab
                            Surface(
                                color = if (isSel) IndigoPrimary else SlateBackground,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .padding(end = 6.dp)
                                    .clickable { activeTab = tab }
                                    .semantics { contentDescription = repo.getTestId(tab.testId) }
                            ) {
                                Text(
                                    text = tab.title,
                                    color = if (isSel) Color.White else TextSecondary,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Tab Content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                when (activeTab) {
                    PlaygroundTab.LOCATORS -> {
                        // Dynamic vs Static ID Switcher Section
                        Card(
                            backgroundColor = SlateSurface,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(0.5.dp, SlateBorder, RoundedCornerShape(12.dp))
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Dynamic vs Static Locators Engine",
                                    color = TextPrimary,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "Toggle this switch to test your Appium test suite's locator resilience against dynamic content descriptions and resource IDs.",
                                    color = TextSecondary,
                                    fontSize = 12.sp
                                )

                                Spacer(modifier = Modifier.height(14.dp))

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(SlateBackground, RoundedCornerShape(8.dp))
                                        .padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = if (repo.useDynamicIds) "⚡ Dynamic IDs ACTIVE" else "🔒 Static IDs ACTIVE",
                                            color = if (repo.useDynamicIds) AmberWarning else EmeraldAccent,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp,
                                            modifier = Modifier.semantics { contentDescription = repo.getTestId("locator_mode_status_label") }
                                        )
                                        Text(
                                            text = if (repo.useDynamicIds) "IDs will have random hash prefixes" else "Deterministic, predictable IDs",
                                            color = TextSecondary,
                                            fontSize = 11.sp
                                        )
                                    }

                                    Switch(
                                        checked = repo.useDynamicIds,
                                        onCheckedChange = { repo.useDynamicIds = it },
                                        colors = SwitchDefaults.colors(checkedThumbColor = AmberWarning),
                                        modifier = Modifier.semantics { contentDescription = repo.getTestId("switch_toggle_dynamic_ids") }
                                    )
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                Text("Sample Locators under current mode:", color = TextSecondary, fontSize = 12.sp)
                                Spacer(modifier = Modifier.height(6.dp))
                                Surface(
                                    color = SlateBackground,
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(10.dp)) {
                                        Text("• Button ID: ${repo.getTestId("btn_sample_action")}", color = IndigoPrimary, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                                        Text("• Input ID: ${repo.getTestId("input_sample_search")}", color = IndigoPrimary, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                                        Text("• Card ID: ${repo.getTestId("card_sample_item")}", color = IndigoPrimary, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                                    }
                                }
                            }
                        }
                    }

                    PlaygroundTab.GESTURES -> {
                        // GESTURES SANDBOX
                        Text("Mobile Touch & Gestures Lab", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(8.dp))

                        // Horizontal Swipeable Cards
                        Text("1. Horizontal Swipe Carousel (Swipe left/right)", color = TextSecondary, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .semantics { contentDescription = repo.getTestId("gesture_swipe_carousel") }
                        ) {
                            itemsIndexed(listOf("Card A (Swipeable)", "Card B (Swipeable)", "Card C (Swipeable)", "Card D (Swipeable)")) { idx, label ->
                                Card(
                                    backgroundColor = IndigoDark,
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier
                                        .width(180.dp)
                                        .height(100.dp)
                                        .semantics { contentDescription = repo.getTestId("swipe_card_$idx") }
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(label, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Long-Press & Double-Tap Targets
                        Text("2. Long-Press & Double-Tap Targets", color = TextSecondary, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(modifier = Modifier.fillMaxWidth()) {
                            // Long Press Box
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(100.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(SlateSurface)
                                    .border(1.dp, AmberWarning, RoundedCornerShape(10.dp))
                                    .pointerInput(Unit) {
                                        detectTapGestures(
                                            onLongPress = { longPressCount++ },
                                            onTap = { singleTapCount++ }
                                        )
                                    }
                                    .semantics { contentDescription = repo.getTestId("gesture_long_press_target") },
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("⏱️ Long Press Me", color = AmberWarning, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    Text("Count: $longPressCount", color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
                                }
                            }

                            Spacer(modifier = Modifier.width(10.dp))

                            // Double Tap Box
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(100.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(SlateSurface)
                                    .border(1.dp, EmeraldAccent, RoundedCornerShape(10.dp))
                                    .pointerInput(Unit) {
                                        detectTapGestures(
                                            onDoubleTap = { doubleTapCount++ }
                                        )
                                    }
                                    .semantics { contentDescription = repo.getTestId("gesture_double_tap_target") },
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("👆👆 Double Tap Me", color = EmeraldAccent, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    Text("Count: $doubleTapCount", color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Reorderable Priority List
                        Text("3. Reorderable Priority List (Move Items)", color = TextSecondary, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Column(
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("priority_reorder_list") }
                        ) {
                            priorityItems.forEachIndexed { index, itemText ->
                                Surface(
                                    color = SlateSurface,
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .semantics { contentDescription = repo.getTestId("priority_item_$index") }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(10.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(itemText, color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                        Row {
                                            if (index > 0) {
                                                IconButton(
                                                    onClick = {
                                                        val updated = priorityItems.toMutableList()
                                                        val temp = updated[index]
                                                        updated[index] = updated[index - 1]
                                                        updated[index - 1] = temp
                                                        priorityItems = updated
                                                    },
                                                    modifier = Modifier.size(28.dp).semantics { contentDescription = repo.getTestId("btn_move_up_$index") }
                                                ) {
                                                    Icon(Icons.Default.ArrowUpward, contentDescription = "Move Up", tint = IndigoPrimary, modifier = Modifier.size(16.dp))
                                                }
                                            }
                                            if (index < priorityItems.size - 1) {
                                                IconButton(
                                                    onClick = {
                                                        val updated = priorityItems.toMutableList()
                                                        val temp = updated[index]
                                                        updated[index] = updated[index + 1]
                                                        updated[index + 1] = temp
                                                        priorityItems = updated
                                                    },
                                                    modifier = Modifier.size(28.dp).semantics { contentDescription = repo.getTestId("btn_move_down_$index") }
                                                ) {
                                                    Icon(Icons.Default.ArrowDownward, contentDescription = "Move Down", tint = IndigoPrimary, modifier = Modifier.size(16.dp))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    PlaygroundTab.DIALOGS -> {
                        // NATIVE DIALOGS SANDBOX
                        Text("Native Android System Dialogs", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Test Appium's native dialog handling (`driver.switch_to.alert`, date pickers, time pickers)", color = TextSecondary, fontSize = 12.sp)

                        Spacer(modifier = Modifier.height(14.dp))

                        // Result Banner
                        Surface(
                            color = SlateSurface,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Last Dialog Action: $dialogResultText",
                                color = EmeraldAccent,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier
                                    .padding(12.dp)
                                    .semantics { contentDescription = repo.getTestId("dialog_result_label") }
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Button 1: Native Alert Dialog
                        Button(
                            onClick = {
                                AlertDialog.Builder(context)
                                    .setTitle("Alert Notice")
                                    .setMessage("This is a native Android AlertDialog. Testing Appium alert.accept()!")
                                    .setPositiveButton("OK") { _, _ ->
                                        dialogResultText = "AlertDialog Accepted (OK)"
                                    }
                                    .show()
                            },
                            colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(44.dp)
                                .semantics { contentDescription = repo.getTestId("btn_trigger_alert_dialog") }
                        ) {
                            Text("Trigger Native Alert Dialog", color = Color.White)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Button 2: Native Confirm Dialog (OK / Cancel)
                        Button(
                            onClick = {
                                AlertDialog.Builder(context)
                                    .setTitle("Confirm Deletion")
                                    .setMessage("Are you sure you want to proceed with this simulated test operation?")
                                    .setPositiveButton("Yes, Proceed") { _, _ ->
                                        dialogResultText = "Confirm Dialog: Confirmed (OK)"
                                    }
                                    .setNegativeButton("Cancel") { _, _ ->
                                        dialogResultText = "Confirm Dialog: Dismissed (Cancel)"
                                    }
                                    .show()
                            },
                            colors = ButtonDefaults.buttonColors(backgroundColor = AmberWarning),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(44.dp)
                                .semantics { contentDescription = repo.getTestId("btn_trigger_confirm_dialog") }
                        ) {
                            Text("Trigger Native Confirm Dialog (OK/Cancel)", color = SlateBackground, fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Button 3: Native Prompt Dialog (Input)
                        Button(
                            onClick = {
                                val input = EditText(context)
                                input.hint = "Enter verification code"
                                AlertDialog.Builder(context)
                                    .setTitle("Prompt Input")
                                    .setMessage("Please enter verification token for Appium prompt test:")
                                    .setView(input)
                                    .setPositiveButton("Submit") { _, _ ->
                                        dialogResultText = "Prompt Submitted: '${input.text}'"
                                    }
                                    .setNegativeButton("Cancel") { _, _ ->
                                        dialogResultText = "Prompt Cancelled"
                                    }
                                    .show()
                            },
                            colors = ButtonDefaults.buttonColors(backgroundColor = EmeraldAccent),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(44.dp)
                                .semantics { contentDescription = repo.getTestId("btn_trigger_prompt_dialog") }
                        ) {
                            Text("Trigger Native Prompt Input Dialog", color = Color.White)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Button 4: Native Date Picker
                        Button(
                            onClick = {
                                val cal = Calendar.getInstance()
                                DatePickerDialog(
                                    context,
                                    { _, y, m, d ->
                                        dialogResultText = "Date Selected: $y-${m + 1}-$d"
                                    },
                                    cal.get(Calendar.YEAR),
                                    cal.get(Calendar.MONTH),
                                    cal.get(Calendar.DAY_OF_MONTH)
                                ).show()
                            },
                            colors = ButtonDefaults.buttonColors(backgroundColor = IndigoDark),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(44.dp)
                                .semantics { contentDescription = repo.getTestId("btn_trigger_datepicker_dialog") }
                        ) {
                            Text("Trigger Native DatePickerDialog", color = Color.White)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Button 5: Native Time Picker
                        Button(
                            onClick = {
                                val cal = Calendar.getInstance()
                                TimePickerDialog(
                                    context,
                                    { _, hour, min ->
                                        dialogResultText = String.format(Locale.US, "Time Selected: %02d:%02d", hour, min)
                                    },
                                    cal.get(Calendar.HOUR_OF_DAY),
                                    cal.get(Calendar.MINUTE),
                                    true
                                ).show()
                            },
                            colors = ButtonDefaults.buttonColors(backgroundColor = SlateSurface),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(44.dp)
                                .semantics { contentDescription = repo.getTestId("btn_trigger_timepicker_dialog") }
                        ) {
                            Text("Trigger Native TimePickerDialog", color = TextPrimary)
                        }
                    }

                    PlaygroundTab.FORMS -> {
                        // FORM ELEMENTS SANDBOX
                        Text("Form Controls & Input Varieties", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(10.dp))

                        // Standard Text Field with live validation
                        OutlinedTextField(
                            value = textInputVal,
                            onValueChange = {
                                textInputVal = it
                                textInputError = if (it.length in 1..4) "Minimum 5 characters required" else null
                            },
                            label = { Text("Validation Text Field (Min 5 chars)", color = TextSecondary) },
                            isError = textInputError != null,
                            colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                            modifier = Modifier
                                .fillMaxWidth()
                                .semantics { contentDescription = repo.getTestId("input_form_validated_text") }
                        )
                        textInputError?.let { err ->
                            Text(err, color = RoseError, fontSize = 11.sp, modifier = Modifier.padding(start = 4.dp, top = 2.dp).semantics { contentDescription = repo.getTestId("text_input_error_label") })
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Password Field with Eye Toggle
                        OutlinedTextField(
                            value = passwordVal,
                            onValueChange = { passwordVal = it },
                            label = { Text("Password Input", color = TextSecondary) },
                            trailingIcon = {
                                IconButton(
                                    onClick = { passwordVisible = !passwordVisible },
                                    modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_password_visibility_toggle") }
                                ) {
                                    Icon(if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff, contentDescription = "Toggle password", tint = TextSecondary)
                                }
                            },
                            colors = TextFieldDefaults.outlinedTextFieldColors(textColor = TextPrimary, backgroundColor = SlateSurface),
                            modifier = Modifier
                                .fillMaxWidth()
                                .semantics { contentDescription = repo.getTestId("input_form_password") }
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Checkbox Controls
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = checkboxA,
                                onCheckedChange = { checkboxA = it },
                                colors = CheckboxDefaults.colors(checkedColor = IndigoPrimary),
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("chk_agree_terms") }
                            )
                            Text("I agree to automated test protocols (Checkbox A)", color = TextPrimary, fontSize = 12.sp)
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = checkboxB,
                                onCheckedChange = { checkboxB = it },
                                colors = CheckboxDefaults.colors(checkedColor = IndigoPrimary),
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("chk_subscribe_updates") }
                            )
                            Text("Subscribe to test execution reports (Checkbox B)", color = TextPrimary, fontSize = 12.sp)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Radio Group
                        Text("Radio Button Selector", color = TextSecondary, fontSize = 12.sp)
                        listOf("Option 1", "Option 2", "Option 3").forEach { opt ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedRadio = opt }
                            ) {
                                RadioButton(
                                    selected = selectedRadio == opt,
                                    onClick = { selectedRadio = opt },
                                    colors = RadioButtonDefaults.colors(selectedColor = IndigoPrimary),
                                    modifier = Modifier.semantics { contentDescription = repo.getTestId("radio_${opt.replace(" ", "_").lowercase()}") }
                                )
                                Text(opt, color = TextPrimary, fontSize = 13.sp)
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Switch
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Feature Toggle Switch", color = TextPrimary, fontSize = 13.sp)
                            Switch(
                                checked = switchVal,
                                onCheckedChange = { switchVal = it },
                                colors = SwitchDefaults.colors(checkedThumbColor = EmeraldAccent),
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("switch_feature_toggle") }
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Sliders
                        Text("Continuous Slider Value: ${continuousSliderVal.toInt()}", color = TextSecondary, fontSize = 12.sp)
                        Slider(
                            value = continuousSliderVal,
                            onValueChange = { continuousSliderVal = it },
                            valueRange = 0f..100f,
                            colors = SliderDefaults.colors(thumbColor = IndigoPrimary, activeTrackColor = IndigoPrimary),
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("slider_continuous") }
                        )

                        Text("Discrete Slider (Steps 1-5): ${discreteSliderVal.toInt()}", color = TextSecondary, fontSize = 12.sp)
                        Slider(
                            value = discreteSliderVal,
                            onValueChange = { discreteSliderVal = it },
                            valueRange = 1f..5f,
                            steps = 3,
                            colors = SliderDefaults.colors(thumbColor = AmberWarning, activeTrackColor = AmberWarning),
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("slider_discrete") }
                        )
                    }

                    PlaygroundTab.CHAOS -> {
                        // CHAOS & LATENCY SANDBOX
                        Text("Network Latency & Error Injection", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Simulate slow networks, artificial latency, and HTTP error fault codes.", color = TextSecondary, fontSize = 12.sp)

                        Spacer(modifier = Modifier.height(14.dp))

                        // Latency Slider
                        Card(
                            backgroundColor = SlateSurface,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "Simulated Delay: ${repo.simulatedLatencyMs} ms",
                                    color = TextPrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    modifier = Modifier.semantics { contentDescription = repo.getTestId("latency_slider_label") }
                                )
                                Slider(
                                    value = repo.simulatedLatencyMs.toFloat(),
                                    onValueChange = { repo.simulatedLatencyMs = it.toLong() },
                                    valueRange = 0f..5000f,
                                    colors = SliderDefaults.colors(thumbColor = AmberWarning, activeTrackColor = AmberWarning),
                                    modifier = Modifier.semantics { contentDescription = repo.getTestId("slider_latency_simulator") }
                                )

                                Spacer(modifier = Modifier.height(6.dp))

                                Button(
                                    onClick = {
                                        coroutineScope.launch {
                                            isSimulatingCall = true
                                            delay(repo.simulatedLatencyMs)
                                            isSimulatingCall = false
                                            Toast.makeText(context, "Completed simulated API call after ${repo.simulatedLatencyMs}ms", Toast.LENGTH_SHORT).show()
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .semantics { contentDescription = repo.getTestId("btn_test_delayed_request") }
                                ) {
                                    if (isSimulatingCall) {
                                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp).semantics { contentDescription = repo.getTestId("loading_spinner_indicator") })
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Waiting ${repo.simulatedLatencyMs}ms...", color = Color.White)
                                    } else {
                                        Text("Execute Delayed API Call", color = Color.White)
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // HTTP Fault Triggers
                        Text("Simulate HTTP Status Errors:", color = TextSecondary, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(400, 401, 403).forEach { code ->
                                Button(
                                    onClick = {
                                        injectedErrorStatus = code
                                        injectedErrorMessage = when (code) {
                                            400 -> "HTTP 400 Bad Request: Missing required parameters"
                                            401 -> "HTTP 401 Unauthorized: JWT token expired or missing"
                                            403 -> "HTTP 403 Forbidden: Insufficient role permissions"
                                            else -> "Error"
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(backgroundColor = SlateSurface),
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier
                                        .weight(1f)
                                        .semantics { contentDescription = repo.getTestId("btn_trigger_http_$code") }
                                ) {
                                    Text("$code", color = AmberWarning, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(404, 429, 500).forEach { code ->
                                Button(
                                    onClick = {
                                        injectedErrorStatus = code
                                        injectedErrorMessage = when (code) {
                                            404 -> "HTTP 404 Not Found: Resource book_999 does not exist"
                                            429 -> "HTTP 429 Too Many Requests: Rate limit exceeded (60 req/min)"
                                            500 -> "HTTP 500 Internal Server Error: Database transaction failed"
                                            else -> "Error"
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(backgroundColor = SlateSurface),
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier
                                        .weight(1f)
                                        .semantics { contentDescription = repo.getTestId("btn_trigger_http_$code") }
                                ) {
                                    Text("$code", color = RoseError, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        // Error Banner
                        injectedErrorMessage?.let { msg ->
                            Spacer(modifier = Modifier.height(12.dp))
                            Surface(
                                color = RoseError.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, RoseError),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = msg,
                                        color = RoseError,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier
                                            .weight(1f)
                                            .semantics { contentDescription = repo.getTestId("error_fault_banner") }
                                    )
                                    IconButton(
                                        onClick = {
                                            injectedErrorMessage = null
                                            injectedErrorStatus = null
                                        },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Icon(Icons.Default.Close, contentDescription = "Dismiss error", tint = RoseError)
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Toast & Snackbar triggers
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = {
                                    Toast.makeText(context, "Appium Toast Verification Successful!", Toast.LENGTH_SHORT).show()
                                },
                                colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .semantics { contentDescription = repo.getTestId("btn_show_native_toast") }
                            ) {
                                Text("Show Toast", color = Color.White, fontSize = 12.sp)
                            }

                            Button(
                                onClick = {
                                    coroutineScope.launch {
                                        scaffoldState.snackbarHostState.showSnackbar(
                                            message = "Item added to cart via automated test!",
                                            actionLabel = "UNDO"
                                        )
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(backgroundColor = EmeraldAccent),
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .semantics { contentDescription = repo.getTestId("btn_show_snackbar_action") }
                            ) {
                                Text("Show Snackbar", color = Color.White, fontSize = 12.sp)
                            }
                        }
                    }

                    PlaygroundTab.WEBVIEW -> {
                        // HYBRID WEBVIEW SANDBOX
                        Text("Hybrid App Context Switching (WebView)", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Test Appium context switching: driver.switch_to.context('WEBVIEW_com.itfreesource.bookstore') to inspect and automate DOM elements inside this hybrid container.",
                            color = TextSecondary,
                            fontSize = 12.sp
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Card(
                            backgroundColor = SlateSurface,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(280.dp)
                                .border(1.dp, SlateBorder, RoundedCornerShape(10.dp))
                                .semantics { contentDescription = repo.getTestId("hybrid_webview_container") }
                        ) {
                            AndroidView(
                                factory = { ctx ->
                                    WebView(ctx).apply {
                                        webViewClient = WebViewClient()
                                        settings.javaScriptEnabled = true
                                        val html = """
                                            <!DOCTYPE html>
                                            <html>
                                            <head>
                                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                <style>
                                                    body { background: #0F172A; color: #F8FAFC; font-family: sans-serif; padding: 16px; }
                                                    h3 { color: #818CF8; margin-top: 0; }
                                                    input { width: 90%; padding: 8px; border: 1px solid #4F46E5; border-radius: 4px; background: #1E293B; color: #FFF; margin-bottom: 10px; }
                                                    button { background: #4F46E5; color: #FFF; border: none; padding: 8px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; }
                                                    #result { margin-top: 10px; color: #34D399; font-weight: bold; }
                                                </style>
                                            </head>
                                            <body>
                                                <h3 id="webview-title">Embedded Hybrid WebView</h3>
                                                <p style="font-size:12px;color:#94A3B8;">Interact with this HTML DOM directly using standard Selenium/Appium Web locators!</p>
                                                <input id="webview-input" type="text" placeholder="Type inside WebView..." />
                                                <br/>
                                                <button id="webview-submit-btn" onclick="document.getElementById('result').innerText = 'Submitted: ' + document.getElementById('webview-input').value;">Submit Form</button>
                                                <div id="result">Waiting for WebView input...</div>
                                            </body>
                                            </html>
                                        """.trimIndent()
                                        loadDataWithBaseURL("https://itfreesource.org", html, "text/html", "UTF-8", null)
                                    }
                                },
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                    }
                    PlaygroundTab.API_SYNC -> {
                        Text("🌐 Real-Time Web API Synchronization", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Synchronize transactions between the Web store and this Android app in real-time. Orders placed on the web immediately appear here upon sync.",
                            color = TextSecondary,
                            fontSize = 12.sp
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Card(
                            backgroundColor = SlateSurface,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, SlateBorder, RoundedCornerShape(10.dp))
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text("API Endpoint Configuration", color = TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                Spacer(modifier = Modifier.height(8.dp))
                                OutlinedTextField(
                                    value = customBaseUrl,
                                    onValueChange = {
                                        customBaseUrl = it
                                        com.itfreesource.bookstore.data.ApiClient.baseUrl = it
                                    },
                                    label = { Text("Base API URL (Default 10.0.2.2:5000/api/v1 for Emulator)") },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .semantics { contentDescription = repo.getTestId("input_backend_api_url") },
                                    colors = TextFieldDefaults.outlinedTextFieldColors(
                                        textColor = TextPrimary,
                                        cursorColor = IndigoPrimary,
                                        focusedBorderColor = IndigoPrimary,
                                        unfocusedBorderColor = SlateBorder
                                    )
                                )

                                Spacer(modifier = Modifier.height(14.dp))

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(SlateCard, RoundedCornerShape(8.dp))
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Connection State:", color = TextSecondary, fontSize = 11.sp)
                                        Text(
                                            text = if (repo.isBackendConnected) "● LIVE CONNECTED" else "○ LOCAL STORE (OFFLINE)",
                                            color = if (repo.isBackendConnected) SuccessGreen else TextSecondary,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp,
                                            modifier = Modifier.semantics { contentDescription = repo.getTestId("api_sync_state_label") }
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(text = "Status: ${repo.backendStatusText}", color = TextMuted, fontSize = 11.sp)
                                        Text(text = "Last Sync: ${repo.lastSyncTime}", color = TextMuted, fontSize = 11.sp)
                                    }
                                }

                                Spacer(modifier = Modifier.height(14.dp))

                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Button(
                                        onClick = { repo.syncWithBackend() },
                                        enabled = !repo.isSyncingBackend,
                                        colors = ButtonDefaults.buttonColors(backgroundColor = IndigoPrimary),
                                        shape = RoundedCornerShape(8.dp),
                                        modifier = Modifier
                                            .weight(1f)
                                            .semantics { contentDescription = repo.getTestId("btn_test_sync_api") }
                                    ) {
                                        Text(
                                            text = if (repo.isSyncingBackend) "Syncing..." else "🔄 Sync Web",
                                            color = Color.White,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }

                                    Button(
                                        onClick = {
                                            repo.resetToInitialSeed(syncBackend = true)
                                            Toast.makeText(context, "Database & Web API reset triggered!", Toast.LENGTH_SHORT).show()
                                        },
                                        colors = ButtonDefaults.buttonColors(backgroundColor = RoseError),
                                        shape = RoundedCornerShape(8.dp),
                                        modifier = Modifier
                                            .weight(1f)
                                            .semantics { contentDescription = repo.getTestId("btn_reset_web_api") }
                                    ) {
                                        Text("Reset Server DB", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
