import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
      title: 'ITFreeSource Academy - Book Store Platform API',
      version: '1.0.0',
      description: `
### 🚀 ITFreeSource Academy Book Store REST API & QA Testing Platform

Interactive OpenAPI 3.0 API documentation and live test execution console.

#### 🔐 Live Testing with JWT Authorization:
1. Click **Try it out** on \`POST /api/v1/auth/login\` below.
2. Log in with any of the 10 preconfigured test accounts (e.g., username: \`admin\`, password: \`Admin@Pass123\`).
3. Copy the returned \`token\`.
4. Click the green **Authorize 🔓** button at the top right, paste your token, and click **Authorize**.
5. You can now execute all protected endpoints directly in this browser console!

#### 📖 Book Borrowing & Return Policy:
- **Standard Reading Period**: **10 days** for a base rental fee of **$2.00** (or local currency equivalent).
- **Late Return Penalty**: **$0.10 per day** overdue beyond 10 days until returned.
- **Lost Book Policy**: **2x (two times) the purchase price** of the book + base fee if declared lost.
- **VIP Customer Benefit**: 20% discount on borrowing fees and late penalties.

#### 🌍 Supported Currencies & Regional Timezones:
- **USD ($)**: \`America/New_York\` (EST/EDT) — Persona: \`admin\`, \`book_reviewer\`
- **AED (AED / د.إ)**: \`Asia/Dubai\` (GST) — Persona: \`store_manager\`, \`support_agent\`, \`vip_customer\`
- **INR (₹)**: \`Asia/Kolkata\` (IST) — Persona: \`inventory_clerk\`, \`standard_customer\`
- **JPY (¥)**: \`Asia/Tokyo\` (JST) — Persona: \`content_editor\`, \`auditor\`
- **AUD (A$)**: \`Australia/Sydney\` (AEST) — Persona: \`order_fulfillment\`
- Fixed exchange rates: \`1 USD = 3.67 AED = 83.50 INR = 155.00 JPY = 1.52 AUD\`.
      `,
      contact: {
        name: 'ITFreeSource Academy',
        url: 'https://github.com/itfreesource-academy/itfreesource-academy-book-store'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from `/api/v1/auth/login` (without "Bearer ", just the token)'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Invalid credentials provided.' },
            code: { type: 'string', example: 'INVALID_CREDENTIALS' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'usr_001' },
            username: { type: 'string', example: 'admin' },
            email: { type: 'string', example: 'admin@itfreesource-academy.org' },
            fullName: { type: 'string', example: 'Alexander Wright' },
            role: { type: 'string', example: 'admin' },
            status: { type: 'string', enum: ['active', 'suspended'], example: 'active' },
            currency: { type: 'string', enum: ['USD', 'AED', 'INR', 'JPY', 'AUD'], example: 'USD' },
            timezone: { type: 'string', example: 'America/New_York' },
            avatar: { type: 'string', format: 'uri' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Book: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'book_001' },
            title: { type: 'string', example: 'Clean Code' },
            isbn: { type: 'string', example: '978-0132350884' },
            authorName: { type: 'string', example: 'Robert C. Martin' },
            categoryName: { type: 'string', example: 'Technology & Programming' },
            price: { type: 'number', example: 44.99 },
            originalPrice: { type: 'number', example: 52.99 },
            rating: { type: 'number', example: 4.8 },
            stock: { type: 'number', example: 48 },
            pages: { type: 'number', example: 464 },
            publicationDate: { type: 'string', format: 'date', example: '2008-08-01' },
            coverImage: { type: 'string', format: 'uri' },
            isFeatured: { type: 'boolean', example: true },
            isVipExclusive: { type: 'boolean', example: false }
          }
        },
        BorrowRecord: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'brw_001' },
            userId: { type: 'string', example: 'usr_010' },
            username: { type: 'string', example: 'standard_customer' },
            bookId: { type: 'string', example: 'book_001' },
            bookTitle: { type: 'string', example: 'Clean Code' },
            bookPrice: { type: 'number', example: 44.99 },
            borrowDate: { type: 'string', format: 'date-time' },
            dueDate: { type: 'string', format: 'date-time' },
            returnDate: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['active', 'returned', 'overdue', 'lost'], example: 'active' },
            standardFee: { type: 'number', example: 2.00 },
            lateFee: { type: 'number', example: 0.00 },
            lostFee: { type: 'number', example: 0.00 },
            totalFee: { type: 'number', example: 2.00 },
            currency: { type: 'string', example: 'INR' },
            timezone: { type: 'string', example: 'Asia/Kolkata' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ord_001' },
            orderNumber: { type: 'string', example: 'ORD-2026-9001' },
            userId: { type: 'string', example: 'usr_009' },
            username: { type: 'string', example: 'vip_customer' },
            subtotal: { type: 'number', example: 134.98 },
            discount: { type: 'number', example: 27.00 },
            total: { type: 'number', example: 116.62 },
            status: { type: 'string', example: 'shipped' },
            deliveryDate: { type: 'string', format: 'date' }
          }
        }
      }
    },
    paths: {
      '/api/v1/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate user & generate JWT token',
          description: 'Login with any of the 10 test personas (e.g., `admin` / `Admin@Pass123`, `store_manager` / `Manager@Pass123`, `standard_customer` / `User@Pass123`). Copy the returned token to use in the **Authorize** button.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'password'],
                  properties: {
                    username: { type: 'string', example: 'admin' },
                    password: { type: 'string', example: 'Admin@Pass123' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful. Returns Bearer token and user permissions.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      token: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                      permissions: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/api/v1/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current authenticated user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/v1/auth/users': {
        get: {
          tags: ['Users & RBAC'],
          summary: 'List all 10 preconfigured user accounts with regional timezones',
          responses: { 200: { description: 'List of users' } }
        }
      },
      '/api/v1/auth/users/{id}': {
        put: {
          tags: ['Users & RBAC'],
          summary: 'Admin User Management: Edit user full name, role, email, status, timezone, or currency',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    fullName: { type: 'string', example: 'Emma Watson-Brown' },
                    email: { type: 'string', example: 'emma.brown@outlook.com' },
                    role: { type: 'string', enum: ['admin', 'store_manager', 'inventory_clerk', 'content_editor', 'order_fulfillment', 'support_agent', 'book_reviewer', 'auditor', 'vip_customer', 'standard_customer'], example: 'store_manager' },
                    status: { type: 'string', enum: ['active', 'suspended'], example: 'active' },
                    currency: { type: 'string', enum: ['USD', 'AED', 'INR', 'JPY', 'AUD'], example: 'INR' },
                    timezone: { type: 'string', example: 'Asia/Kolkata' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'User updated successfully' },
            403: { description: 'Forbidden: Requires users:manage permission' }
          }
        }
      },
      '/api/v1/books': {
        get: {
          tags: ['Books & Catalog'],
          summary: 'List books with filters, dual price range, rating, and pagination',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'minRating', in: 'query', schema: { type: 'number' } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'rating_desc', 'title_asc'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } }
          ],
          responses: { 200: { description: 'Paginated books' } }
        },
        post: {
          tags: ['Books & Catalog'],
          summary: 'Create a new book (Requires catalog:create)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } }
          },
          responses: { 201: { description: 'Book created' }, 403: { description: 'Forbidden' } }
        }
      },
      '/api/v1/books/{id}': {
        get: {
          tags: ['Books & Catalog'],
          summary: 'Get single book details',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book found' } }
        },
        put: {
          tags: ['Books & Catalog'],
          summary: 'Update book details (Requires catalog:update)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 200: { description: 'Book updated' } }
        },
        delete: {
          tags: ['Books & Catalog'],
          summary: 'Delete book (Requires catalog:delete - Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book deleted' } }
        }
      },
      '/api/v1/borrow': {
        get: {
          tags: ['Book Borrowing & Loans'],
          summary: 'List borrowed books (User sees own; Manager/Admin/Auditor see all)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of borrow records' } }
        },
        post: {
          tags: ['Book Borrowing & Loans'],
          summary: 'Borrow a book for 10 days ($2.00 base fee)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['bookId'],
                  properties: {
                    bookId: { type: 'string', example: 'book_001' },
                    timezone: { type: 'string', example: 'Asia/Dubai' },
                    currency: { type: 'string', enum: ['USD', 'AED', 'INR', 'JPY', 'AUD'], example: 'AED' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Book borrowed successfully' }, 400: { description: 'Out of stock or invalid book' } }
        }
      },
      '/api/v1/borrow/{id}/preview-fee': {
        get: {
          tags: ['Book Borrowing & Loans'],
          summary: 'Real-time fee calculation preview given simulated return date or lost flag',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'returnDate', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Simulated return timestamp (ISO format)' },
            { name: 'isLost', in: 'query', schema: { type: 'boolean', default: false }, description: 'Simulate book lost (2x book price fee)' }
          ],
          responses: { 200: { description: 'Calculated breakdown of standard fee, late penalty, and total fee' } }
        }
      },
      '/api/v1/borrow/{id}/return': {
        post: {
          tags: ['Book Borrowing & Loans'],
          summary: 'Return book and settle fees ($2.00 base + $0.10/day overdue)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    returnDate: { type: 'string', format: 'date-time', description: 'Optional simulated return timestamp' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Book returned, stock restored, fee finalized' } }
        }
      },
      '/api/v1/borrow/{id}/lost': {
        post: {
          tags: ['Book Borrowing & Loans'],
          summary: 'Report book as lost (Charges 2x book price replacement penalty)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book marked as lost with 2x penalty applied' } }
        }
      },
      '/api/v1/orders': {
        get: {
          tags: ['Orders'],
          summary: 'List orders (filtered by user or all based on role)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Orders list' } }
        },
        post: {
          tags: ['Orders'],
          summary: 'Create new purchase order (VIP 20% discount applied automatically)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 201: { description: 'Order created' } }
        }
      },
      '/api/v1/inventory': {
        get: {
          tags: ['Inventory'],
          summary: 'Warehouse inventory status (Requires inventory:read)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Inventory stock list' } }
        }
      },
      '/api/v1/inventory/{id}/stock': {
        patch: {
          tags: ['Inventory'],
          summary: 'Update book warehouse stock',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { stock: { type: 'integer' } } } } } },
          responses: { 200: { description: 'Stock updated' } }
        }
      },
      '/api/v1/audit-logs': {
        get: {
          tags: ['Audit & Compliance'],
          summary: 'Inspect immutable system activity trail (Auditor & Admin only)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Audit log entries' } }
        }
      },
      '/api/v1/system/reset': {
        post: {
          tags: ['System & QA Sandbox'],
          summary: 'Instantly restore test database back to initial seed data',
          responses: { 200: { description: 'Database restored to initial seeds' } }
        }
      },
      '/api/v1/system/health': {
        get: {
          tags: ['System & QA Sandbox'],
          summary: 'Check API service health & uptime',
          responses: { 200: { description: 'Health check OK' } }
        }
      },
      '/api/v1/system/simulate-error': {
        get: {
          tags: ['System & QA Sandbox'],
          summary: 'Simulate HTTP error status code (400, 401, 403, 404, 429, 500, 503)',
          parameters: [{ name: 'status', in: 'query', schema: { type: 'integer', default: 500 } }],
          responses: { default: { description: 'Simulated error payload' } }
        }
      }
    }
  };

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition as any,
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);
