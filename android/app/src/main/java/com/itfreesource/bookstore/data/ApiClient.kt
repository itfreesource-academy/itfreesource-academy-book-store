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
    // 10.0.2.2 is Android Emulator default alias to host machine localhost:5000
    var baseUrl: String = "http://10.0.2.2:5000/api/v1"
    var authToken: String? = null
    var isLiveConnected: Boolean = false
    var lastSyncStatus: String = "Not connected (Using local mock data)"
    var lastSyncTimestamp: String = "Never"

    private fun readStream(conn: HttpURLConnection): String {
        val stream = if (conn.responseCode in 200..299) conn.inputStream else conn.errorStream
        return BufferedReader(InputStreamReader(stream ?: return "")).use { it.readText() }
    }

    suspend fun login(username: String, pass: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/auth/login")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                connectTimeout = 3000
                readTimeout = 3000
                doOutput = true
            }
            val body = JSONObject().apply {
                put("username", username)
                put("password", pass)
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            val code = conn.responseCode
            val resp = readStream(conn)
            if (code == 200) {
                val json = JSONObject(resp)
                if (json.optBoolean("success")) {
                    authToken = json.optString("token")
                    isLiveConnected = true
                    lastSyncStatus = "Connected to Live Web API"
                    lastSyncTimestamp = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
                    return@withContext true
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
            lastSyncStatus = "Backend offline (${e.localizedMessage ?: "timeout"}), using local state"
        }
        false
    }

    suspend fun fetchOrders(): List<Order>? = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/orders")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                setRequestProperty("Accept", "application/json")
                authToken?.let { setRequestProperty("Authorization", "Bearer $it") }
                connectTimeout = 3000
                readTimeout = 3000
            }
            if (conn.responseCode == 200) {
                val resp = readStream(conn)
                val json = JSONObject(resp)
                if (json.optBoolean("success")) {
                    val arr = json.getJSONArray("orders")
                    val list = mutableListOf<Order>()
                    for (i in 0 until arr.length()) {
                        list.add(parseOrder(arr.getJSONObject(i)))
                    }
                    isLiveConnected = true
                    lastSyncStatus = "Orders synced with Web API (${list.size} orders)"
                    lastSyncTimestamp = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
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
            val url = URL("$baseUrl/orders")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                authToken?.let { setRequestProperty("Authorization", "Bearer $it") }
                connectTimeout = 4000
                readTimeout = 4000
                doOutput = true
            }

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
            val code = conn.responseCode
            val resp = readStream(conn)
            if (code in 200..201) {
                val json = JSONObject(resp)
                if (json.optBoolean("success")) {
                    val orderJson = json.getJSONObject("order")
                    isLiveConnected = true
                    lastSyncStatus = "Order pushed to Web API"
                    lastSyncTimestamp = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
                    return@withContext parseOrder(orderJson)
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun updateOrderStatus(orderId: String, status: String, trackingNumber: String?): Boolean = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/orders/$orderId/status")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "PATCH"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                authToken?.let { setRequestProperty("Authorization", "Bearer $it") }
                connectTimeout = 3000
                readTimeout = 3000
                doOutput = true
            }
            val body = JSONObject().apply {
                put("status", status)
                if (!trackingNumber.isNullOrBlank()) {
                    put("trackingNumber", trackingNumber)
                }
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            val code = conn.responseCode
            if (code in 200..299) {
                isLiveConnected = true
                lastSyncTimestamp = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
                return@withContext true
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        false
    }

    suspend fun fetchBooks(): List<Book>? = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/books?limit=100")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                setRequestProperty("Accept", "application/json")
                connectTimeout = 3000
                readTimeout = 3000
            }
            if (conn.responseCode == 200) {
                val resp = readStream(conn)
                val json = JSONObject(resp)
                if (json.optBoolean("success")) {
                    val arr = json.getJSONArray("books")
                    val list = mutableListOf<Book>()
                    for (i in 0 until arr.length()) {
                        list.add(parseBook(arr.getJSONObject(i)))
                    }
                    isLiveConnected = true
                    lastSyncStatus = "Books synced (${list.size} items)"
                    lastSyncTimestamp = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
                    return@withContext list
                }
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        null
    }

    suspend fun resetSystem(): Boolean = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/system/reset")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Accept", "application/json")
                connectTimeout = 3000
                readTimeout = 3000
            }
            if (conn.responseCode == 200) {
                isLiveConnected = true
                lastSyncStatus = "Backend reset to pristine state"
                lastSyncTimestamp = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
                return@withContext true
            }
        } catch (e: Exception) {
            isLiveConnected = false
        }
        false
    }

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
            country = addrObj?.optString("country") ?: ""
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
}
