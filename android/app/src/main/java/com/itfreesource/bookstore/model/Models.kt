package com.itfreesource.bookstore.model

enum class UserRole(val label: String) {
    admin("Super Admin"),
    store_manager("Store Manager"),
    inventory_clerk("Inventory Clerk"),
    content_editor("Content Editor"),
    order_fulfillment("Order Fulfillment"),
    support_agent("Support Agent"),
    book_reviewer("Book Reviewer"),
    auditor("Auditor"),
    vip_customer("VIP Customer"),
    standard_customer("Standard Customer"),
    marketplace_seller("Marketplace Seller")
}

enum class Currency(val code: String, val symbol: String, val rate: Double, val flag: String) {
    USD("USD", "$", 1.0, "🇺🇸"),
    AED("AED", "AED ", 3.67, "🇦🇪"),
    INR("INR", "₹", 83.50, "🇮🇳"),
    JPY("JPY", "¥", 155.00, "🇯🇵"),
    AUD("AUD", "A$", 1.52, "🇦🇺")
}

data class User(
    val id: String,
    val username: String,
    val password: String = "Pass123",
    val email: String,
    val fullName: String,
    val role: UserRole,
    val avatar: String = "",
    val status: String = "active",
    val currency: Currency = Currency.USD,
    val timezone: String = "America/New_York",
    val isSystem: Boolean = true,
    val createdAt: String = "2026-01-01"
)

data class Category(
    val id: String,
    val name: String,
    val slug: String,
    val description: String,
    val bookCount: Int
)

data class Author(
    val id: String,
    val name: String,
    val bio: String,
    val photo: String,
    val nationality: String
)

data class Book(
    val id: String,
    val title: String,
    val isbn: String,
    val authorId: String,
    val authorName: String,
    val categoryId: String,
    val categoryName: String,
    val price: Double,
    val originalPrice: Double = price * 1.25,
    val rentalPrice: Double = 2.00,
    val rating: Double = 4.5,
    val reviewCount: Int = 10,
    var stock: Int = 15,
    val pages: Int = 300,
    val publicationDate: String = "2024-01-01",
    val coverImage: String = "",
    val description: String = "",
    val tags: List<String> = emptyList(),
    val isFeatured: Boolean = false,
    val isVipExclusive: Boolean = false,
    val sellerType: String = "in_house"
)

data class CartItem(
    val book: Book,
    var quantity: Int = 1
)

enum class OrderStatus {
    pending, processing, shipped, delivered, cancelled, refunded
}

data class OrderItem(
    val bookId: String,
    val title: String,
    val price: Double,
    val quantity: Int,
    val coverImage: String = ""
)

data class ShippingAddress(
    val fullName: String = "",
    val street: String = "",
    val city: String = "",
    val state: String = "",
    val zipCode: String = "",
    val country: String = "USA"
)

data class Order(
    val id: String,
    val orderNumber: String,
    val userId: String,
    val username: String,
    val items: List<OrderItem>,
    val subtotal: Double,
    val discount: Double,
    val tax: Double,
    val total: Double,
    val shippingAddress: ShippingAddress,
    val deliveryDate: String,
    val paymentMethod: String,
    var status: OrderStatus,
    var trackingNumber: String? = null,
    val createdAt: String
)

enum class ReviewStatus {
    pending, approved, rejected
}

data class Review(
    val id: String,
    val bookId: String,
    val userId: String,
    val username: String,
    val rating: Double,
    val title: String,
    val comment: String,
    var status: ReviewStatus = ReviewStatus.approved,
    val createdAt: String
)

enum class BorrowStatus {
    active, returned, overdue, lost
}

data class BorrowRecord(
    val id: String,
    val userId: String,
    val username: String,
    val bookId: String,
    val bookTitle: String,
    val bookCover: String,
    val bookPrice: Double,
    val borrowDate: String,
    val dueDate: String,
    var returnDate: String? = null,
    var status: BorrowStatus = BorrowStatus.active,
    val standardFee: Double = 2.00,
    var lateFee: Double = 0.0,
    var lostFee: Double = 0.0,
    var totalFee: Double = 2.00,
    val currency: Currency = Currency.USD,
    val timezone: String = "America/New_York"
)

data class AuditLog(
    val id: String,
    val timestamp: String,
    val userId: String,
    val username: String,
    val role: String,
    val action: String,
    val entity: String,
    val entityId: String,
    val details: String,
    val ipAddress: String
)

data class Microservice(
    val name: String,
    val label: String,
    var status: String = "healthy",
    var latencyMs: Long = 45,
    var isFaultInjected: Boolean = false
)
