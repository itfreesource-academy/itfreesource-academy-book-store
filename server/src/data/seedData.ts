import { User, Book, Category, Author, Order, Review, AuditLog, BorrowRecord } from '../types/index.js';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_001',
    username: 'admin',
    password: 'Admin@Pass123',
    email: 'admin@itfreesource-academy.org',
    fullName: 'Alexander Wright',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    currency: 'USD',
    timezone: 'America/New_York',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_002',
    username: 'store_manager',
    password: 'Manager@Pass123',
    email: 'manager@itfreesource-academy.org',
    fullName: 'Sophia Chen',
    role: 'store_manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    createdAt: '2026-01-05T00:00:00.000Z'
  },
  {
    id: 'usr_003',
    username: 'inventory_clerk',
    password: 'Stock@Pass123',
    email: 'inventory@itfreesource-academy.org',
    fullName: 'Marcus Brody',
    role: 'inventory_clerk',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'usr_004',
    username: 'content_editor',
    password: 'Editor@Pass123',
    email: 'editor@itfreesource-academy.org',
    fullName: 'Elena Rostova',
    role: 'content_editor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    createdAt: '2026-01-12T00:00:00.000Z'
  },
  {
    id: 'usr_005',
    username: 'order_fulfillment',
    password: 'Orders@Pass123',
    email: 'fulfillment@itfreesource-academy.org',
    fullName: 'David Miller',
    role: 'order_fulfillment',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'usr_006',
    username: 'support_agent',
    password: 'Support@Pass123',
    email: 'support@itfreesource-academy.org',
    fullName: 'Hannah Taylor',
    role: 'support_agent',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    createdAt: '2026-01-20T00:00:00.000Z'
  },
  {
    id: 'usr_007',
    username: 'book_reviewer',
    password: 'Reviewer@Pass123',
    email: 'reviewer@itfreesource-academy.org',
    fullName: 'Dr. Arthur Sterling',
    role: 'book_reviewer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    currency: 'USD',
    timezone: 'America/New_York',
    createdAt: '2026-01-25T00:00:00.000Z'
  },
  {
    id: 'usr_008',
    username: 'auditor',
    password: 'Audit@Pass123',
    email: 'auditor@itfreesource-academy.org',
    fullName: 'Victoria Vance',
    role: 'auditor',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    createdAt: '2026-01-28T00:00:00.000Z'
  },
  {
    id: 'usr_009',
    username: 'vip_customer',
    password: 'Vip@Pass123',
    email: 'vip.shopper@gmail.com',
    fullName: 'Julian Montgomery',
    role: 'vip_customer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    createdAt: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'usr_010',
    username: 'standard_customer',
    password: 'User@Pass123',
    email: 'standard.customer@outlook.com',
    fullName: 'Emma Watson',
    role: 'standard_customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    createdAt: '2026-02-05T00:00:00.000Z'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_tech',
    name: 'Technology & Programming',
    slug: 'technology',
    description: 'Software engineering, architecture, cloud, TypeScript, and AI engineering.',
    bookCount: 8
  },
  {
    id: 'cat_scifi',
    name: 'Science Fiction',
    slug: 'science-fiction',
    description: 'Speculative fiction, futuristic space exploration, cyberpunk, and cosmic sagas.',
    bookCount: 6
  },
  {
    id: 'cat_biz',
    name: 'Business & Leadership',
    slug: 'business',
    description: 'Executive strategy, startup leadership, product design, and high-stakes management.',
    bookCount: 4
  },
  {
    id: 'cat_psych',
    name: 'Psychology & Growth',
    slug: 'psychology',
    description: 'Cognitive habits, behavioral science, deep work, and peak mental performance.',
    bookCount: 4
  },
  {
    id: 'cat_history',
    name: 'History & Philosophy',
    slug: 'history',
    description: 'Civilization milestones, philosophical ethics, and global world history.',
    bookCount: 3
  }
];

export const INITIAL_AUTHORS: Author[] = [
  {
    id: 'aut_001',
    name: 'Robert C. Martin',
    bio: 'Software engineer and author famously known as Uncle Bob, pioneer of the Agile Manifesto and Clean Code.',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
    nationality: 'American'
  },
  {
    id: 'aut_002',
    name: 'Martin Fowler',
    bio: 'Chief Scientist at ThoughtWorks, author of seminal works on Refactoring and Enterprise Software Architecture.',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    nationality: 'British'
  },
  {
    id: 'aut_003',
    name: 'Frank Herbert',
    bio: 'Celebrated science fiction novelist, creator of the legendary Dune chronicle universe.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    nationality: 'American'
  },
  {
    id: 'aut_004',
    name: 'James Clear',
    bio: 'Writer and speaker focused on habits, decision making, and continuous self-improvement.',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    nationality: 'American'
  },
  {
    id: 'aut_005',
    name: 'Yuval Noah Harari',
    bio: 'Historian, philosopher, and bestselling author exploring the macroscopic trajectory of humanity.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    nationality: 'Israeli'
  },
  {
    id: 'aut_006',
    name: 'Addy Osmani',
    bio: 'Engineering Leader at Google, author of Learning JavaScript Design Patterns and Web Performance.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    nationality: 'Irish'
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book_001',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    isbn: '978-0132350884',
    authorId: 'aut_001',
    authorName: 'Robert C. Martin',
    categoryId: 'cat_tech',
    categoryName: 'Technology & Programming',
    price: 44.99,
    originalPrice: 52.99,
    rating: 4.8,
    reviewCount: 342,
    stock: 48,
    pages: 464,
    publicationDate: '2008-08-01',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e37262?w=500&auto=format&fit=crop&q=80',
    description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. This book is a must-read for any developer looking to write professional, testable, and maintainable software.',
    tags: ['Programming', 'Agile', 'Clean Code', 'Best Practices'],
    isFeatured: true,
    isVipExclusive: false
  },
  {
    id: 'book_002',
    title: 'Refactoring: Improving the Design of Existing Code',
    isbn: '978-0134757599',
    authorId: 'aut_002',
    authorName: 'Martin Fowler',
    categoryId: 'cat_tech',
    categoryName: 'Technology & Programming',
    price: 54.50,
    originalPrice: 59.99,
    rating: 4.9,
    reviewCount: 215,
    stock: 22,
    pages: 448,
    publicationDate: '2018-11-20',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
    description: 'Refactoring is a controlled technique for improving the design of an existing code base. Its essence is applying a series of small behavior-preserving transformations. Fully updated with JavaScript and TypeScript code samples.',
    tags: ['Architecture', 'Refactoring', 'Testing', 'Software Engineering'],
    isFeatured: true,
    isVipExclusive: false
  },
  {
    id: 'book_003',
    title: 'Dune: The Deluxe Collector Edition',
    isbn: '978-0441172719',
    authorId: 'aut_003',
    authorName: 'Frank Herbert',
    categoryId: 'cat_scifi',
    categoryName: 'Science Fiction',
    price: 36.00,
    originalPrice: 42.00,
    rating: 4.9,
    reviewCount: 890,
    stock: 65,
    pages: 896,
    publicationDate: '1965-08-01',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice melange. A triumph of science fiction.',
    tags: ['Sci-Fi', 'Classic', 'Epic', 'Space Opera'],
    isFeatured: true,
    isVipExclusive: false
  },
  {
    id: 'book_004',
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
    isbn: '978-0735211292',
    authorId: 'aut_004',
    authorName: 'James Clear',
    categoryId: 'cat_psych',
    categoryName: 'Psychology & Growth',
    price: 18.99,
    originalPrice: 27.00,
    rating: 4.9,
    reviewCount: 1420,
    stock: 120,
    pages: 320,
    publicationDate: '2018-10-16',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    tags: ['Habits', 'Self-Improvement', 'Psychology', 'Productivity'],
    isFeatured: true,
    isVipExclusive: false
  },
  {
    id: 'book_005',
    title: 'Sapiens: A Brief History of Humankind',
    isbn: '978-0062316097',
    authorId: 'aut_005',
    authorName: 'Yuval Noah Harari',
    categoryId: 'cat_history',
    categoryName: 'History & Philosophy',
    price: 24.95,
    originalPrice: 35.00,
    rating: 4.7,
    reviewCount: 1105,
    stock: 54,
    pages: 464,
    publicationDate: '2014-02-10',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80',
    description: 'From a renowned historian comes a groundbreaking narrative of humanity’s creation and evolution.',
    tags: ['History', 'Anthropology', 'Evolution', 'Philosophy'],
    isFeatured: false,
    isVipExclusive: false
  },
  {
    id: 'book_006',
    title: 'Learning JavaScript Design Patterns (2nd Edition)',
    isbn: '978-1098139872',
    authorId: 'aut_006',
    authorName: 'Addy Osmani',
    categoryId: 'cat_tech',
    categoryName: 'Technology & Programming',
    price: 49.99,
    originalPrice: 55.00,
    rating: 4.8,
    reviewCount: 94,
    stock: 30,
    pages: 350,
    publicationDate: '2023-07-15',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
    description: 'Modern design patterns in JavaScript and TypeScript including Creational, Structural, and Behavioral patterns.',
    tags: ['JavaScript', 'Design Patterns', 'TypeScript', 'Web Dev'],
    isFeatured: true,
    isVipExclusive: false
  },
  {
    id: 'book_007',
    title: 'The Pragmatic Programmer: 20th Anniversary Edition',
    isbn: '978-0135957059',
    authorId: 'aut_001',
    authorName: 'Robert C. Martin',
    categoryId: 'cat_tech',
    categoryName: 'Technology & Programming',
    price: 46.99,
    originalPrice: 59.99,
    rating: 4.9,
    reviewCount: 512,
    stock: 41,
    pages: 352,
    publicationDate: '2019-09-13',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=80',
    description: 'Examines the core process: taking a requirement and producing working, maintainable code that delights users.',
    tags: ['Career', 'Software Engineering', 'Philosophy', 'Craftsmanship'],
    isFeatured: true,
    isVipExclusive: false
  },
  {
    id: 'book_008',
    title: 'Designing Data-Intensive Applications',
    isbn: '978-1449373320',
    authorId: 'aut_002',
    authorName: 'Martin Fowler',
    categoryId: 'cat_tech',
    categoryName: 'Technology & Programming',
    price: 52.00,
    originalPrice: 65.00,
    rating: 5.0,
    reviewCount: 780,
    stock: 18,
    pages: 616,
    publicationDate: '2017-03-16',
    coverImage: 'https://images.unsplash.com/photo-1507842229451-79b1be8d62ee?w=500&auto=format&fit=crop&q=80',
    description: 'Data is at the center of many challenges in system design today. Scale, consistency, reliability, efficiency.',
    tags: ['Distributed Systems', 'Databases', 'Architecture', 'Big Data'],
    isFeatured: true,
    isVipExclusive: false
  },
  {
    id: 'book_009',
    title: 'Foundation & Earth: Complete Galactic Empire Boxset',
    isbn: '978-0553803716',
    authorId: 'aut_003',
    authorName: 'Frank Herbert',
    categoryId: 'cat_scifi',
    categoryName: 'Science Fiction',
    price: 89.99,
    originalPrice: 110.00,
    rating: 4.8,
    reviewCount: 310,
    stock: 14,
    pages: 1240,
    publicationDate: '1986-10-01',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
    description: 'The story of psychohistory, the fall of a twelve-thousand-year-old Galactic Empire.',
    tags: ['Sci-Fi', 'Space', 'Empire', 'Classics'],
    isFeatured: false,
    isVipExclusive: true
  },
  {
    id: 'book_010',
    title: 'Thinking, Fast and Slow',
    isbn: '978-0374533557',
    authorId: 'aut_004',
    authorName: 'James Clear',
    categoryId: 'cat_psych',
    categoryName: 'Psychology & Growth',
    price: 21.50,
    originalPrice: 30.00,
    rating: 4.6,
    reviewCount: 654,
    stock: 35,
    pages: 512,
    publicationDate: '2011-10-25',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=80',
    description: 'Nobel Prize winner Daniel Kahneman takes us on a groundbreaking tour of the mind.',
    tags: ['Psychology', 'Decision Making', 'Cognition', 'Behavioral Economics'],
    isFeatured: false,
    isVipExclusive: false
  },
  {
    id: 'book_011',
    title: 'Zero to One: Notes on Startups, or How to Build the Future',
    isbn: '978-0804139298',
    authorId: 'aut_005',
    authorName: 'Yuval Noah Harari',
    categoryId: 'cat_biz',
    categoryName: 'Business & Leadership',
    price: 19.99,
    originalPrice: 27.00,
    rating: 4.7,
    reviewCount: 540,
    stock: 29,
    pages: 224,
    publicationDate: '2014-09-16',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
    description: 'How to build singular ways to create new things and escape competition.',
    tags: ['Startups', 'Entrepreneurship', 'Venture Capital', 'Business'],
    isFeatured: false,
    isVipExclusive: false
  },
  {
    id: 'book_012',
    title: 'Neuromancer (Sprawl Trilogy 40th Anniversary)',
    isbn: '978-0441569595',
    authorId: 'aut_003',
    authorName: 'Frank Herbert',
    categoryId: 'cat_scifi',
    categoryName: 'Science Fiction',
    price: 26.50,
    originalPrice: 32.00,
    rating: 4.7,
    reviewCount: 420,
    stock: 8,
    pages: 288,
    publicationDate: '1984-07-01',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    description: 'Case was the sharpest data-thief in the matrix until his nervous system was crippled.',
    tags: ['Cyberpunk', 'AI', 'Matrix', 'Cult Classic'],
    isFeatured: false,
    isVipExclusive: false
  }
];

export const INITIAL_BORROWS: BorrowRecord[] = [
  {
    id: 'brw_001',
    userId: 'usr_010',
    username: 'standard_customer',
    bookId: 'book_001',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    bookCover: 'https://images.unsplash.com/photo-1532012164546-f432f2e37262?w=500&auto=format&fit=crop&q=80',
    bookPrice: 44.99,
    borrowDate: '2026-09-10T10:00:00.000Z',
    dueDate: '2026-09-20T10:00:00.000Z', // 10 days
    returnDate: null,
    status: 'active',
    standardFee: 2.00,
    lateFee: 0.00,
    lostFee: 0.00,
    totalFee: 2.00,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z'
  },
  {
    id: 'brw_002',
    userId: 'usr_009',
    username: 'vip_customer',
    bookId: 'book_004',
    bookTitle: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
    bookCover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80',
    bookPrice: 18.99,
    borrowDate: '2026-08-25T14:00:00.000Z',
    dueDate: '2026-09-04T14:00:00.000Z', // Due 10 days later
    returnDate: null,
    status: 'overdue',
    standardFee: 1.60, // 20% VIP discount on $2.00 = $1.60
    lateFee: 0.80, // 10 days overdue * $0.10 - 20% = $0.80
    lostFee: 0.00,
    totalFee: 2.40,
    currency: 'AED',
    timezone: 'Asia/Dubai',
    createdAt: '2026-08-25T14:00:00.000Z',
    updatedAt: '2026-09-14T08:00:00.000Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_001',
    orderNumber: 'ORD-2026-9001',
    userId: 'usr_009',
    username: 'vip_customer',
    items: [
      {
        bookId: 'book_001',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        price: 44.99,
        quantity: 1,
        coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e37262?w=200&auto=format&fit=crop&q=80'
      }
    ],
    subtotal: 44.99,
    discount: 9.00,
    tax: 2.88,
    total: 38.87,
    shippingAddress: {
      fullName: 'Julian Montgomery',
      street: '742 Evergreen Terrace',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'United States'
    },
    deliveryDate: '2026-09-20',
    paymentMethod: 'Credit Card (Stripe Mock)',
    status: 'shipped',
    trackingNumber: 'TRK-98214-WA-FEDEX',
    createdAt: '2026-09-10T14:30:00.000Z',
    updatedAt: '2026-09-12T09:15:00.000Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_001',
    bookId: 'book_001',
    userId: 'usr_007',
    username: 'book_reviewer',
    rating: 5,
    title: 'Essential reading for any software craftsman',
    comment: 'Uncle Bob provides invaluable foundational concepts that every engineer and test automation architect must internalize.',
    status: 'approved',
    createdAt: '2026-02-14T11:20:00.000Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_001',
    timestamp: '2026-09-14T08:00:00.000Z',
    userId: 'usr_001',
    username: 'admin',
    role: 'admin',
    action: 'SYSTEM_BOOT',
    entity: 'System',
    entityId: 'sys_root',
    details: 'Platform initialized with 10 RBAC personas, Multi-Currency (USD, AED, INR, JPY, AUD), and Borrowing engine.',
    ipAddress: '127.0.0.1'
  }
];
