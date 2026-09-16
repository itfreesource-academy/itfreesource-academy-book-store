package com.itfreesource.bookstore.data

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.itfreesource.bookstore.model.*
import com.itfreesource.bookstore.model.Currency
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

object BookStoreRepository {

    private val repositoryScope = CoroutineScope(Dispatchers.Main)

    // Users
    val users = mutableStateListOf<User>()
    var currentUser by mutableStateOf<User?>(null)

    // Books & Categories
    val books = mutableStateListOf<Book>()
    val categories = mutableStateListOf<Category>()
    val authors = mutableStateListOf<Author>()

    // Cart
    val cartItems = mutableStateListOf<CartItem>()
    var appliedPromoCode by mutableStateOf<String?>(null)
    var promoDiscountAmount by mutableStateOf(0.0)

    // Orders
    val orders = mutableStateListOf<Order>()

    // Reviews
    val reviews = mutableStateListOf<Review>()

    // Borrow / Rentals
    val borrowRecords = mutableStateListOf<BorrowRecord>()

    // Audit Logs
    val auditLogs = mutableStateListOf<AuditLog>()

    // QA Sandbox / Test Automation Flags
    var useDynamicIds by mutableStateOf(false)
    var simulatedLatencyMs by mutableStateOf(0L)
    var isSimulatingLoading by mutableStateOf(false)

    // Backend Live Synchronization State
    var isSyncingBackend by mutableStateOf(false)
    var isBackendConnected by mutableStateOf(false)
    var backendStatusText by mutableStateOf("Initialized (Local Seed)")
    var lastSyncTime by mutableStateOf("Never")

    // Active Currency & Timezone
    var activeCurrency by mutableStateOf(Currency.USD)
    var activeTimezone by mutableStateOf("America/New_York")

    // Microservices health
    val microservices = mutableStateListOf(
        Microservice("auth", "Auth Service", "healthy", 24),
        Microservice("catalog", "Catalog Service", "healthy", 35),
        Microservice("pricing", "Pricing & FX Engine", "healthy", 18),
        Microservice("inventory", "Inventory Service", "healthy", 42),
        Microservice("orders", "Order Fulfillment", "healthy", 56),
        Microservice("borrow", "Rental / Borrowing Engine", "healthy", 31),
        Microservice("reviews", "Review Moderation", "healthy", 29)
    )

    init {
        resetToInitialSeed(syncBackend = false)
        syncWithBackend()
    }

    fun syncWithBackend(onComplete: ((Boolean) -> Unit)? = null) {
        repositoryScope.launch {
            isSyncingBackend = true
            val user = currentUser
            if (user != null) {
                ApiClient.login(user.username, user.password)
            }

            // Sync Books
            val remoteBooks = ApiClient.fetchBooks()
            if (remoteBooks != null && remoteBooks.isNotEmpty()) {
                books.clear()
                books.addAll(remoteBooks)
            }

            // Sync Categories
            val remoteCategories = ApiClient.fetchCategories()
            if (remoteCategories != null && remoteCategories.isNotEmpty()) {
                categories.clear()
                categories.addAll(remoteCategories)
            }

            // Sync Authors
            val remoteAuthors = ApiClient.fetchAuthors()
            if (remoteAuthors != null && remoteAuthors.isNotEmpty()) {
                authors.clear()
                authors.addAll(remoteAuthors)
            }

            // Sync Orders
            val remoteOrders = ApiClient.fetchOrders()
            if (remoteOrders != null) {
                orders.clear()
                orders.addAll(remoteOrders)
            }

            // Sync Borrow Records
            val remoteBorrows = ApiClient.fetchBorrowRecords()
            if (remoteBorrows != null) {
                borrowRecords.clear()
                borrowRecords.addAll(remoteBorrows)
            }

            // Sync Reviews
            val remoteReviews = ApiClient.fetchReviews()
            if (remoteReviews != null) {
                reviews.clear()
                reviews.addAll(remoteReviews)
            }

            // Sync Users
            val remoteUsers = ApiClient.fetchUsers()
            if (remoteUsers != null && remoteUsers.isNotEmpty()) {
                users.clear()
                users.addAll(remoteUsers)
                val matchingCurrent = users.firstOrNull { it.id == user?.id }
                if (matchingCurrent != null) {
                    currentUser = matchingCurrent
                }
            }

            // Sync Audit Logs
            val remoteLogs = ApiClient.fetchAuditLogs()
            if (remoteLogs != null) {
                auditLogs.clear()
                auditLogs.addAll(remoteLogs)
            }

            isBackendConnected = ApiClient.isLiveConnected
            backendStatusText = ApiClient.lastSyncStatus
            lastSyncTime = ApiClient.lastSyncTimestamp
            isSyncingBackend = false
            onComplete?.invoke(ApiClient.isLiveConnected)
        }
    }

    fun resetToInitialSeed(syncBackend: Boolean = true) {
        users.clear()
        users.addAll(SeedData.getInitialUsers())

        currentUser = users.firstOrNull { it.username == "admin" } ?: users.firstOrNull()
        activeCurrency = currentUser?.currency ?: Currency.USD
        activeTimezone = currentUser?.timezone ?: "America/New_York"

        categories.clear()
        categories.addAll(SeedData.getInitialCategories())

        authors.clear()
        authors.addAll(SeedData.getInitialAuthors())

        books.clear()
        books.addAll(SeedData.getInitialBooks())

        cartItems.clear()
        appliedPromoCode = null
        promoDiscountAmount = 0.0

        orders.clear()
        orders.addAll(SeedData.getInitialOrders())

        reviews.clear()
        reviews.addAll(SeedData.getInitialReviews())

        borrowRecords.clear()
        borrowRecords.addAll(SeedData.getInitialBorrows())

        auditLogs.clear()
        auditLogs.addAll(SeedData.getInitialAuditLogs())

        useDynamicIds = false
        simulatedLatencyMs = 0L

        logAudit("SYSTEM_RESET", "system", "database", "Restored database to default seed state")

        if (syncBackend) {
            repositoryScope.launch {
                ApiClient.resetSystem()
                syncWithBackend()
            }
        }
    }

    // Role Switcher / Auth
    fun switchUser(user: User) {
        currentUser = user
        activeCurrency = user.currency
        activeTimezone = user.timezone
        logAudit("LOGIN_SWITCH", "user", user.id, "Switched role to ${user.role.name} (${user.username})")

        repositoryScope.launch {
            ApiClient.login(user.username, user.password)
            val remoteOrders = ApiClient.fetchOrders()
            if (remoteOrders != null) {
                orders.clear()
                orders.addAll(remoteOrders)
            }
            val remoteBorrows = ApiClient.fetchBorrowRecords()
            if (remoteBorrows != null) {
                borrowRecords.clear()
                borrowRecords.addAll(remoteBorrows)
            }
            isBackendConnected = ApiClient.isLiveConnected
            backendStatusText = ApiClient.lastSyncStatus
            lastSyncTime = ApiClient.lastSyncTimestamp
        }
    }

    fun login(username: String, pass: String): Boolean {
        val found = users.firstOrNull { it.username.equals(username, ignoreCase = true) && it.password == pass }
        return if (found != null) {
            switchUser(found)
            true
        } else {
            logAudit("LOGIN_FAILED", "auth", username, "Invalid login credentials attempt")
            false
        }
    }

    fun logout() {
        val guest = User(
            id = "usr_guest",
            username = "guest",
            email = "guest@example.com",
            fullName = "Guest Explorer",
            role = UserRole.standard_customer,
            currency = Currency.USD,
            timezone = "America/New_York"
        )
        currentUser = guest
        activeCurrency = Currency.USD
        activeTimezone = "America/New_York"
        ApiClient.authToken = null
        logAudit("LOGOUT", "user", "usr_guest", "User logged out")
    }

    // Currency Conversion
    fun convertPrice(usdAmount: Double): Double {
        val converted = usdAmount * activeCurrency.rate
        return if (activeCurrency == Currency.JPY) Math.round(converted).toDouble() else Math.round(converted * 100.0) / 100.0
    }

    fun formatPrice(usdAmount: Double): String {
        val converted = convertPrice(usdAmount)
        return if (activeCurrency == Currency.JPY) {
            "${activeCurrency.symbol}${converted.toLong()}"
        } else {
            "${activeCurrency.symbol}${String.format(Locale.US, "%.2f", converted)}"
        }
    }

    // Locator ID helper for QA Testing
    fun getTestId(staticId: String): String {
        return if (useDynamicIds) {
            "dyn_${staticId.hashCode().toString().takeLast(6)}_$staticId"
        } else {
            staticId
        }
    }

    // Cart operations
    fun addToCart(book: Book, qty: Int = 1) {
        val existing = cartItems.firstOrNull { it.book.id == book.id }
        if (existing != null) {
            existing.quantity += qty
        } else {
            cartItems.add(CartItem(book, qty))
        }
        logAudit("CART_ADD", "book", book.id, "Added ${book.title} (x$qty) to cart")
    }

    fun updateCartQuantity(bookId: String, qty: Int) {
        if (qty <= 0) {
            cartItems.removeAll { it.book.id == bookId }
        } else {
            val item = cartItems.firstOrNull { it.book.id == bookId }
            item?.quantity = qty
        }
    }

    fun removeFromCart(bookId: String) {
        cartItems.removeAll { it.book.id == bookId }
    }

    fun applyPromoCode(code: String): Pair<Boolean, String> {
        val upper = code.trim().uppercase(Locale.US)
        return when (upper) {
            "SAVE10" -> {
                appliedPromoCode = upper
                promoDiscountAmount = 10.0
                Pair(true, "Promo code applied: $10.00 discount")
            }
            "SAVE20" -> {
                appliedPromoCode = upper
                promoDiscountAmount = 20.0
                Pair(true, "Promo code applied: $20.00 discount")
            }
            "FREESHIP" -> {
                appliedPromoCode = upper
                promoDiscountAmount = 5.0
                Pair(true, "Free shipping promo applied: $5.00 discount")
            }
            else -> {
                Pair(false, "Invalid or expired promo code: '$code'")
            }
        }
    }

    // Checkout Calculations
    fun getCartSubtotalUsd(): Double = cartItems.sumOf { it.book.price * it.quantity }

    fun getCartDiscountUsd(): Double {
        var disc = promoDiscountAmount
        if (currentUser?.role == UserRole.vip_customer) {
            disc += getCartSubtotalUsd() * 0.20
        }
        return disc.coerceAtMost(getCartSubtotalUsd())
    }

    fun getCartTaxUsd(): Double = (getCartSubtotalUsd() - getCartDiscountUsd()) * 0.08

    fun getCartShippingUsd(): Double = if (cartItems.isEmpty() || appliedPromoCode == "FREESHIP") 0.0 else 5.00

    fun getCartTotalUsd(): Double {
        if (cartItems.isEmpty()) return 0.0
        return (getCartSubtotalUsd() - getCartDiscountUsd() + getCartTaxUsd() + getCartShippingUsd()).coerceAtLeast(0.0)
    }

    fun placeOrder(
        shippingAddress: ShippingAddress,
        deliveryDate: String,
        paymentMethod: String
    ): Order {
        val user = currentUser ?: users.first()
        val orderNum = "ORD-${System.currentTimeMillis().toString().takeLast(6)}"
        val orderItems = cartItems.map {
            OrderItem(
                bookId = it.book.id,
                title = it.book.title,
                price = it.book.price,
                quantity = it.quantity,
                coverImage = it.book.coverImage
            )
        }
        val order = Order(
            id = "ord_${System.currentTimeMillis()}",
            orderNumber = orderNum,
            userId = user.id,
            username = user.username,
            items = orderItems,
            subtotal = getCartSubtotalUsd(),
            discount = getCartDiscountUsd(),
            tax = getCartTaxUsd(),
            total = getCartTotalUsd(),
            shippingAddress = shippingAddress,
            deliveryDate = deliveryDate,
            paymentMethod = paymentMethod,
            status = OrderStatus.processing,
            trackingNumber = "TRK-${(1000000..9999999).random()}",
            createdAt = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US).format(Date())
        )
        orders.add(0, order)

        for (item in cartItems) {
            val book = books.firstOrNull { it.id == item.book.id }
            book?.let { it.stock = (it.stock - item.quantity).coerceAtLeast(0) }
        }

        cartItems.clear()
        appliedPromoCode = null
        promoDiscountAmount = 0.0

        logAudit("ORDER_PLACED", "order", order.id, "Placed order ${order.orderNumber} for total ${formatPrice(order.total)}")

        // Post to Web API
        repositoryScope.launch {
            val remoteOrder = ApiClient.postOrder(orderItems, shippingAddress, deliveryDate, paymentMethod)
            if (remoteOrder != null) {
                val idx = orders.indexOfFirst { it.id == order.id || it.orderNumber == order.orderNumber }
                if (idx >= 0) {
                    orders[idx] = remoteOrder
                }
                isBackendConnected = true
                backendStatusText = "Order synced to Web API (${remoteOrder.orderNumber})"
            }
        }

        return order
    }

    // Order status transitions & cancellations
    fun updateOrderStatus(orderId: String, newStatus: OrderStatus, trackingNo: String? = null) {
        val ord = orders.firstOrNull { it.id == orderId } ?: return
        ord.status = newStatus
        if (trackingNo != null) ord.trackingNumber = trackingNo
        logAudit("ORDER_STATUS_CHANGED", "order", orderId, "Status changed to ${newStatus.name}")

        repositoryScope.launch {
            ApiClient.updateOrderStatus(orderId, newStatus.name, trackingNo)
        }
    }

    fun cancelOrder(orderId: String) {
        val ord = orders.firstOrNull { it.id == orderId } ?: return
        ord.status = OrderStatus.cancelled
        logAudit("ORDER_CANCELLED", "order", orderId, "Order cancelled")

        repositoryScope.launch {
            ApiClient.cancelOrder(orderId)
        }
    }

    fun refundOrder(orderId: String) {
        val ord = orders.firstOrNull { it.id == orderId } ?: return
        ord.status = OrderStatus.refunded
        logAudit("ORDER_REFUNDED", "order", orderId, "Order refunded")

        repositoryScope.launch {
            ApiClient.refundOrder(orderId)
        }
    }

    // Borrow / Rental
    fun borrowBook(book: Book): BorrowRecord {
        val user = currentUser ?: users.first()
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val cal = Calendar.getInstance()
        val borrowDateStr = sdf.format(cal.time)
        cal.add(Calendar.DAY_OF_YEAR, 10)
        val dueDateStr = sdf.format(cal.time)

        val record = BorrowRecord(
            id = "brw_${System.currentTimeMillis()}",
            userId = user.id,
            username = user.username,
            bookId = book.id,
            bookTitle = book.title,
            bookCover = book.coverImage,
            bookPrice = book.price,
            borrowDate = borrowDateStr,
            dueDate = dueDateStr,
            returnDate = null,
            status = BorrowStatus.active,
            standardFee = 2.00,
            lateFee = 0.0,
            lostFee = 0.0,
            totalFee = 2.00,
            currency = activeCurrency,
            timezone = activeTimezone
        )
        borrowRecords.add(0, record)
        book.stock = (book.stock - 1).coerceAtLeast(0)
        logAudit("BOOK_BORROWED", "borrow", record.id, "User ${user.username} borrowed ${book.title}")

        repositoryScope.launch {
            val remoteRecord = ApiClient.borrowBook(book.id, activeTimezone, activeCurrency.code)
            if (remoteRecord != null) {
                val idx = borrowRecords.indexOfFirst { it.id == record.id }
                if (idx >= 0) {
                    borrowRecords[idx] = remoteRecord
                }
            }
        }
        return record
    }

    fun returnBook(recordId: String, daysOverdue: Int = 0) {
        val record = borrowRecords.firstOrNull { it.id == recordId } ?: return
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        record.returnDate = sdf.format(Date())
        record.lateFee = daysOverdue * 0.10
        record.totalFee = record.standardFee + record.lateFee
        record.status = if (daysOverdue > 0) BorrowStatus.overdue else BorrowStatus.returned
        
        val book = books.firstOrNull { it.id == record.bookId }
        book?.let { it.stock = it.stock + 1 }

        logAudit("BOOK_RETURNED", "borrow", record.id, "Returned ${record.bookTitle} with late fee $${record.lateFee}")

        repositoryScope.launch {
            val remoteRecord = ApiClient.returnBook(recordId, record.returnDate)
            if (remoteRecord != null) {
                val idx = borrowRecords.indexOfFirst { it.id == recordId }
                if (idx >= 0) {
                    borrowRecords[idx] = remoteRecord
                }
            }
        }
    }

    fun markBookLost(recordId: String) {
        val record = borrowRecords.firstOrNull { it.id == recordId } ?: return
        record.status = BorrowStatus.lost
        record.lostFee = record.bookPrice * 2.0
        record.totalFee = record.standardFee + record.lateFee + record.lostFee
        logAudit("BOOK_LOST", "borrow", record.id, "Book ${record.bookTitle} marked lost. Penalty: $${record.lostFee}")

        repositoryScope.launch {
            val remoteRecord = ApiClient.reportBookLost(recordId)
            if (remoteRecord != null) {
                val idx = borrowRecords.indexOfFirst { it.id == recordId }
                if (idx >= 0) {
                    borrowRecords[idx] = remoteRecord
                }
            }
        }
    }

    // Reviews moderation
    fun addReview(bookId: String, rating: Double, title: String, comment: String) {
        val user = currentUser ?: users.first()
        val r = Review(
            id = "rev_${System.currentTimeMillis()}",
            bookId = bookId,
            userId = user.id,
            username = user.username,
            rating = rating,
            title = title,
            comment = comment,
            status = if (user.role == UserRole.book_reviewer || user.role == UserRole.admin) ReviewStatus.approved else ReviewStatus.pending,
            createdAt = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        )
        reviews.add(0, r)
        logAudit("REVIEW_SUBMITTED", "review", r.id, "Review for book $bookId submitted by ${user.username}")

        repositoryScope.launch {
            val remoteReview = ApiClient.submitReview(bookId, rating, title, comment)
            if (remoteReview != null) {
                val idx = reviews.indexOfFirst { it.id == r.id }
                if (idx >= 0) {
                    reviews[idx] = remoteReview
                }
            }
        }
    }

    fun moderateReview(reviewId: String, approved: Boolean) {
        val rev = reviews.firstOrNull { it.id == reviewId } ?: return
        rev.status = if (approved) ReviewStatus.approved else ReviewStatus.rejected
        logAudit("REVIEW_MODERATED", "review", reviewId, "Review was ${rev.status.name}")

        repositoryScope.launch {
            ApiClient.moderateReview(reviewId, approved)
        }
    }

    // Inventory
    fun updateStock(bookId: String, newStock: Int) {
        val book = books.firstOrNull { it.id == bookId } ?: return
        book.stock = newStock.coerceAtLeast(0)
        logAudit("STOCK_UPDATED", "inventory", bookId, "Stock for ${book.title} updated to $newStock")

        repositoryScope.launch {
            ApiClient.updateStock(bookId, newStock)
        }
    }

    // User Management
    fun updateUser(userId: String, name: String, role: UserRole, status: String, curr: Currency, tz: String) {
        val idx = users.indexOfFirst { it.id == userId }
        if (idx != -1) {
            val old = users[idx]
            users[idx] = old.copy(
                fullName = name,
                role = role,
                status = status,
                currency = curr,
                timezone = tz
            )
            if (currentUser?.id == userId) {
                currentUser = users[idx]
                activeCurrency = curr
                activeTimezone = tz
            }
            logAudit("USER_UPDATED", "user", userId, "Updated user $name with role ${role.name}")

            repositoryScope.launch {
                ApiClient.updateUser(userId, name, role.name, status, curr.code, tz)
            }
        }
    }

    fun logAudit(action: String, entity: String, entityId: String, details: String) {
        val user = currentUser
        val entry = AuditLog(
            id = "aud_${System.currentTimeMillis()}_${(100..999).random()}",
            timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date()),
            userId = user?.id ?: "system",
            username = user?.username ?: "system",
            role = user?.role?.name ?: "system",
            action = action,
            entity = entity,
            entityId = entityId,
            details = details,
            ipAddress = "192.168.1.42"
        )
        auditLogs.add(0, entry)
    }
}
