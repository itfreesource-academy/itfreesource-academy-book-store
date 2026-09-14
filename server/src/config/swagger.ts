import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ITFreeSource Academy - Book Store Platform API',
      version: '1.0.0',
      description: `
**ITFreeSource Academy Book Store REST API & QA Testing Platform**

This API powers the ITFreeSource Academy Book Store application and acts as a comprehensive sandbox for testing authentication, Role-Based Access Control (RBAC), catalog CRUD, order fulfillment workflows, review moderation, and network simulation.

### 🔑 Test User Personas & Credentials
| Username | Password | Role | Allowed Scope |
|---|---|---|---|
| \`admin\` | \`Admin@Pass123\` | Super Admin | Complete system & user management |
| \`store_manager\` | \`Manager@Pass123\` | Store Manager | Catalog CRUD, orders, pricing |
| \`inventory_clerk\` | \`Stock@Pass123\` | Inventory Clerk | Stock levels, inventory alerts |
| \`content_editor\` | \`Editor@Pass123\` | Content Editor | Book descriptions, tags, covers |
| \`order_fulfillment\` | \`Orders@Pass123\` | Order Specialist | Status transitions, tracking |
| \`support_agent\` | \`Support@Pass123\` | Support Agent | Orders, refunds, reviews |
| \`book_reviewer\` | \`Reviewer@Pass123\` | Lead Reviewer | Review moderation |
| \`auditor\` | \`Audit@Pass123\` | Compliance Auditor | Read-only audit logs & system stats |
| \`vip_customer\` | \`Vip@Pass123\` | VIP Customer | 20% discount, exclusive books |
| \`standard_customer\` | \`User@Pass123\` | Regular Customer | Public browsing, checkout |

### 🛠️ QA Automation Features
- Pass \`x-mock-delay: <ms>\` header on any request to simulate network latency.
- Call \`POST /api/v1/system/reset\` to instantly restore the database to its initial seed state.
- Call \`GET /api/v1/system/simulate-error?status=500\` to test client resilience and error handling.
      `,
      contact: {
        name: 'ITFreeSource Academy',
        url: 'https://github.com/itfreesource-academy/itfreesource-academy-book-store'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from `/api/v1/auth/login`'
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
            avatar: { type: 'string', format: 'uri' },
            status: { type: 'string', enum: ['active', 'suspended'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Book: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'book_001' },
            title: { type: 'string', example: 'Clean Code' },
            isbn: { type: 'string', example: '978-0132350884' },
            authorId: { type: 'string', example: 'aut_001' },
            authorName: { type: 'string', example: 'Robert C. Martin' },
            categoryId: { type: 'string', example: 'cat_tech' },
            categoryName: { type: 'string', example: 'Technology & Programming' },
            price: { type: 'number', example: 44.99 },
            originalPrice: { type: 'number', example: 52.99 },
            rating: { type: 'number', example: 4.8 },
            reviewCount: { type: 'number', example: 342 },
            stock: { type: 'number', example: 48 },
            pages: { type: 'number', example: 464 },
            publicationDate: { type: 'string', format: 'date', example: '2008-08-01' },
            coverImage: { type: 'string', format: 'uri' },
            description: { type: 'string', example: 'A handbook of agile software craftsmanship.' },
            tags: { type: 'array', items: { type: 'string' } },
            isFeatured: { type: 'boolean', example: true },
            isVipExclusive: { type: 'boolean', example: false }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cat_tech' },
            name: { type: 'string', example: 'Technology & Programming' },
            slug: { type: 'string', example: 'technology' },
            description: { type: 'string' },
            bookCount: { type: 'number', example: 8 }
          }
        },
        Author: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'aut_001' },
            name: { type: 'string', example: 'Robert C. Martin' },
            bio: { type: 'string' },
            photo: { type: 'string', format: 'uri' },
            nationality: { type: 'string', example: 'American' }
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
            tax: { type: 'number', example: 8.64 },
            total: { type: 'number', example: 116.62 },
            status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], example: 'shipped' },
            trackingNumber: { type: 'string', example: 'TRK-98214-WA-FEDEX' },
            deliveryDate: { type: 'string', format: 'date', example: '2026-09-20' },
            paymentMethod: { type: 'string', example: 'Credit Card' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'rev_001' },
            bookId: { type: 'string', example: 'book_001' },
            userId: { type: 'string', example: 'usr_007' },
            username: { type: 'string', example: 'book_reviewer' },
            rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
            title: { type: 'string', example: 'Masterpiece' },
            comment: { type: 'string', example: 'Great read.' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'approved' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'aud_001' },
            timestamp: { type: 'string', format: 'date-time' },
            userId: { type: 'string', example: 'usr_001' },
            username: { type: 'string', example: 'admin' },
            role: { type: 'string', example: 'admin' },
            action: { type: 'string', example: 'PRICE_UPDATE' },
            entity: { type: 'string', example: 'Book' },
            entityId: { type: 'string', example: 'book_001' },
            details: { type: 'string', example: 'Price updated from $48 to $44.99' },
            ipAddress: { type: 'string', example: '127.0.0.1' }
          }
        }
      }
    },
    paths: {
      '/api/v1/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User Login with credentials',
          description: 'Authenticate with any of the 10 preconfigured user accounts to receive a JWT Bearer token.',
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
              description: 'Successful login',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                      user: { $ref: '#/components/schemas/User' },
                      permissions: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Invalid credentials',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/v1/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current authenticated user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Current user profile',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
            },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/v1/auth/users': {
        get: {
          tags: ['Authentication & Users'],
          summary: 'List all preconfigured users and their roles',
          responses: {
            200: {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      users: { type: 'array', items: { $ref: '#/components/schemas/User' } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/books': {
        get: {
          tags: ['Books'],
          summary: 'List and filter books with pagination',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search keyword (title, author, ISBN, tags)' },
            { name: 'categoryId', in: 'query', schema: { type: 'string' }, description: 'Filter by category ID' },
            { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Minimum price filter' },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Maximum price filter' },
            { name: 'minRating', in: 'query', schema: { type: 'number' }, description: 'Minimum rating filter' },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'rating_desc', 'title_asc'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } }
          ],
          responses: {
            200: {
              description: 'Paginated list of books',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      books: { type: 'array', items: { $ref: '#/components/schemas/Book' } },
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      totalPages: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Books'],
          summary: 'Create a new book (Requires catalog:create permission)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'isbn', 'authorId', 'categoryId', 'price', 'stock'],
                  properties: {
                    title: { type: 'string' },
                    isbn: { type: 'string' },
                    authorId: { type: 'string' },
                    categoryId: { type: 'string' },
                    price: { type: 'number' },
                    stock: { type: 'number' },
                    pages: { type: 'number' },
                    publicationDate: { type: 'string', format: 'date' },
                    coverImage: { type: 'string' },
                    description: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    isFeatured: { type: 'boolean' },
                    isVipExclusive: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Book created successfully' },
            403: { description: 'Forbidden for current user role' }
          }
        }
      },
      '/api/v1/books/{id}': {
        get: {
          tags: ['Books'],
          summary: 'Get book details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Book found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } },
            404: { description: 'Book not found' }
          }
        },
        put: {
          tags: ['Books'],
          summary: 'Update book details (Requires catalog:update permission)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } }
          },
          responses: {
            200: { description: 'Book updated successfully' },
            403: { description: 'Forbidden' }
          }
        },
        delete: {
          tags: ['Books'],
          summary: 'Delete a book (Requires catalog:delete permission - Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Book deleted successfully' },
            403: { description: 'Forbidden' }
          }
        }
      },
      '/api/v1/categories': {
        get: {
          tags: ['Categories'],
          summary: 'List all book categories',
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      categories: { type: 'array', items: { $ref: '#/components/schemas/Category' } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/authors': {
        get: {
          tags: ['Authors'],
          summary: 'List all authors',
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      authors: { type: 'array', items: { $ref: '#/components/schemas/Author' } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/orders': {
        get: {
          tags: ['Orders'],
          summary: 'List orders (filtered by user or all based on role)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      orders: { type: 'array', items: { $ref: '#/components/schemas/Order' } }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Orders'],
          summary: 'Create a new order (Checkout)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } }
          },
          responses: {
            201: { description: 'Order created successfully' }
          }
        }
      },
      '/api/v1/orders/{id}/status': {
        patch: {
          tags: ['Orders'],
          summary: 'Update order status (Requires orders:update_status)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] },
                    trackingNumber: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Status updated' }
          }
        }
      },
      '/api/v1/inventory': {
        get: {
          tags: ['Inventory'],
          summary: 'Get warehouse inventory overview (Requires inventory:read)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Inventory stock list' }
          }
        }
      },
      '/api/v1/inventory/{id}/stock': {
        patch: {
          tags: ['Inventory'],
          summary: 'Adjust book stock level (Requires inventory:update)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['stock'],
                  properties: { stock: { type: 'integer' } }
                }
              }
            }
          },
          responses: { 200: { description: 'Stock updated' } }
        }
      },
      '/api/v1/reviews': {
        get: {
          tags: ['Reviews'],
          summary: 'Get reviews for a book or moderation queue',
          parameters: [
            { name: 'bookId', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'approved', 'pending', 'rejected'] } }
          ],
          responses: { 200: { description: 'Reviews list' } }
        },
        post: {
          tags: ['Reviews'],
          summary: 'Submit a new book review',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['bookId', 'rating', 'title', 'comment'],
                  properties: {
                    bookId: { type: 'string' },
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    title: { type: 'string' },
                    comment: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Review submitted' } }
        }
      },
      '/api/v1/reviews/{id}/status': {
        patch: {
          tags: ['Reviews'],
          summary: 'Moderate review (Approve/Reject) (Requires reviews:moderate)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: { status: { type: 'string', enum: ['approved', 'rejected'] } }
                }
              }
            }
          },
          responses: { 200: { description: 'Review moderated' } }
        }
      },
      '/api/v1/audit-logs': {
        get: {
          tags: ['Audit & Compliance'],
          summary: 'Get system audit trail (Requires audit:read - Admin & Auditor only)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Audit log entries' } }
        }
      },
      '/api/v1/system/reset': {
        post: {
          tags: ['System & QA Sandbox'],
          summary: 'Reset in-memory database back to initial seed state',
          responses: {
            200: {
              description: 'Database reset successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Database reset successfully.' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/system/health': {
        get: {
          tags: ['System & QA Sandbox'],
          summary: 'Check API service health',
          responses: { 200: { description: 'Service is healthy' } }
        }
      },
      '/api/v1/system/stats': {
        get: {
          tags: ['System & QA Sandbox'],
          summary: 'Platform stats (book count, orders count, users count, revenue)',
          responses: { 200: { description: 'Platform statistics' } }
        }
      },
      '/api/v1/system/simulate-error': {
        get: {
          tags: ['System & QA Sandbox'],
          summary: 'Simulate HTTP error status code for client resilience testing',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'integer', default: 500 }, description: 'HTTP status to trigger (400, 401, 403, 404, 429, 500, 503)' }
          ],
          responses: {
            default: { description: 'Simulated error payload' }
          }
        }
      }
    }
  },
  apis: [] // Explicitly defined via definition.paths above for 100% complete typing & schema accuracy
};

export const swaggerSpec = swaggerJsdoc(options);
