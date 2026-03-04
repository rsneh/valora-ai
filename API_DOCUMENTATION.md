# Valora.ai API Documentation

## Base URL
```
Production: https://api.valora.ai/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

All authenticated endpoints require a Firebase JWT token in the Authorization header:

```http
Authorization: Bearer <firebase_jwt_token>
```

## API Endpoints

### Authentication

#### Get Current User
```http
GET /users/me
```

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "id": 1,
  "uid": "firebase_uid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "photo_url": "https://example.com/photo.jpg",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### Products

#### List Products
```http
GET /products
```

**Query Parameters:**
- `skip` (integer): Number of items to skip (default: 0)
- `limit` (integer): Maximum items to return (default: 100, max: 100)
- `category` (string): Filter by category key
- `owner_id` (integer): Filter by owner
- `status` (string): Filter by status (active, sold, pending)
- `min_price` (float): Minimum price filter
- `max_price` (float): Maximum price filter
- `search` (string): Search in title and description
- `sort_by` (string): Sort field (created_at, price, title)
- `sort_order` (string): Sort order (asc, desc)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Product Title",
    "description": "Product description",
    "price": 99.99,
    "currency": "USD",
    "category": {
      "id": 1,
      "key": "electronics",
      "name": "Electronics"
    },
    "images": [
      {
        "id": 1,
        "url": "https://storage.googleapis.com/bucket/image.jpg",
        "thumbnail_url": "https://storage.googleapis.com/bucket/thumb.jpg",
        "order": 0
      }
    ],
    "location": {
      "latitude": 32.0853,
      "longitude": 34.7818,
      "address": "Tel Aviv, Israel",
      "city": "Tel Aviv",
      "country": "Israel"
    },
    "status": "active",
    "condition": "used",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "owner": {
      "id": 1,
      "display_name": "John Doe",
      "photo_url": "https://example.com/photo.jpg"
    }
  }
]
```

#### Get Product by ID
```http
GET /products/{product_id}
```

**Path Parameters:**
- `product_id` (integer): Product ID

**Response:**
```json
{
  "id": 1,
  "title": "Product Title",
  "description": "Detailed product description",
  "price": 99.99,
  "currency": "USD",
  "category": { /* category object */ },
  "images": [ /* array of images */ ],
  "location": { /* location object */ },
  "status": "active",
  "condition": "used",
  "ai_generated_description": "AI enhanced description",
  "ai_detected_features": ["feature1", "feature2"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "owner": { /* owner object */ }
}
```

#### Create Product
```http
POST /products
```

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "title": "Product Title",
  "description": "Product description",
  "price": 99.99,
  "currency": "USD",
  "category_id": 1,
  "condition": "used",
  "location": {
    "latitude": 32.0853,
    "longitude": 34.7818,
    "address": "Tel Aviv, Israel"
  }
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Product Title",
  /* ... full product object ... */
}
```

#### Update Product
```http
PUT /products/{product_id}
```

**Headers:**
- `Authorization: Bearer <token>` (required)

**Path Parameters:**
- `product_id` (integer): Product ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 89.99,
  "status": "sold"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Updated Title",
  /* ... updated product object ... */
}
```

#### Delete Product
```http
DELETE /products/{product_id}
```

**Headers:**
- `Authorization: Bearer <token>` (required)

**Path Parameters:**
- `product_id` (integer): Product ID

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

---

### Images

#### Upload Product Images
```http
POST /images/upload
```

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: multipart/form-data`

**Request Body:**
- `files`: Multiple image files (max 10)
- `product_id` (optional): Associate with existing product

**Response:**
```json
{
  "images": [
    {
      "id": 1,
      "url": "https://storage.googleapis.com/bucket/image1.jpg",
      "thumbnail_url": "https://storage.googleapis.com/bucket/thumb1.jpg",
      "ai_analysis": {
        "detected_objects": ["laptop", "desk"],
        "quality_score": 0.95,
        "suggested_category": "electronics"
      }
    }
  ]
}
```

#### Analyze Image with AI
```http
POST /images/analyze
```

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: multipart/form-data`

**Request Body:**
- `file`: Single image file

**Response:**
```json
{
  "analysis": {
    "title_suggestion": "MacBook Pro 16-inch",
    "description_suggestion": "Excellent condition MacBook Pro...",
    "detected_features": [
      "16-inch display",
      "Space Gray color",
      "M1 Pro chip"
    ],
    "suggested_category": "electronics_laptops_computers",
    "suggested_price_range": {
      "min": 1500,
      "max": 2000,
      "currency": "USD"
    },
    "condition_assessment": "like_new",
    "quality_score": 0.92
  }
}
```

---

### Chat

#### Get Chat History
```http
GET /chat/history/{product_id}
```

**Headers:**
- `Authorization: Bearer <token>` (required)

**Path Parameters:**
- `product_id` (integer): Product ID

**Response:**
```json
{
  "product_id": 1,
  "participants": [
    {
      "id": 1,
      "display_name": "John Doe",
      "role": "buyer"
    },
    {
      "id": 2,
      "display_name": "Jane Smith",
      "role": "seller"
    }
  ],
  "messages": [
    {
      "id": 1,
      "content": "Is this still available?",
      "sender_id": 1,
      "sender_role": "buyer",
      "created_at": "2024-01-01T10:00:00Z",
      "ai_generated": false
    },
    {
      "id": 2,
      "content": "Yes, it's available. Would you like to know more?",
      "sender_id": 2,
      "sender_role": "seller",
      "created_at": "2024-01-01T10:01:00Z",
      "ai_generated": true
    }
  ],
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:01:00Z"
}
```

#### Send Chat Message
```http
POST /chat/send
```

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "product_id": 1,
  "content": "What's your best price?",
  "message_type": "text"
}
```

**Response:**
```json
{
  "message": {
    "id": 3,
    "content": "What's your best price?",
    "sender_id": 1,
    "sender_role": "buyer",
    "created_at": "2024-01-01T10:02:00Z"
  },
  "ai_response": {
    "id": 4,
    "content": "I could consider $85 for a quick sale. What do you think?",
    "sender_id": 2,
    "sender_role": "seller",
    "created_at": "2024-01-01T10:02:01Z",
    "ai_generated": true,
    "ai_metadata": {
      "model": "gpt-4",
      "confidence": 0.89,
      "negotiation_stage": "price_discussion"
    }
  }
}
```

---

### Categories

#### List Categories
```http
GET /categories
```

**Query Parameters:**
- `parent_key` (string): Filter by parent category
- `include_children` (boolean): Include subcategories

**Response:**
```json
[
  {
    "id": 1,
    "key": "electronics",
    "parent_key": null,
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "icon": "🔌",
    "children": [
      {
        "id": 2,
        "key": "electronics_laptops_computers",
        "parent_key": "electronics",
        "name": "Laptops & Computers",
        "description": "Portable and desktop computers"
      }
    ]
  }
]
```

#### Get Category AI Descriptions
```http
GET /categories/ai-descriptions
```

**Response:**
```json
[
  {
    "category_key": "electronics",
    "description_for_ai": "Category for electronic devices including smartphones, computers, tablets, gaming consoles, audio equipment, cameras, and smart home devices. Includes both new and used consumer electronics."
  }
]
```

---

### Location

#### Get Location Suggestions
```http
GET /location/suggestions
```

**Headers:**
- `Authorization: Bearer <token>` (required)

**Query Parameters:**
- `query` (string): Search query for location

**Response:**
```json
{
  "suggestions": [
    {
      "display_name": "Tel Aviv, Israel",
      "latitude": 32.0853,
      "longitude": 34.7818,
      "city": "Tel Aviv",
      "country": "Israel",
      "country_code": "IL"
    }
  ]
}
```

#### Get User Location from IP
```http
GET /location/from-ip
```

**Headers:**
- `Authorization: Bearer <token>` (required)
- `X-Forwarded-For` or `X-Real-IP`: Client IP address

**Response:**
```json
{
  "location": {
    "city": "Tel Aviv",
    "region": "Tel Aviv District",
    "country": "Israel",
    "country_code": "IL",
    "latitude": 32.0853,
    "longitude": 34.7818
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "detail": "Error message description",
  "status_code": 400,
  "error_code": "VALIDATION_ERROR"
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|------------|-----------|-------------|
| 400 | VALIDATION_ERROR | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict (e.g., duplicate) |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **Image uploads**: 50 per hour
- **AI operations**: 100 per hour

Rate limit information is included in response headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200
```

## Webhook Events (Future)

The API supports webhooks for real-time event notifications:

### Available Events
- `product.created`
- `product.updated`
- `product.sold`
- `message.received`
- `offer.made`
- `offer.accepted`

### Webhook Payload
```json
{
  "event": "product.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    /* Event-specific data */
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { ValoraClient } from '@valora/sdk';

const client = new ValoraClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.valora.ai/api/v1'
});

// List products
const products = await client.products.list({
  category: 'electronics',
  limit: 20
});

// Create product
const newProduct = await client.products.create({
  title: 'MacBook Pro',
  price: 1999,
  category_id: 1
});
```

### Python
```python
from valora_sdk import ValoraClient

client = ValoraClient(
    api_key='your-api-key',
    base_url='https://api.valora.ai/api/v1'
)

# List products
products = client.products.list(
    category='electronics',
    limit=20
)

# Create product
new_product = client.products.create(
    title='MacBook Pro',
    price=1999,
    category_id=1
)
```

## API Versioning

The API uses URL versioning. The current version is `v1`.

Future versions will be available at:
- `/api/v2`
- `/api/v3`

Deprecated endpoints will be marked with a `Deprecation` header and sunset date.

## Support

For API support, please contact:
- Email: api-support@valora.ai
- Documentation: https://docs.valora.ai
- Status Page: https://status.valora.ai