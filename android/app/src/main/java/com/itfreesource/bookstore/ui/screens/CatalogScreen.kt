package com.itfreesource.bookstore.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.itfreesource.bookstore.data.BookStoreRepository
import com.itfreesource.bookstore.model.Book
import com.itfreesource.bookstore.ui.components.BookCard
import com.itfreesource.bookstore.ui.theme.*

enum class SortOption(val label: String) {
    TITLE_AZ("Title (A-Z)"),
    TITLE_ZA("Title (Z-A)"),
    PRICE_LOW_HIGH("Price (Low to High)"),
    PRICE_HIGH_LOW("Price (High to Low)"),
    RATING_HIGH("Highest Rated"),
    NEWEST("Newest Releases")
}

@Composable
fun CatalogScreen(
    onBookClick: (Book) -> Unit,
    onAddToCart: (Book) -> Unit,
    onBorrow: (Book) -> Unit
) {
    val repo = BookStoreRepository
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategoryId by remember { mutableStateOf("all") }
    var minPriceFilter by remember { mutableStateOf(0.0) }
    var maxPriceFilter by remember { mutableStateOf(100.0) }
    var minRatingFilter by remember { mutableStateOf(0.0) }
    var sortOption by remember { mutableStateOf(SortOption.TITLE_AZ) }
    var isGridView by remember { mutableStateOf(true) }
    var showFilterSheet by remember { mutableStateOf(false) }
    var sortMenuExpanded by remember { mutableStateOf(false) }

    // Filter books
    val filteredBooks = repo.books.filter { book ->
        val matchesSearch = searchQuery.isBlank() ||
                book.title.contains(searchQuery, ignoreCase = true) ||
                book.authorName.contains(searchQuery, ignoreCase = true) ||
                book.tags.any { it.contains(searchQuery, ignoreCase = true) }

        val matchesCategory = selectedCategoryId == "all" || book.categoryId == selectedCategoryId
        val matchesPrice = book.price in minPriceFilter..maxPriceFilter
        val matchesRating = book.rating >= minRatingFilter
        matchesSearch && matchesCategory && matchesPrice && matchesRating
    }.let { list ->
        when (sortOption) {
            SortOption.TITLE_AZ -> list.sortedBy { it.title }
            SortOption.TITLE_ZA -> list.sortedByDescending { it.title }
            SortOption.PRICE_LOW_HIGH -> list.sortedBy { it.price }
            SortOption.PRICE_HIGH_LOW -> list.sortedByDescending { it.price }
            SortOption.RATING_HIGH -> list.sortedByDescending { it.rating }
            SortOption.NEWEST -> list.sortedByDescending { it.publicationDate }
        }
    }

    val isDark = ThemeState.isDark

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(if (isDark) SlateBackground else LightBackground)
    ) {
        // Search & Filter Action Bar
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(if (isDark) SlateSurface else LightSurface)
                .padding(12.dp)
        ) {
            // Search Input Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search by title, author, tag...", color = if (isDark) TextSecondary else LightTextSecondary, fontSize = 13.sp) },
                    leadingIcon = {
                        Icon(Icons.Default.Search, contentDescription = null, tint = if (isDark) TextSecondary else LightTextSecondary)
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(
                                onClick = { searchQuery = "" },
                                modifier = Modifier.semantics { contentDescription = repo.getTestId("search_clear_button") }
                            ) {
                                Icon(Icons.Default.Close, contentDescription = "Clear search", tint = if (isDark) TextSecondary else LightTextSecondary)
                            }
                        }
                    },
                    singleLine = true,
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        textColor = if (isDark) TextPrimary else LightTextPrimary,
                        backgroundColor = if (isDark) SlateBackground else LightBackground,
                        focusedBorderColor = IndigoPrimary,
                        unfocusedBorderColor = if (isDark) SlateBorder else LightBorder
                    ),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp)
                        .semantics { contentDescription = repo.getTestId("catalog_search_input") }
                )

                Spacer(modifier = Modifier.width(8.dp))

                // Filter Drawer Button
                IconButton(
                    onClick = { showFilterSheet = !showFilterSheet },
                    modifier = Modifier
                        .size(46.dp)
                        .background(if (showFilterSheet) IndigoPrimary else (if (isDark) SlateBackground else LightBackground), RoundedCornerShape(8.dp))
                        .semantics { contentDescription = repo.getTestId("btn_toggle_filters") }
                ) {
                    Icon(
                        Icons.Default.FilterList,
                        contentDescription = "Filters",
                        tint = if (showFilterSheet) Color.White else (if (isDark) TextPrimary else LightTextPrimary)
                    )
                }

                Spacer(modifier = Modifier.width(6.dp))

                // Grid / List Toggle
                IconButton(
                    onClick = { isGridView = !isGridView },
                    modifier = Modifier
                        .size(46.dp)
                        .background(if (isDark) SlateBackground else LightBackground, RoundedCornerShape(8.dp))
                        .semantics { contentDescription = repo.getTestId("btn_view_mode_toggle") }
                ) {
                    Icon(
                        if (isGridView) Icons.Default.ViewList else Icons.Default.GridView,
                        contentDescription = "Toggle view mode",
                        tint = if (isDark) TextPrimary else LightTextPrimary
                    )
                }
            }

            // Expandable Filter Section (Sliders & Thresholds)
            if (showFilterSheet) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp)
                        .background(if (isDark) SlateBackground else LightBackground, RoundedCornerShape(8.dp))
                        .padding(12.dp)
                        .semantics { contentDescription = repo.getTestId("filter_panel_container") }
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Max Price: ${repo.formatPrice(maxPriceFilter)}",
                            color = if (isDark) TextPrimary else LightTextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("filter_price_label") }
                        )
                        Text(
                            text = "Min Stars: ${String.format("%.1f", minRatingFilter)}★",
                            color = AmberWarning,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Price Slider
                    Slider(
                        value = maxPriceFilter.toFloat(),
                        onValueChange = { maxPriceFilter = it.toDouble() },
                        valueRange = 10f..120f,
                        colors = SliderDefaults.colors(
                            thumbColor = IndigoPrimary,
                            activeTrackColor = IndigoPrimary,
                            inactiveTrackColor = SlateBorder
                        ),
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("slider_price_filter") }
                    )

                    // Rating Slider
                    Slider(
                        value = minRatingFilter.toFloat(),
                        onValueChange = { minRatingFilter = it.toDouble() },
                        valueRange = 0f..5f,
                        steps = 4,
                        colors = SliderDefaults.colors(
                            thumbColor = AmberWarning,
                            activeTrackColor = AmberWarning,
                            inactiveTrackColor = SlateBorder
                        ),
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("slider_rating_filter") }
                    )

                    // Reset Filters Button
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(
                            onClick = {
                                minPriceFilter = 0.0
                                maxPriceFilter = 100.0
                                minRatingFilter = 0.0
                                selectedCategoryId = "all"
                            },
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("btn_reset_filters") }
                        ) {
                            Text("Reset Filters", color = RoseError, fontSize = 12.sp)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Category Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // "All" chip
                val isAllSelected = selectedCategoryId == "all"
                Surface(
                    color = if (isAllSelected) IndigoPrimary else (if (isDark) SlateBackground else LightBackground),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .padding(end = 6.dp)
                        .clickable { selectedCategoryId = "all" }
                        .semantics { contentDescription = repo.getTestId("category_chip_all") }
                ) {
                    Text(
                        text = "All Categories (${repo.books.size})",
                        color = if (isAllSelected) Color.White else (if (isDark) TextSecondary else LightTextSecondary),
                        fontSize = 11.sp,
                        fontWeight = if (isAllSelected) FontWeight.Bold else FontWeight.Normal,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }

                // Category chips
                repo.categories.forEach { cat ->
                    val isCatSelected = selectedCategoryId == cat.id
                    Surface(
                        color = if (isCatSelected) IndigoPrimary else (if (isDark) SlateBackground else LightBackground),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .padding(end = 6.dp)
                            .clickable { selectedCategoryId = cat.id }
                            .semantics { contentDescription = repo.getTestId("category_chip_${cat.slug}") }
                    ) {
                        Text(
                            text = cat.name,
                            color = if (isCatSelected) Color.White else (if (isDark) TextSecondary else LightTextSecondary),
                            fontSize = 11.sp,
                            fontWeight = if (isCatSelected) FontWeight.Bold else FontWeight.Normal,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }
        }

        // Subheader: Book Count & Sort Selector
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "${filteredBooks.size} Books Available",
                color = if (isDark) TextSecondary else LightTextSecondary,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.semantics { contentDescription = repo.getTestId("books_count_label") }
            )

            // Sort Dropdown
            Box {
                Row(
                    modifier = Modifier
                        .clickable { sortMenuExpanded = true }
                        .semantics { contentDescription = repo.getTestId("btn_sort_dropdown") },
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Sort: ${sortOption.label}",
                        color = IndigoPrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Icon(
                        Icons.Default.ArrowDropDown,
                        contentDescription = null,
                        tint = IndigoPrimary,
                        modifier = Modifier.size(18.dp)
                    )
                }

                DropdownMenu(
                    expanded = sortMenuExpanded,
                    onDismissRequest = { sortMenuExpanded = false },
                    modifier = Modifier.background(if (isDark) SlateSurface else LightSurface)
                ) {
                    SortOption.values().forEach { opt ->
                        DropdownMenuItem(
                            onClick = {
                                sortOption = opt
                                sortMenuExpanded = false
                            },
                            modifier = Modifier.semantics { contentDescription = repo.getTestId("sort_option_${opt.name}") }
                        ) {
                            Text(opt.label, color = if (isDark) TextPrimary else LightTextPrimary)
                        }
                    }
                }
            }
        }

        // Book Listing (Grid or List)
        if (filteredBooks.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🔍", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No books found matching criteria",
                        color = if (isDark) TextPrimary else LightTextPrimary,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.semantics { contentDescription = repo.getTestId("empty_catalog_label") }
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Try clearing filters or search terms",
                        color = if (isDark) TextSecondary else LightTextSecondary,
                        fontSize = 13.sp
                    )
                }
            }
        } else if (isGridView) {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 150.dp),
                contentPadding = PaddingValues(10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .semantics { contentDescription = repo.getTestId("catalog_grid_view") }
            ) {
                items(filteredBooks, key = { it.id }) { book ->
                    BookCard(
                        book = book,
                        onBookClick = onBookClick,
                        onAddToCart = onAddToCart,
                        onBorrow = onBorrow
                    )
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .semantics { contentDescription = repo.getTestId("catalog_list_view") }
            ) {
                items(filteredBooks, key = { it.id }) { book ->
                    BookCard(
                        book = book,
                        onBookClick = onBookClick,
                        onAddToCart = onAddToCart,
                        onBorrow = onBorrow
                    )
                }
            }
        }
    }
}
