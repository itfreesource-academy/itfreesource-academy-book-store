package com.itfreesource.bookstore.data

import com.itfreesource.bookstore.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object ApiClient {
    // 10.0.2.2 is the Android Emulator alias to the host machine's localhost:5000
    var baseUrl: String = "http://10.0.2.2:5000/api/v1"
    var authToken: String? = null
    var isLiveConnected: Boolean = false
    var lastSyncStatus: String = "Not connected (Using local mock data)"
    var lastSyncTimestamp: String = "Never"

    private fun readStream(conn: HttpURLConnection): String {
        val stream = if (conn.responseCode in 200..299) conn.inputStream else conn.errorStream
        return BufferedReader(InputStreamReader(stream ?: return "")).use { it.readText() }
    }

    private fun openConnection(path: String, method: String): HttpURLConnection {
        val url = URL(if (path.startsWith("http")) path else "$baseUrl$path")
        return (url.openConnection() as HttpURLConnection).apply {
            requestMethod = method
            setRequestProperty("Accept", "application/json")
            if (method in listOf("POST", "PUT", "PATCH")) {
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
            }
            authToken?.let { setRequestProperty("Authorization", "Bearer $it") }
            connectTimeout = 4000
            readTimeout = 4000
        }
    }

    private fun markSyncSuccess(status: String) {
        isLiveConnected = true
        lastSyncStatus = status
        lastSyncTimestamp = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
    }

    // ==========================================
    // AUTHENTICATION & USERS
    // ==========================================

    suspend fun login(username: String, pass: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/auth/login", "POST")
            val body = JSONObject().apply {
                put("username", username)
                put("password", pass)
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode == 200) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    authToken = json.optString("token")
                    markSyncSuccess("Live Connected (User: $username)")
                    return@withContext true
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
            lastSyncStatus = "Backend offline (${e.localizedMessage ?: "timeout"})"
        }
        false
    }

    suspend fun fetchCurrentUser(): User? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/auth/me", "GET")
            if (conn.responseCode == 200) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    markSyncSuccess("User Profile Synced")
                    return@withContext parseUser(json.getJSONObject("user"))
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun fetchUsers(): List<User>? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/auth/users", "GET")
            if (conn.responseCode == 200) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    val arr = json.getJSONArray("users")
                    val list = mutableListOf<User>()
                    for (i in 0 until arr.length()) {
                        list.add(parseUser(arr.getJSONObject(i)))
                    }
                    markSyncSuccess("Users Synced (${list.size} users)")
                    return@withContext list
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun updateUser(userId: String, name: String, role: String, status: String, curr: String, tz: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/auth/users/$userId", "PUT")
            val body = JSONObject().apply {
                put("fullName", name)
                put("role", role)
                put("status", status)
                put("currency", curr)
                put("timezone", tz)
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode in 200..299) {
                markSyncSuccess("User $name updated on Web")
                return@withContext true
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        false
    }

    suspend fun updateUserStatus(userId: String, status: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/auth/users/$userId/status", "PATCH")
            val body = JSONObject().apply { put("status", status) }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode in 200..299) {
                markSyncSuccess("User status set to $status")
                return@withContext true
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        false
    }

    // ==========================================
    // CATALOG: BOOKS, CATEGORIES & AUTHORS
    // ==========================================

    suspend fun fetchBooks(): List<Book>? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/books?limit=100", "GET")
            if (conn.responseCode == 200) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    val arr = json.getJSONArray("books")
                    val list = mutableListOf<Book>()
                    for (i in 0 until arr.length()) {
                        list.add(parseBook(arr.getJSONObject(i)))
                    }
                    markSyncSuccess("Books synced (${list.size} items)")
                    return@withContext list
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun fetchCategories(): List<Category>? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/categories", "GET")
            if (conn.responseCode == 200) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    val arr = json.getJSONArray("categories")
                    val list = mutableListOf<Category>()
                    for (i in 0 until arr.length()) {
                        val obj = arr.getJSONObject(i)
                        list.add(
                            Category(
                                id = obj.optString("id"),
                                name = obj.optString("name"),
                                slug = obj.optString("slug", ""),
                                description = obj.optString("description", ""),
                                bookCount = obj.optInt("bookCount", 0)
                            )
                        )
                    }
                    markSyncSuccess("Categories synced (${list.size})")
                    return@withContext list
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun fetchAuthors(): List<Author>? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/authors", "GET")
            if (conn.responseCode == 200) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    val arr = json.getJSONArray("authors")
                    val list = mutableListOf<Author>()
                    for (i in 0 until arr.length()) {
                        val obj = arr.getJSONObject(i)
                        list.add(
                            Author(
                                id = obj.optString("id"),
                                name = obj.optString("name"),
                                bio = obj.optString("bio", ""),
                                photo = obj.optString("photo", ""),
                                nationality = obj.optString("nationality", "International")
                            )
                        )
                    }
                    markSyncSuccess("Authors synced (${list.size})")
                    return@withContext list
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    // ==========================================
    // ORDERS & CHECKOUT
    // ==========================================

    suspend fun fetchOrders(): List<Order>? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/orders", "GET")
            if (conn.responseCode == 200) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    val arr = json.getJSONArray("orders")
                    val list = mutableListOf<Order>()
                    for (i in 0 until arr.length()) {
                        list.add(parseOrder(arr.getJSONObject(i)))
                    }
                    markSyncSuccess("Orders synced (${list.size} orders)")
                    return@withContext list
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun postOrder(
        items: List<OrderItem>,
        shippingAddress: ShippingAddress,
        deliveryDate: String,
        paymentMethod: String
    ): Order? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/orders", "POST")
            val itemsArr = JSONArray()
            items.forEach { itm ->
                itemsArr.put(JSONObject().apply {
                    put("bookId", itm.bookId)
                    put("title", itm.title)
                    put("price", itm.price)
                    put("quantity", itm.quantity)
                    put("coverImage", itm.coverImage)
                })
            }

            val addressObj = JSONObject().apply {
                put("fullName", shippingAddress.fullName)
                put("street", shippingAddress.street)
                put("city", shippingAddress.city)
                put("state", shippingAddress.state)
                put("postalCode", shippingAddress.zipCode)
                put("zipCode", shippingAddress.zipCode)
                put("country", shippingAddress.country)
            }

            val body = JSONObject().apply {
                put("items", itemsArr)
                put("shippingAddress", addressObj)
                put("deliveryDate", deliveryDate)
                put("paymentMethod", paymentMethod)
            }

            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode in 200..201) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    markSyncSuccess("Order placed on Web API")
                    return@withContext parseOrder(json.getJSONObject("order"))
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun updateOrderStatus(orderId: String, status: String, trackingNumber: String?): Boolean = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/orders/$orderId/status", "PATCH")
            val body = JSONObject().apply {
                put("status", status)
                if (!trackingNumber.isNullOrBlank()) {
                    put("trackingNumber", trackingNumber)
                }
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode in 200..299) {
                markSyncSuccess("Order $orderId status changed to $status")
                return@withContext true
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        false
    }

    suspend fun cancelOrder(orderId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/orders/$orderId/cancel", "POST")
            if (conn.responseCode in 200..299) {
                markSyncSuccess("Order $orderId cancelled on Web")
                return@withContext true
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        false
    }

    suspend fun refundOrder(orderId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/orders/$orderId/refund", "POST")
            if (conn.responseCode in 200..299) {
                markSyncSuccess("Order $orderId refunded on Web")
                return@withContext true
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        false
    }

    // ==========================================
    // ACADEMIC BORROWING & RENTALS
    // ==========================================

    suspend fun fetchBorrowRecords(): List<BorrowRecord>? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/borrow", "GET")
            if (conn.responseCode == 200) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    val arr = json.getJSONArray("records")
                    val list = mutableListOf<BorrowRecord>()
                    for (i in 0 until arr.length()) {
                        list.add(parseBorrowRecord(arr.getJSONObject(i)))
                    }
                    markSyncSuccess("Borrow records synced (${list.size})")
                    return@withContext list
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun borrowBook(bookId: String, timezone: String, currency: String): BorrowRecord? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/borrow", "POST")
            val body = JSONObject().apply {
                put("bookId", bookId)
                put("timezone", timezone)
                put("currency", currency)
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode in 200..201) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    markSyncSuccess("Book loan opened on Web")
                    return@withContext parseBorrowRecord(json.getJSONObject("record"))
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun returnBook(borrowId: String, returnDate: String? = null): BorrowRecord? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/borrow/$borrowId/return", "POST")
            val body = JSONObject().apply {
                returnDate?.let { put("returnDate", it) }
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode in 200..299) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    markSyncSuccess("Book returned on Web")
                    return@withContext parseBorrowRecord(json.getJSONObject("record"))
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun reportBookLost(borrowId: String): BorrowRecord? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/borrow/$borrowId/lost", "POST")
            if (conn.responseCode in 200..299) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    markSyncSuccess("Book marked lost on Web")
                    return@withContext parseBorrowRecord(json.getJSONObject("record"))
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    // ==========================================
    // REVIEWS & RATINGS
    // ==========================================

    suspend fun fetchReviews(bookId: String? = null, status: String? = null): List<Review>? = withContext(Dispatchers.IO) {
        try {
            val queryParams = mutableListOf<String>()
            bookId?.let { queryParams.add("bookId=$it") }
            status?.let { queryParams.add("status=$it") }
            val queryString = if (queryParams.isNotEmpty()) "?" + queryParams.joinToString("&") else ""
            val conn = openConnection("/reviews$queryString", "GET")
            if (conn.responseCode == 200) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    val arr = json.getJSONArray("reviews")
                    val list = mutableListOf<Review>()
                    for (i in 0 until arr.length()) {
                        list.add(parseReview(arr.getJSONObject(i)))
                    }
                    markSyncSuccess("Reviews synced (${list.size})")
                    return@withContext list
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun submitReview(bookId: String, rating: Double, title: String, comment: String): Review? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/reviews", "POST")
            val body = JSONObject().apply {
                put("bookId", bookId)
                put("rating", rating)
                put("title", title)
                put("comment", comment)
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode in 200..201) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    markSyncSuccess("Review submitted to Web")
                    return@withContext parseReview(json.getJSONObject("review"))
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun moderateReview(reviewId: String, approved: Boolean): Boolean = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/reviews/$reviewId/status", "PATCH")
            val body = JSONObject().apply {
                put("status", if (approved) "approved" else "rejected")
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode in 200..299) {
                markSyncSuccess("Review $reviewId ${if (approved) "approved" else "rejected"} on Web")
                return@withContext true
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        false
    }

    // ==========================================
    // INVENTORY MANAGEMENT
    // ==========================================

    suspend fun updateStock(bookId: String, newStock: Int): Boolean = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/inventory/$bookId/stock", "PATCH")
            val body = JSONObject().apply { put("stock", newStock) }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode in 200..299) {
                markSyncSuccess("Inventory stock updated on Web")
                return@withContext true
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        false
    }

    // ==========================================
    // AUDIT LOGS
    // ==========================================

    suspend fun fetchAuditLogs(): List<AuditLog>? = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/audit-logs", "GET")
            if (conn.responseCode == 200) {
                val json = JSONObject(readStream(conn))
                if (json.optBoolean("success")) {
                    val arr = json.getJSONArray("logs")
                    val list = mutableListOf<AuditLog>()
                    for (i in 0 until arr.length()) {
                        list.add(parseAuditLog(arr.getJSONObject(i)))
                    }
                    markSyncSuccess("Audit logs synced (${list.size})")
                    return@withContext list
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    // ==========================================
    // SYSTEM & RESILIENCE
    // ==========================================

    suspend fun resetSystem(): Boolean = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/system/reset", "POST")
            if (conn.responseCode == 200) {
                markSyncSuccess("Backend reset to pristine state")
                return@withContext true
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        false
    }

    suspend fun setSimulatedLatency(delayMs: Long): Boolean = withContext(Dispatchers.IO) {
        try {
            val conn = openConnection("/system/latency", "POST")
            val body = JSONObject().apply { put("delayMs", delayMs) }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            return@withContext (conn.responseCode in 200..299)
        } catch (e: Exception) {
            return@withContext false
        }
    }

    // ==========================================
    // PARSERS
    // ==========================================

    private fun parseOrder(obj: JSONObject): Order {
        val itemsArr = obj.optJSONArray("items") ?: JSONArray()
        val items = mutableListOf<OrderItem>()
        for (j in 0 until itemsArr.length()) {
            val itmObj = itemsArr.getJSONObject(j)
            items.add(
                OrderItem(
                    bookId = itmObj.optString("bookId"),
                    title = itmObj.optString("title"),
                    price = itmObj.optDouble("price", 0.0),
                    quantity = itmObj.optInt("quantity", 1),
                    coverImage = itmObj.optString("coverImage", "")
                )
            )
        }

        val addrObj = obj.optJSONObject("shippingAddress")
        val address = ShippingAddress(
            fullName = addrObj?.optString("fullName") ?: "",
            street = addrObj?.optString("street") ?: "",
            city = addrObj?.optString("city") ?: "",
            state = addrObj?.optString("state") ?: "",
            zipCode = addrObj?.optString("postalCode")?.takeIf { it.isNotBlank() } ?: addrObj?.optString("zipCode") ?: "",
            country = addrObj?.optString("country") ?: "USA"
        )

        val statusStr = obj.optString("status", "pending")
        val orderStatus = try {
            OrderStatus.valueOf(statusStr.lowercase())
        } catch (e: Exception) {
            OrderStatus.pending
        }

        return Order(
            id = obj.optString("id"),
            orderNumber = obj.optString("orderNumber", "ORD-UNKNOWN"),
            userId = obj.optString("userId"),
            username = obj.optString("username", "customer"),
            items = items,
            subtotal = obj.optDouble("subtotal", 0.0),
            discount = obj.optDouble("discount", 0.0),
            tax = obj.optDouble("tax", 0.0),
            total = obj.optDouble("total", 0.0),
            shippingAddress = address,
            deliveryDate = obj.optString("deliveryDate", "2026-09-20"),
            paymentMethod = obj.optString("paymentMethod", "Credit Card"),
            status = orderStatus,
            trackingNumber = if (obj.has("trackingNumber") && !obj.isNull("trackingNumber")) obj.optString("trackingNumber") else null,
            createdAt = obj.optString("createdAt", "2026-09-16")
        )
    }

    private fun parseBook(obj: JSONObject): Book {
        val tagsArr = obj.optJSONArray("tags") ?: JSONArray()
        val tagsList = mutableListOf<String>()
        for (k in 0 until tagsArr.length()) {
            tagsList.add(tagsArr.getString(k))
        }

        return Book(
            id = obj.optString("id"),
            title = obj.optString("title"),
            isbn = obj.optString("isbn"),
            authorId = obj.optString("authorId"),
            authorName = obj.optString("authorName"),
            categoryId = obj.optString("categoryId"),
            categoryName = obj.optString("categoryName"),
            price = obj.optDouble("price", 19.99),
            originalPrice = obj.optDouble("originalPrice", 24.99),
            rentalPrice = obj.optDouble("rentalPrice", 2.00),
            rating = obj.optDouble("rating", 4.5),
            reviewCount = obj.optInt("reviewCount", 10),
            stock = obj.optInt("stock", 15),
            pages = obj.optInt("pages", 300),
            publicationDate = obj.optString("publicationDate", "2024-01-01"),
            coverImage = obj.optString("coverImage", ""),
            description = obj.optString("description", ""),
            tags = tagsList,
            isFeatured = obj.optBoolean("isFeatured", false),
            isVipExclusive = obj.optBoolean("isVipExclusive", false),
            sellerType = obj.optString("sellerType", "in_house")
        )
    }

    private fun parseBorrowRecord(obj: JSONObject): BorrowRecord {
        val statusStr = obj.optString("status", "active")
        val status = try { BorrowStatus.valueOf(statusStr.lowercase()) } catch (e: Exception) { BorrowStatus.active }
        val currStr = obj.optString("currency", "USD")
        val curr = try { Currency.valueOf(currStr.uppercase()) } catch (e: Exception) { Currency.USD }

        return BorrowRecord(
            id = obj.optString("id"),
            userId = obj.optString("userId"),
            username = obj.optString("username"),
            bookId = obj.optString("bookId"),
            bookTitle = obj.optString("bookTitle"),
            bookCover = obj.optString("bookCover", ""),
            bookPrice = obj.optDouble("bookPrice", 19.99),
            borrowDate = obj.optString("borrowDate"),
            dueDate = obj.optString("dueDate"),
            returnDate = if (obj.has("returnDate") && !obj.isNull("returnDate")) obj.optString("returnDate") else null,
            status = status,
            standardFee = obj.optDouble("standardFee", 2.00),
            lateFee = obj.optDouble("lateFee", 0.0),
            lostFee = obj.optDouble("lostFee", 0.0),
            totalFee = obj.optDouble("totalFee", 2.00),
            currency = curr,
            timezone = obj.optString("timezone", "America/New_York")
        )
    }

    private fun parseReview(obj: JSONObject): Review {
        val statusStr = obj.optString("status", "approved")
        val status = try { ReviewStatus.valueOf(statusStr.lowercase()) } catch (e: Exception) { ReviewStatus.approved }

        return Review(
            id = obj.optString("id"),
            bookId = obj.optString("bookId"),
            userId = obj.optString("userId"),
            username = obj.optString("username"),
            rating = obj.optDouble("rating", 5.0),
            title = obj.optString("title"),
            comment = obj.optString("comment"),
            status = status,
            createdAt = obj.optString("createdAt", "2026-09-16")
        )
    }

    private fun parseUser(obj: JSONObject): User {
        val roleStr = obj.optString("role", "standard_customer")
        val role = try { UserRole.valueOf(roleStr.lowercase()) } catch (e: Exception) { UserRole.standard_customer }
        val currStr = obj.optString("currency", "USD")
        val curr = try { Currency.valueOf(currStr.uppercase()) } catch (e: Exception) { Currency.USD }

        return User(
            id = obj.optString("id"),
            username = obj.optString("username"),
            password = obj.optString("password", "Pass123"),
            email = obj.optString("email"),
            fullName = obj.optString("fullName"),
            role = role,
            avatar = obj.optString("avatar", ""),
            status = obj.optString("status", "active"),
            currency = curr,
            timezone = obj.optString("timezone", "America/New_York"),
            isSystem = obj.optBoolean("isSystem", true),
            createdAt = obj.optString("createdAt", "2026-01-01")
        )
    }

    private fun parseAuditLog(obj: JSONObject): AuditLog {
        return AuditLog(
            id = obj.optString("id"),
            timestamp = obj.optString("timestamp"),
            userId = obj.optString("userId"),
            username = obj.optString("username"),
            role = obj.optString("role"),
            action = obj.optString("action"),
            entity = obj.optString("entity"),
            entityId = obj.optString("entityId"),
            details = obj.optString("details"),
            ipAddress = obj.optString("ipAddress", "127.0.0.1")
        )
    }
}
